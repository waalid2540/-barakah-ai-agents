// Barakah AI Agents - Backend API Server
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { agentRoutes } from './routes/agents';
import { workflowRoutes } from './routes/workflows';
import { integrationRoutes } from './routes/integrations';
import { analyticsRoutes } from './routes/analytics';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';
import { AgentFramework } from './core/AgentFramework';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Agent Framework lazily for health checks
let agentFramework: AgentFramework;

function getAgentFramework(): AgentFramework {
  if (!agentFramework) {
    agentFramework = new AgentFramework();
  }
  return agentFramework;
}

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
app.use(rateLimiter);

// Logging
app.use(morgan('combined', { stream: { write: (message: string) => logger.info(message.trim()) } }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'Barakah AI Agents API',
    version: '1.0.0',
    status: 'online',
    message: 'Welcome to Barakah AI Agents API',
    endpoints: {
      health: '/health',
      agents: '/api/agents',
      workflows: '/api/workflows',
      integrations: '/api/integrations',
      analytics: '/api/analytics'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  const systemStatus = getAgentFramework().getSystemStatus();
  res.json({ 
    status: 'healthy', 
    service: 'Barakah AI Agents API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    systems: systemStatus,
    environment: {
      node_env: process.env.NODE_ENV || 'development',
      openai_configured: !!process.env.OPENAI_API_KEY
    }
  });
});

// API Routes
app.use('/api/agents', agentRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

app.listen(Number(PORT), () => {
  logger.info(`🤖 Barakah AI Agents API server running on port ${PORT}`);
  logger.info(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`✨ Ready to execute intelligent workflows`);
});

export default app;