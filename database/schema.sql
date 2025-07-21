-- Barakah AI Agents - Database Schema
-- Execute this in Supabase SQL Editor

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'pro', 'enterprise')),
  subscription_status text default 'active' check (subscription_status in ('active', 'cancelled', 'past_due', 'unpaid')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  api_usage_count integer default 0,
  api_usage_limit integer default 5, -- free tier limit
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- User API keys storage (encrypted)
create table public.user_api_keys (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  service_name text not null, -- 'openai', 'gmail', 'stripe', etc.
  api_key_encrypted text not null, -- encrypted with app secret
  api_key_hint text, -- last 4 characters for display
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, service_name)
);

-- Agent executions tracking
create table public.agent_executions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  agent_id text not null,
  agent_name text not null,
  status text default 'running' check (status in ('running', 'completed', 'failed', 'cancelled')),
  progress integer default 0 check (progress >= 0 and progress <= 100),
  input_data jsonb,
  output_data jsonb,
  error_message text,
  execution_time_ms integer,
  cost_saved_usd numeric(10,2) default 0,
  time_saved_minutes integer default 0,
  integrations_used text[], -- array of integration names
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Agent execution steps (detailed workflow tracking)
create table public.execution_steps (
  id uuid default uuid_generate_v4() primary key,
  execution_id uuid references public.agent_executions(id) on delete cascade not null,
  step_name text not null,
  step_type text not null check (step_type in ('think', 'plan', 'execute', 'integrate', 'verify')),
  status text default 'pending' check (status in ('pending', 'running', 'completed', 'failed')),
  input_data jsonb,
  output_data jsonb,
  error_message text,
  duration_ms integer,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- User subscriptions and billing
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  stripe_subscription_id text unique not null,
  stripe_customer_id text not null,
  status text not null,
  tier text not null check (tier in ('free', 'pro', 'enterprise')),
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Usage tracking and analytics
create table public.usage_analytics (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  date date not null,
  agent_executions integer default 0,
  successful_executions integer default 0,
  failed_executions integer default 0,
  total_time_saved_minutes integer default 0,
  total_cost_saved_usd numeric(10,2) default 0,
  integrations_used jsonb default '{}',
  created_at timestamp with time zone default now(),
  unique(user_id, date)
);

-- Admin panel data
create table public.admin_stats (
  id uuid default uuid_generate_v4() primary key,
  date date not null unique,
  total_users integer default 0,
  active_users integer default 0,
  new_signups integer default 0,
  total_executions integer default 0,
  successful_executions integer default 0,
  total_revenue_usd numeric(10,2) default 0,
  mrr_usd numeric(10,2) default 0,
  churn_rate numeric(5,2) default 0,
  created_at timestamp with time zone default now()
);

-- Integration configurations (per user)
create table public.user_integrations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  integration_name text not null,
  configuration jsonb not null default '{}',
  is_active boolean default true,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, integration_name)
);

-- Row Level Security (RLS) Policies
alter table public.users enable row level security;
alter table public.user_api_keys enable row level security;
alter table public.agent_executions enable row level security;
alter table public.execution_steps enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_analytics enable row level security;
alter table public.user_integrations enable row level security;

-- Users can only see/edit their own data
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- API Keys policies
create policy "Users can manage own API keys" on public.user_api_keys
  for all using (auth.uid() = user_id);

-- Agent executions policies
create policy "Users can manage own executions" on public.agent_executions
  for all using (auth.uid() = user_id);

create policy "Users can view own execution steps" on public.execution_steps
  for select using (auth.uid() = (select user_id from public.agent_executions where id = execution_id));

-- Subscriptions policies
create policy "Users can view own subscriptions" on public.subscriptions
  for select using (auth.uid() = user_id);

-- Usage analytics policies
create policy "Users can view own analytics" on public.usage_analytics
  for select using (auth.uid() = user_id);

-- User integrations policies
create policy "Users can manage own integrations" on public.user_integrations
  for all using (auth.uid() = user_id);

-- Admin policies (only for admin role)
create policy "Admins can view all data" on public.admin_stats
  for select using (auth.jwt() ->> 'role' = 'admin');

-- Functions for automatic updates
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update usage counts
create or replace function public.increment_usage_count(user_uuid uuid)
returns void as $$
begin
  update public.users 
  set api_usage_count = api_usage_count + 1,
      updated_at = now()
  where id = user_uuid;
end;
$$ language plpgsql security definer;

-- Function to reset monthly usage (call via cron)
create or replace function public.reset_monthly_usage()
returns void as $$
begin
  update public.users 
  set api_usage_count = 0,
      updated_at = now()
  where subscription_tier = 'free';
end;
$$ language plpgsql security definer;

-- Function to calculate daily analytics
create or replace function public.calculate_daily_analytics(target_date date default current_date)
returns void as $$
begin
  insert into public.usage_analytics (user_id, date, agent_executions, successful_executions, failed_executions, total_time_saved_minutes, total_cost_saved_usd)
  select 
    user_id,
    target_date,
    count(*) as agent_executions,
    count(*) filter (where status = 'completed') as successful_executions,
    count(*) filter (where status = 'failed') as failed_executions,
    coalesce(sum(time_saved_minutes), 0) as total_time_saved_minutes,
    coalesce(sum(cost_saved_usd), 0) as total_cost_saved_usd
  from public.agent_executions
  where date(started_at) = target_date
  group by user_id
  on conflict (user_id, date) do update set
    agent_executions = excluded.agent_executions,
    successful_executions = excluded.successful_executions,
    failed_executions = excluded.failed_executions,
    total_time_saved_minutes = excluded.total_time_saved_minutes,
    total_cost_saved_usd = excluded.total_cost_saved_usd;
end;
$$ language plpgsql security definer;

-- Create indexes for better performance
create index idx_agent_executions_user_id on public.agent_executions(user_id);
create index idx_agent_executions_started_at on public.agent_executions(started_at);
create index idx_agent_executions_status on public.agent_executions(status);
create index idx_usage_analytics_user_date on public.usage_analytics(user_id, date);
create index idx_users_subscription_tier on public.users(subscription_tier);
create index idx_users_stripe_customer_id on public.users(stripe_customer_id);

-- Insert default admin stats
insert into public.admin_stats (date) values (current_date);

-- Comments for documentation
comment on table public.users is 'Extended user profiles with subscription information';
comment on table public.agent_executions is 'Tracks all AI agent workflow executions';
comment on table public.user_api_keys is 'Securely stores user API keys for integrations';
comment on table public.usage_analytics is 'Daily aggregated usage statistics per user';
comment on table public.admin_stats is 'Platform-wide analytics for admin dashboard';