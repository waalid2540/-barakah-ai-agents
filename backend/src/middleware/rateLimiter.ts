// Barakah AI Agents - Rate Limiting Middleware
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
    blockedUntil?: number;
  };
}

class SimpleRateLimiter {
  private store: RateLimitStore = {};
  private points: number;
  private duration: number;
  private blockDuration: number;
  private keyPrefix: string;

  constructor(config: { keyPrefix: string; points: number; duration: number; blockDuration: number }) {
    this.points = config.points;
    this.duration = config.duration * 1000; // Convert to milliseconds
    this.blockDuration = config.blockDuration * 1000; // Convert to milliseconds
    this.keyPrefix = config.keyPrefix;
  }

  async consume(key: string): Promise<void> {
    const fullKey = `${this.keyPrefix}:${key}`;
    const now = Date.now();
    const record = this.store[fullKey];

    // Check if currently blocked
    if (record?.blockedUntil && now < record.blockedUntil) {
      const msBeforeNext = record.blockedUntil - now;
      throw { msBeforeNext };
    }

    // Initialize or reset if duration has passed
    if (!record || now > record.resetTime) {
      this.store[fullKey] = {
        count: 1,
        resetTime: now + this.duration
      };
      return;
    }

    // Increment count
    record.count++;

    // Check if limit exceeded
    if (record.count > this.points) {
      record.blockedUntil = now + this.blockDuration;
      const msBeforeNext = this.blockDuration;
      throw { msBeforeNext };
    }
  }

  async get(key: string) {
    const fullKey = `${this.keyPrefix}:${key}`;
    const record = this.store[fullKey];
    if (!record) return null;

    const now = Date.now();
    const remainingPoints = Math.max(0, this.points - record.count);
    const msBeforeNext = record.resetTime - now;

    return {
      remainingPoints,
      msBeforeNext: Math.max(0, msBeforeNext)
    };
  }
}

// Different rate limits for different endpoints
const rateLimiters = {
  // Agent execution - more restrictive
  execution: new SimpleRateLimiter({
    keyPrefix: 'agent_execution',
    points: 10, // Number of requests
    duration: 60, // Per 60 seconds by IP
    blockDuration: 60, // Block for 60 seconds if limit exceeded
  }),

  // General API - more permissive
  general: new SimpleRateLimiter({
    keyPrefix: 'api_general',
    points: 100, // Number of requests
    duration: 60, // Per 60 seconds by IP
    blockDuration: 30, // Block for 30 seconds if limit exceeded
  }),

  // Authentication - very restrictive
  auth: new SimpleRateLimiter({
    keyPrefix: 'auth',
    points: 5, // Number of requests
    duration: 60, // Per 60 seconds by IP
    blockDuration: 300, // Block for 5 minutes if limit exceeded
  })
};

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.ip || (req.connection as any)?.remoteAddress || 'unknown';
    
    // Determine which rate limiter to use based on endpoint
    let limiter = rateLimiters.general;
    
    if (req.path.includes('/execute') || req.path.includes('/test')) {
      limiter = rateLimiters.execution;
    } else if (req.path.includes('/auth') || req.path.includes('/login')) {
      limiter = rateLimiters.auth;
    }

    await limiter.consume(key);
    
    // Add rate limit headers
    const resRateLimiter = await limiter.get(key);
    if (resRateLimiter) {
      res.set({
        'Retry-After': String(Math.round(resRateLimiter.msBeforeNext / 1000) || 1),
        'X-RateLimit-Limit': String(limiter.points),
        'X-RateLimit-Remaining': String(resRateLimiter.remainingPoints || 0),
        'X-RateLimit-Reset': new Date(Date.now() + resRateLimiter.msBeforeNext).toISOString()
      });
    }

    next();
  } catch (rejRes: any) {
    // Rate limit exceeded
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    
    logger.warn(`Rate limit exceeded for IP: ${req.ip}, endpoint: ${req.path}`);
    
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${secs} seconds.`,
      retryAfter: secs
    });
  }
};