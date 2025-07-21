// Barakah AI Agents - Rate Limiting Middleware
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Different rate limits for different endpoints
const rateLimiters = {
  // Agent execution - more restrictive
  execution: new RateLimiterMemory({
    keyPrefix: 'agent_execution',
    points: 10, // Number of requests
    duration: 60, // Per 60 seconds by IP
    blockDuration: 60, // Block for 60 seconds if limit exceeded
  }),

  // General API - more permissive
  general: new RateLimiterMemory({
    keyPrefix: 'api_general',
    points: 100, // Number of requests
    duration: 60, // Per 60 seconds by IP
    blockDuration: 30, // Block for 30 seconds if limit exceeded
  }),

  // Authentication - very restrictive
  auth: new RateLimiterMemory({
    keyPrefix: 'auth',
    points: 5, // Number of requests
    duration: 60, // Per 60 seconds by IP
    blockDuration: 300, // Block for 5 minutes if limit exceeded
  })
};

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    
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
        'Retry-After': Math.round(resRateLimiter.msBeforeNext / 1000) || 1,
        'X-RateLimit-Limit': limiter.points,
        'X-RateLimit-Remaining': resRateLimiter.remainingPoints || 0,
        'X-RateLimit-Reset': new Date(Date.now() + resRateLimiter.msBeforeNext)
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