// Barakah AI Agents - Agent Management API Routes
import express, { Request, Response } from 'express';
import { z } from 'zod';
import { AgentFramework } from '../core/AgentFramework';
import { logger } from '../utils/logger';

const router = express.Router();
const agentFramework = new AgentFramework();

// Validation schemas
const executeAgentSchema = z.object({
  agentId: z.string(),
  input: z.any(),
  apiKeys: z.record(z.string()).optional()
});

// GET /api/agents - List all available agents
router.get('/', async (req: Request, res: Response) => {
  try {
    const agents = agentFramework.getAllAgents();
    res.json({
      success: true,
      data: agents,
      count: agents.length
    });
  } catch (error: any) {
    logger.error('Error listing agents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list agents',
      message: error.message
    });
  }
});

// GET /api/agents/:id - Get specific agent details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const agent = agentFramework.getAgent(id);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
        agentId: id
      });
    }

    res.json({
      success: true,
      data: agent
    });
  } catch (error: any) {
    logger.error('Error getting agent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get agent',
      message: error.message
    });
  }
});

// POST /api/agents/:id/execute - Execute an agent
router.post('/:id/execute', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validation = executeAgentSchema.safeParse({
      agentId: id,
      ...req.body
    });

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: validation.error.errors
      });
    }

    const { input, apiKeys } = validation.data;
    const userId = req.headers['x-user-id'] as string || 'anonymous';

    // Start agent execution
    const executionId = await agentFramework.executeAgent(id, userId, input, apiKeys);

    res.json({
      success: true,
      data: {
        executionId,
        status: 'started',
        message: 'Agent execution started successfully'
      }
    });

    logger.info(`Agent ${id} execution started: ${executionId}`);

  } catch (error: any) {
    logger.error('Error executing agent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute agent',
      message: error.message
    });
  }
});

// GET /api/agents/execution/:executionId - Get execution status
router.get('/execution/:executionId', async (req: Request, res: Response) => {
  try {
    const { executionId } = req.params;
    const execution = agentFramework.getExecution(executionId);

    if (!execution) {
      return res.status(404).json({
        success: false,
        error: 'Execution not found',
        executionId
      });
    }

    // Calculate progress
    const totalSteps = 5; // Standard agent workflow steps
    const completedSteps = execution.steps.filter(s => s.status === 'completed').length;
    const progress = Math.round((completedSteps / totalSteps) * 100);

    res.json({
      success: true,
      data: {
        ...execution,
        progress,
        currentStep: execution.steps.find(s => s.status === 'running')?.description || 'Preparing...',
        estimatedTimeRemaining: execution.status === 'running' ? '2-3 minutes' : null
      }
    });

  } catch (error: any) {
    logger.error('Error getting execution status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get execution status',
      message: error.message
    });
  }
});

// GET /api/agents/executions/user/:userId - Get user's executions
router.get('/executions/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const executions = agentFramework.getExecutionsByUser(userId);
    
    // Paginate results
    const paginatedExecutions = executions
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(Number(offset), Number(offset) + Number(limit));

    res.json({
      success: true,
      data: paginatedExecutions,
      pagination: {
        total: executions.length,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + Number(limit) < executions.length
      }
    });

  } catch (error: any) {
    logger.error('Error getting user executions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user executions',
      message: error.message
    });
  }
});

// POST /api/agents/:id/test - Test agent with sample data
router.post('/:id/test', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const agent = agentFramework.getAgent(id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
        agentId: id
      });
    }

    // Provide sample test data based on agent type
    const testData = getTestDataForAgent(id);
    const userId = 'test-user';

    const executionId = await agentFramework.executeAgent(id, userId, testData);

    res.json({
      success: true,
      data: {
        executionId,
        testData,
        message: 'Test execution started successfully'
      }
    });

  } catch (error: any) {
    logger.error('Error testing agent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test agent',
      message: error.message
    });
  }
});

// Helper function to generate test data
function getTestDataForAgent(agentId: string): any {
  switch (agentId) {
    case 'blog-publisher':
      return {
        topic: 'The Future of AI in Business Automation',
        audience: 'Business owners and entrepreneurs',
        keywords: ['AI automation', 'business efficiency', 'digital transformation'],
        platforms: ['linkedin', 'facebook', 'twitter']
      };
    
    case 'email-campaign':
      return {
        campaignType: 'product-announcement',
        subject: 'Introducing Our Revolutionary AI Agents Platform',
        audience: 'existing-customers',
        personalizedElements: ['name', 'company', 'industry']
      };
    
    case 'product-launch':
      return {
        productName: 'Barakah AI Agents Premium',
        price: 99.99,
        description: 'Enterprise-grade AI agents for business automation',
        targetMarket: 'Small to medium businesses looking to scale with AI'
      };
    
    default:
      return {
        message: 'This is a test execution for agent: ' + agentId,
        timestamp: new Date().toISOString()
      };
  }
}

export { router as agentRoutes };