# 🚀 Barakah AI Agents - Complete Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Supabase Account** (free tier is fine)
4. **OpenAI API Key**
5. **GitHub Account** for deployment

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and enter project details
4. Wait for project to be ready (2-3 minutes)

### 2. Set Up Database Schema
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the entire content from `database/schema.sql`
3. Click **Run** to execute the schema
4. Verify tables are created in **Table Editor**

### 3. Get Supabase Credentials
1. Go to **Settings** > **API**
2. Copy your **Project URL**
3. Copy your **anon public** key
4. Copy your **service_role** key (keep this secret!)

## 🔧 Environment Variables Setup

### Backend (.env)
Create `backend/.env`:
```env
# Server Configuration
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key-here

# Logging
LOG_LEVEL=info

# Security
JWT_SECRET=your-random-jwt-secret-here
API_SECRET=your-random-api-secret-here
```

### Frontend (.env.local)
Create `frontend/.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-domain.com

# App Configuration
NEXT_PUBLIC_APP_NAME=Barakah AI Agents
NEXT_PUBLIC_APP_DESCRIPTION=Enterprise AI Agents Platform
```

## 🏃‍♂️ Local Development

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Start Development Servers
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

### 3. Test the Application
1. Backend: http://localhost:3001/health
2. Frontend: http://localhost:3000
3. Create test account and verify everything works

## 🚀 Production Deployment

### Option 1: Render (Recommended)

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "🚀 Initial Barakah AI Agents platform"
git branch -M main
git remote add origin https://github.com/yourusername/barakah-ai-agents.git
git push -u origin main
```

2. **Deploy on Render:**
   - Go to [render.com](https://render.com)
   - Connect your GitHub repository
   - Render will auto-detect `render.yaml`
   - Set environment variables in Render dashboard
   - Deploy!

### Option 2: Vercel + Railway

**Frontend (Vercel):**
```bash
cd frontend
npm install -g vercel
vercel --prod
```

**Backend (Railway):**
```bash
cd backend
npm install -g @railway/cli
railway login
railway init
railway up
```

## 🔐 Authentication Setup

### 1. Configure Supabase Auth
1. Go to **Authentication** > **Settings** in Supabase
2. Configure **Site URL**: `https://your-frontend-domain.com`
3. Add **Redirect URLs**: 
   - `https://your-frontend-domain.com/auth/callback`
   - `https://your-frontend-domain.com/reset-password`
4. Enable **Email confirmations** (optional)

### 2. Set Up Email Templates (Optional)
1. Go to **Authentication** > **Email Templates**
2. Customize signup, reset password, and magic link emails
3. Use your brand colors and messaging

## 💳 Payment Integration (Stripe)

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Create account and verify business
3. Get API keys from dashboard

### 2. Add Stripe to Backend
```bash
cd backend
npm install stripe
```

### 3. Configure Webhooks
1. In Stripe dashboard, go to **Webhooks**
2. Add endpoint: `https://your-backend-domain.com/webhooks/stripe`
3. Select events: `customer.subscription.*`, `invoice.*`
4. Copy webhook signing secret

### 4. Update Environment Variables
Add to `backend/.env`:
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PUBLISHABLE_KEY=pk_live_your-publishable-key
```

## 🔄 Admin Panel Setup

### 1. Create Admin User
Run in Supabase SQL Editor:
```sql
-- Update a user to admin role
UPDATE auth.users 
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-admin-email@example.com';
```

### 2. Access Admin Panel
1. Sign in with admin email
2. Go to `/admin` (will be created)
3. Verify admin access works

## 📊 Analytics & Monitoring

### 1. Set Up Monitoring
- Add application monitoring (Sentry, LogRocket)
- Set up uptime monitoring (UptimeRobot)
- Configure error alerts

### 2. Performance Tracking
- Google Analytics 4
- Mixpanel for user events
- Stripe analytics for revenue

## 🧪 Testing Checklist

### Backend Tests
- [ ] Health endpoint responds
- [ ] Authentication works
- [ ] Agent execution works
- [ ] Database operations work
- [ ] Admin endpoints protected

### Frontend Tests
- [ ] Landing page loads
- [ ] Authentication flow works
- [ ] Dashboard displays correctly
- [ ] Agent execution UI works
- [ ] Real-time updates work

### Integration Tests
- [ ] Full signup → execution flow
- [ ] Payment processing (if implemented)
- [ ] Email notifications work
- [ ] Database triggers work correctly

## 🎯 Go-Live Checklist

### Pre-Launch
- [ ] Database schema deployed
- [ ] Environment variables set
- [ ] SSL certificates active
- [ ] Domain configured
- [ ] Analytics tracking set up
- [ ] Error monitoring active
- [ ] Backup strategy implemented

### Launch Day
- [ ] Final testing completed
- [ ] Social media posts scheduled
- [ ] Product Hunt submission ready
- [ ] Customer support ready
- [ ] Monitoring dashboards active

### Post-Launch
- [ ] Monitor for errors
- [ ] Track key metrics
- [ ] Collect user feedback
- [ ] Plan first updates

## 🆘 Troubleshooting

### Common Issues

**1. Database Connection Issues**
- Verify Supabase credentials
- Check Row Level Security policies
- Ensure user has proper permissions

**2. Authentication Problems**
- Check redirect URLs in Supabase
- Verify JWT tokens are valid
- Ensure proper session handling

**3. Agent Execution Failures**
- Verify OpenAI API key is valid
- Check rate limits and quotas
- Monitor error logs for issues

**4. Real-time Updates Not Working**
- Check Supabase real-time is enabled
- Verify channel subscriptions
- Check network connectivity

### Getting Help
- Check Supabase documentation
- Review error logs in dashboard
- Join Supabase Discord for support
- Create GitHub issues for bugs

## 🎉 Success Metrics

Track these KPIs for success:
- **User Signups**: Target 100+ in first month
- **Agent Executions**: Monitor success rates >95%
- **Revenue**: Track MRR growth
- **User Retention**: Aim for >80% weekly retention

Your **Barakah AI Agents** platform is now ready for enterprise success! 🚀💰