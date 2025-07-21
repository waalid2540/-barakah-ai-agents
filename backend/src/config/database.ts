// Barakah AI Agents - Database Configuration
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

// Create Supabase client with service role key for backend operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database interface types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  subscription_status: 'active' | 'cancelled' | 'past_due' | 'unpaid';
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  api_usage_count: number;
  api_usage_limit: number;
  created_at: string;
  updated_at: string;
}

export interface AgentExecution {
  id: string;
  user_id: string;
  agent_id: string;
  agent_name: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  input_data?: any;
  output_data?: any;
  error_message?: string;
  execution_time_ms?: number;
  cost_saved_usd: number;
  time_saved_minutes: number;
  integrations_used: string[];
  started_at: string;
  completed_at?: string;
  created_at: string;
}

export interface ExecutionStep {
  id: string;
  execution_id: string;
  step_name: string;
  step_type: 'think' | 'plan' | 'execute' | 'integrate' | 'verify';
  status: 'pending' | 'running' | 'completed' | 'failed';
  input_data?: any;
  output_data?: any;
  error_message?: string;
  duration_ms?: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface UserApiKey {
  id: string;
  user_id: string;
  service_name: string;
  api_key_encrypted: string;
  api_key_hint?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: string;
  tier: 'free' | 'pro' | 'enterprise';
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsageAnalytics {
  id: string;
  user_id: string;
  date: string;
  agent_executions: number;
  successful_executions: number;
  failed_executions: number;
  total_time_saved_minutes: number;
  total_cost_saved_usd: number;
  integrations_used: Record<string, number>;
  created_at: string;
}

// Database service class
export class DatabaseService {
  
  // User operations
  async createUser(userData: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) {
      logger.error('Error creating user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data;
  }

  async getUserById(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      logger.error('Error fetching user:', error);
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      logger.error('Error fetching user by email:', error);
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Error updating user:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data;
  }

  async incrementUsageCount(userId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_usage_count', {
      user_uuid: userId
    });

    if (error) {
      logger.error('Error incrementing usage count:', error);
      throw new Error(`Failed to increment usage: ${error.message}`);
    }
  }

  async checkUsageLimit(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) throw new Error('User not found');

    return user.api_usage_count < user.api_usage_limit;
  }

  // Agent execution operations
  async createExecution(executionData: Partial<AgentExecution>): Promise<AgentExecution> {
    const { data, error } = await supabase
      .from('agent_executions')
      .insert(executionData)
      .select()
      .single();

    if (error) {
      logger.error('Error creating execution:', error);
      throw new Error(`Failed to create execution: ${error.message}`);
    }

    return data;
  }

  async updateExecution(executionId: string, updates: Partial<AgentExecution>): Promise<AgentExecution> {
    const { data, error } = await supabase
      .from('agent_executions')
      .update(updates)
      .eq('id', executionId)
      .select()
      .single();

    if (error) {
      logger.error('Error updating execution:', error);
      throw new Error(`Failed to update execution: ${error.message}`);
    }

    return data;
  }

  async getExecution(executionId: string): Promise<AgentExecution | null> {
    const { data, error } = await supabase
      .from('agent_executions')
      .select('*')
      .eq('id', executionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      logger.error('Error fetching execution:', error);
      throw new Error(`Failed to fetch execution: ${error.message}`);
    }

    return data;
  }

  async getUserExecutions(userId: string, limit = 50, offset = 0): Promise<AgentExecution[]> {
    const { data, error } = await supabase
      .from('agent_executions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Error fetching user executions:', error);
      throw new Error(`Failed to fetch executions: ${error.message}`);
    }

    return data || [];
  }

  // Execution steps operations
  async createExecutionStep(stepData: Partial<ExecutionStep>): Promise<ExecutionStep> {
    const { data, error } = await supabase
      .from('execution_steps')
      .insert(stepData)
      .select()
      .single();

    if (error) {
      logger.error('Error creating execution step:', error);
      throw new Error(`Failed to create execution step: ${error.message}`);
    }

    return data;
  }

  async updateExecutionStep(stepId: string, updates: Partial<ExecutionStep>): Promise<ExecutionStep> {
    const { data, error } = await supabase
      .from('execution_steps')
      .update(updates)
      .eq('id', stepId)
      .select()
      .single();

    if (error) {
      logger.error('Error updating execution step:', error);
      throw new Error(`Failed to update execution step: ${error.message}`);
    }

    return data;
  }

  async getExecutionSteps(executionId: string): Promise<ExecutionStep[]> {
    const { data, error } = await supabase
      .from('execution_steps')
      .select('*')
      .eq('execution_id', executionId)
      .order('created_at', { ascending: true });

    if (error) {
      logger.error('Error fetching execution steps:', error);
      throw new Error(`Failed to fetch execution steps: ${error.message}`);
    }

    return data || [];
  }

  // Analytics operations
  async getUserAnalytics(userId: string, days = 30): Promise<UsageAnalytics[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('usage_analytics')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) {
      logger.error('Error fetching user analytics:', error);
      throw new Error(`Failed to fetch analytics: ${error.message}`);
    }

    return data || [];
  }

  // Admin operations
  async getAdminStats(): Promise<any> {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get active users (used service in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: activeUsers } = await supabase
      .from('agent_executions')
      .select('user_id', { count: 'exact', head: true })
      .gte('started_at', sevenDaysAgo.toISOString());

    // Get today's executions
    const today = new Date().toISOString().split('T')[0];
    const { count: todayExecutions } = await supabase
      .from('agent_executions')
      .select('*', { count: 'exact', head: true })
      .gte('started_at', `${today}T00:00:00Z`);

    // Get revenue data (would integrate with Stripe)
    const { count: proUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_tier', 'pro');

    const { count: enterpriseUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_tier', 'enterprise');

    const estimatedMRR = (proUsers || 0) * 19.99 + (enterpriseUsers || 0) * 99;

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      todayExecutions: todayExecutions || 0,
      proUsers: proUsers || 0,
      enterpriseUsers: enterpriseUsers || 0,
      estimatedMRR
    };
  }

  async getAllUsers(limit = 100, offset = 0): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Error fetching all users:', error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return data || [];
  }

  // API Key operations (with encryption)
  async storeUserApiKey(userId: string, serviceName: string, apiKey: string): Promise<UserApiKey> {
    // In production, encrypt the API key before storing
    const encryptedKey = this.encryptApiKey(apiKey);
    const hint = apiKey.slice(-4);

    const { data, error } = await supabase
      .from('user_api_keys')
      .upsert({
        user_id: userId,
        service_name: serviceName,
        api_key_encrypted: encryptedKey,
        api_key_hint: hint,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      logger.error('Error storing API key:', error);
      throw new Error(`Failed to store API key: ${error.message}`);
    }

    return data;
  }

  async getUserApiKey(userId: string, serviceName: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('user_api_keys')
      .select('api_key_encrypted')
      .eq('user_id', userId)
      .eq('service_name', serviceName)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      logger.error('Error fetching API key:', error);
      throw new Error(`Failed to fetch API key: ${error.message}`);
    }

    return this.decryptApiKey(data.api_key_encrypted);
  }

  // Simple encryption/decryption (use proper encryption in production)
  private encryptApiKey(apiKey: string): string {
    // In production, use proper encryption like AES-256
    return Buffer.from(apiKey).toString('base64');
  }

  private decryptApiKey(encryptedKey: string): string {
    // In production, use proper decryption
    return Buffer.from(encryptedKey, 'base64').toString('utf8');
  }
}

// Export singleton instance
export const db = new DatabaseService();

logger.info('✅ Database service initialized');