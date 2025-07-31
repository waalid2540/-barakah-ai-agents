// Barakah AI Agents - Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Only throw error on client-side runtime, not during build
if (typeof window !== 'undefined' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
  console.warn('Supabase environment variables not configured - authentication features will be limited');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  subscription_status: 'active' | 'cancelled' | 'past_due' | 'unpaid';
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

// Auth helpers
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signUp = async (email: string, password: string, fullName?: string) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });
};

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password
  });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const resetPassword = async (email: string) => {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });
};

// Database helpers
export const getUserProfile = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
};

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }

  return data;
};

export const getUserExecutions = async (userId: string, limit = 50): Promise<AgentExecution[]> => {
  const { data, error } = await supabase
    .from('agent_executions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching user executions:', error);
    return [];
  }

  return data || [];
};

export const getUserAnalytics = async (userId: string, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('usage_analytics')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching user analytics:', error);
    return [];
  }

  return data || [];
};

// Real-time subscriptions
export const subscribeToExecutions = (userId: string, callback: (execution: AgentExecution) => void) => {
  return supabase
    .channel('user-executions')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'agent_executions',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        callback(payload.new as AgentExecution);
      }
    )
    .subscribe();
};

export const subscribeToExecutionSteps = (executionId: string, callback: (step: any) => void) => {
  return supabase
    .channel('execution-steps')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'execution_steps',
        filter: `execution_id=eq.${executionId}`
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();
};