// Barakah AI Agents - Authentication Middleware
import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';
import { db } from '../config/database';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

// Create Supabase client for auth verification
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
    subscription_tier?: string;
  };
}

// JWT token verification middleware
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
        message: 'Please provide a valid authentication token'
      });
    }

    // Verify JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Authentication token is invalid or expired'
      });
    }

    // Get user details from database
    const dbUser = await db.getUserById(user.id);
    if (!dbUser) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
        message: 'User account not found in database'
      });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email!,
      role: user.app_metadata?.role || 'user',
      subscription_tier: dbUser.subscription_tier
    };

    logger.info(`Authenticated user: ${user.email} (${dbUser.subscription_tier})`);
    next();

  } catch (error: any) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: 'Failed to authenticate user'
    });
  }
};

// Optional authentication (for public endpoints that can benefit from user context)
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        const dbUser = await db.getUserById(user.id);
        if (dbUser) {
          req.user = {
            id: user.id,
            email: user.email!,
            role: user.app_metadata?.role || 'user',
            subscription_tier: dbUser.subscription_tier
          };
        }
      }
    }

    next();
  } catch (error: any) {
    // For optional auth, we continue even if auth fails
    logger.warn('Optional auth failed:', error.message);
    next();
  }
};

// Admin role verification
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required',
      message: 'This endpoint requires administrator privileges'
    });
  }

  next();
};

// Subscription tier verification
export const requireSubscription = (requiredTier: 'pro' | 'enterprise') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const user = await db.getUserById(req.user.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check subscription status
    if (user.subscription_status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Subscription required',
        message: 'Please activate your subscription to use this feature',
        subscription_status: user.subscription_status
      });
    }

    // Check tier requirements
    const tierHierarchy = { 'free': 0, 'pro': 1, 'enterprise': 2 };
    const userTierLevel = tierHierarchy[user.subscription_tier as keyof typeof tierHierarchy];
    const requiredTierLevel = tierHierarchy[requiredTier];

    if (userTierLevel < requiredTierLevel) {
      return res.status(403).json({
        success: false,
        error: 'Upgrade required',
        message: `This feature requires ${requiredTier} subscription or higher`,
        current_tier: user.subscription_tier,
        required_tier: requiredTier
      });
    }

    next();
  };
};

// Usage limit verification
export const checkUsageLimit = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  try {
    const canUse = await db.checkUsageLimit(req.user.id);
    
    if (!canUse) {
      const user = await db.getUserById(req.user.id);
      return res.status(429).json({
        success: false,
        error: 'Usage limit exceeded',
        message: `You have reached your monthly limit of ${user?.api_usage_limit} executions`,
        current_usage: user?.api_usage_count,
        usage_limit: user?.api_usage_limit,
        subscription_tier: user?.subscription_tier,
        upgrade_message: user?.subscription_tier === 'free' ? 
          'Upgrade to Pro for unlimited executions at $19.99/month' : null
      });
    }

    next();
  } catch (error: any) {
    logger.error('Usage limit check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check usage limit',
      message: error.message
    });
  }
};

// Rate limiting by subscription tier
export const tierBasedRateLimit = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Get rate limit based on subscription tier
  const getRateLimit = (tier: string) => {
    switch (tier) {
      case 'enterprise': return { requests: 1000, window: 60 }; // 1000/min
      case 'pro': return { requests: 100, window: 60 }; // 100/min
      case 'free': return { requests: 10, window: 60 }; // 10/min
      default: return { requests: 5, window: 60 }; // 5/min for unauthenticated
    }
  };

  const tier = req.user?.subscription_tier || 'free';
  const limits = getRateLimit(tier);

  // Add rate limit info to headers
  res.set({
    'X-RateLimit-Tier': tier,
    'X-RateLimit-Limit': limits.requests.toString(),
    'X-RateLimit-Window': limits.window.toString()
  });

  next();
};

// Helper function to extract user ID from various sources
export const extractUserId = (req: Request): string | null => {
  // From authenticated user
  const authReq = req as AuthenticatedRequest;
  if (authReq.user?.id) return authReq.user.id;

  // From headers (for service-to-service calls)
  const userIdHeader = req.headers['x-user-id'] as string;
  if (userIdHeader) return userIdHeader;

  // From query params (for webhooks)
  const userIdQuery = req.query.userId as string;
  if (userIdQuery) return userIdQuery;

  return null;
};