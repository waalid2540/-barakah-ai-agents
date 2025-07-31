# 🚀 Render Deployment Troubleshooting Guide

## ✅ Quick Fix for Current Error

The application is failing because environment variables are missing. Here's how to fix it:

### 1. **Set Environment Variables in Render Dashboard**

Go to your Render service dashboard and set these **required** environment variables:

#### Backend Service Environment Variables:
```
OPENAI_API_KEY=your_openai_api_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
```

#### Frontend Service Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_NAME=Barakah AI Agents
NEXT_PUBLIC_APP_DESCRIPTION=Enterprise AI Agents Platform
NODE_ENV=production
```

### 2. **Application Now Handles Missing API Keys Gracefully**

✅ **Good News**: The application has been updated to handle missing OpenAI API keys gracefully:

- If `OPENAI_API_KEY` is missing, the app will start but show mock responses
- The `/health` endpoint will show system status
- You can deploy first, then add the API key later

### 3. **Deployment Steps**

1. **Push your updated code** (with the fixes applied)
2. **Set environment variables** in Render dashboard
3. **Trigger a new deployment**
4. **Check health endpoint**: `https://your-app.render.com/health`

## 🔧 Environment Variable Guide

### **Required for Basic Functionality:**
- `NODE_ENV=production`
- `PORT=3001` (backend)

### **Required for Database:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (backend)
- `NEXT_PUBLIC_SUPABASE_URL` - Same as above (frontend)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anonymous key (frontend)

### **Required for AI Features:**
- `OPENAI_API_KEY` - Your OpenAI API key

### **Optional:**
- `LOG_LEVEL=info`
- `FRONTEND_URL` (auto-set by render.yaml)
- `NEXT_PUBLIC_API_URL` (auto-set by render.yaml)

## 🚨 Common Issues & Solutions

### **Issue 1: OpenAI API Key Missing**
```
OpenAIError: The OPENAI_API_KEY environment variable is missing
```
**Solution**: Set `OPENAI_API_KEY` in Render dashboard

### **Issue 2: Build Failures**
```
npm ERR! missing script: build
```
**Solution**: Ensure build commands in render.yaml point to correct directories

### **Issue 3: Port Issues**
```
Error: listen EADDRINUSE :::3000
```
**Solution**: Render automatically assigns ports - don't hardcode them

### **Issue 4: Supabase Connection Issues**
```
Error: Invalid API URL or key
```
**Solution**: Verify Supabase URL and keys are correct

## 📋 Health Check

After deployment, check: `https://your-app.render.com/health`

Expected response:
```json
{
  "status": "healthy",
  "service": "Barakah AI Agents API",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0",
  "systems": {
    "openai": true,
    "integrations": true,
    "message": "All systems operational"
  },
  "environment": {
    "node_env": "production",
    "openai_configured": true
  }
}
```

## 🔄 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Environment variables set in Render
- [ ] Supabase project configured
- [ ] OpenAI API key obtained
- [ ] Build commands correct in render.yaml
- [ ] Health check passes
- [ ] Frontend can connect to backend

## 💡 Pro Tips

1. **Deploy in stages**: Deploy without API keys first, then add them
2. **Use health check**: Monitor `/health` endpoint for system status
3. **Check logs**: Render provides detailed deployment and runtime logs
4. **Environment separation**: Use different Supabase projects for staging/production

## 🆘 Still Having Issues?

1. Check Render deployment logs
2. Verify all environment variables are set
3. Test health endpoint
4. Check GitHub repository permissions
5. Ensure all dependencies are in package.json

---

**The app is now resilient and will start even with missing environment variables!**