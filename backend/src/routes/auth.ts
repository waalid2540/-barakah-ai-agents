// Barakah AI Agents - Authentication Routes
import express from 'express';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { db } from '../config/database';
import { logger } from '../utils/logger';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Validation schemas
const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2).optional()
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const resetPasswordSchema = z.object({
  email: z.string().email()
});

const updatePasswordSchema = z.object({
  password: z.string().min(8),
  accessToken: z.string()
});

// POST /api/auth/signup - User registration
router.post('/signup', async (req, res) => {
  try {
    const validation = signUpSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: validation.error.errors
      });
    }

    const { email, password, fullName } = validation.data;

    // Check if user already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (error) {
      logger.error('Supabase signup error:', error);
      return res.status(400).json({
        success: false,
        error: 'Registration failed',
        message: error.message
      });
    }

    if (!data.user) {
      return res.status(400).json({
        success: false,
        error: 'Registration failed',
        message: 'Failed to create user account'
      });
    }

    // User profile will be created automatically via database trigger

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          emailConfirmed: data.user.email_confirmed_at !== null
        },
        session: data.session,
        message: data.user.email_confirmed_at 
          ? 'Account created successfully'
          : 'Account created. Please check your email to confirm your account.'
      }
    });

    logger.info(`New user registered: ${email}`);

  } catch (error: any) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: 'Internal server error during registration'
    });
  }
});

// POST /api/auth/signin - User login
router.post('/signin', async (req, res) => {
  try {
    const validation = signInSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: validation.error.errors
      });
    }

    const { email, password } = validation.data;

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      logger.warn(`Failed login attempt for: ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    if (!data.user || !data.session) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Login failed'
      });
    }

    // Get user profile from database
    const userProfile = await db.getUserById(data.user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          fullName: userProfile?.full_name,
          subscriptionTier: userProfile?.subscription_tier || 'free',
          usageCount: userProfile?.api_usage_count || 0,
          usageLimit: userProfile?.api_usage_limit || 5
        },
        session: data.session,
        message: 'Login successful'
      }
    });

    logger.info(`User logged in: ${email}`);

  } catch (error: any) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: 'Internal server error during login'
    });
  }
});

// POST /api/auth/signout - User logout
router.post('/signout', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error('Signout error:', error);
      return res.status(400).json({
        success: false,
        error: 'Signout failed',
        message: error.message
      });
    }

    res.json({
      success: true,
      message: 'Signed out successfully'
    });

    logger.info(`User signed out: ${req.user?.email}`);

  } catch (error: any) {
    logger.error('Signout error:', error);
    res.status(500).json({
      success: false,
      error: 'Signout failed',
      message: 'Internal server error during signout'
    });
  }
});

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required'
      });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error) {
      return res.status(401).json({
        success: false,
        error: 'Token refresh failed',
        message: error.message
      });
    }

    res.json({
      success: true,
      data: {
        session: data.session,
        message: 'Token refreshed successfully'
      }
    });

  } catch (error: any) {
    logger.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Token refresh failed',
      message: 'Internal server error during token refresh'
    });
  }
});

// POST /api/auth/forgot-password - Password reset request
router.post('/forgot-password', async (req, res) => {
  try {
    const validation = resetPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address',
        details: validation.error.errors
      });
    }

    const { email } = validation.data;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });

    if (error) {
      logger.error('Password reset error:', error);
      return res.status(400).json({
        success: false,
        error: 'Password reset failed',
        message: error.message
      });
    }

    res.json({
      success: true,
      message: 'Password reset instructions sent to your email'
    });

    logger.info(`Password reset requested for: ${email}`);

  } catch (error: any) {
    logger.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      error: 'Password reset failed',
      message: 'Internal server error during password reset'
    });
  }
});

// POST /api/auth/update-password - Update password with access token
router.post('/update-password', async (req, res) => {
  try {
    const validation = updatePasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: validation.error.errors
      });
    }

    const { password, accessToken } = validation.data;

    // Set session with access token
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: '' // Not needed for password update
    });

    if (sessionError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid access token',
        message: sessionError.message
      });
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      logger.error('Password update error:', error);
      return res.status(400).json({
        success: false,
        error: 'Password update failed',
        message: error.message
      });
    }

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

    logger.info('User password updated successfully');

  } catch (error: any) {
    logger.error('Password update error:', error);
    res.status(500).json({
      success: false,
      error: 'Password update failed',
      message: 'Internal server error during password update'
    });
  }
});

// GET /api/auth/profile - Get user profile
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userProfile = await db.getUserById(req.user.id);
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: userProfile.id,
        email: userProfile.email,
        fullName: userProfile.full_name,
        avatarUrl: userProfile.avatar_url,
        subscriptionTier: userProfile.subscription_tier,
        subscriptionStatus: userProfile.subscription_status,
        usageCount: userProfile.api_usage_count,
        usageLimit: userProfile.api_usage_limit,
        createdAt: userProfile.created_at
      }
    });

  } catch (error: any) {
    logger.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
      message: error.message
    });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { fullName, avatarUrl } = req.body;

    const updatedUser = await db.updateUser(req.user.id, {
      full_name: fullName,
      avatar_url: avatarUrl
    });

    res.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.full_name,
        avatarUrl: updatedUser.avatar_url,
        subscriptionTier: updatedUser.subscription_tier
      },
      message: 'Profile updated successfully'
    });

    logger.info(`Profile updated for user: ${req.user.email}`);

  } catch (error: any) {
    logger.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
      message: error.message
    });
  }
});

export { router as authRoutes };