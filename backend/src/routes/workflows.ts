// Barakah AI Agents - Workflow Management API Routes
import express from 'express';
import { z } from 'zod';
import { WorkflowEngine } from '../core/WorkflowEngine';
import { logger } from '../utils/logger';

const router = express.Router();
const workflowEngine = new WorkflowEngine();

// Validation schemas
const executeWorkflowSchema = z.object({
  templateId: z.string(),
  variables: z.record(z.any())
});

// GET /api/workflows/templates - List all workflow templates
router.get('/templates', async (req, res) => {
  try {
    const templates = workflowEngine.getAllTemplates();
    res.json({
      success: true,
      data: templates,
      count: templates.length
    });
  } catch (error: any) {
    logger.error('Error listing workflow templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list workflow templates',
      message: error.message
    });
  }
});

// GET /api/workflows/templates/:id - Get specific workflow template
router.get('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const template = workflowEngine.getTemplate(id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Workflow template not found',
        templateId: id
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error: any) {
    logger.error('Error getting workflow template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get workflow template',
      message: error.message
    });
  }
});

// POST /api/workflows/execute - Execute a workflow
router.post('/execute', async (req, res) => {
  try {
    const validation = executeWorkflowSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: validation.error.errors
      });
    }

    const { templateId, variables } = validation.data;
    const userId = req.headers['x-user-id'] as string || 'anonymous';

    // Start workflow execution
    const executionId = await workflowEngine.executeWorkflow(templateId, variables, userId);

    res.json({
      success: true,
      data: {
        executionId,
        status: 'started',
        message: 'Workflow execution started successfully'
      }
    });

    logger.info(`Workflow ${templateId} execution started: ${executionId}`);

  } catch (error: any) {
    logger.error('Error executing workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute workflow',
      message: error.message
    });
  }
});

// GET /api/workflows/execution/:executionId - Get workflow execution status
router.get('/execution/:executionId', async (req, res) => {
  try {
    const { executionId } = req.params;
    const execution = workflowEngine.getExecution(executionId);

    if (!execution) {
      return res.status(404).json({
        success: false,
        error: 'Workflow execution not found',
        executionId
      });
    }

    // Calculate progress based on completed steps
    const template = workflowEngine.getTemplate(execution.templateId);
    const totalSteps = template?.steps.length || 1;
    const completedSteps = Object.keys(execution.results).length;
    const progress = Math.round((completedSteps / totalSteps) * 100);

    res.json({
      success: true,
      data: {
        ...execution,
        progress,
        totalSteps,
        completedSteps,
        estimatedTimeRemaining: execution.status === 'running' ? 
          `${Math.max(1, totalSteps - completedSteps)} minutes` : null
      }
    });

  } catch (error: any) {
    logger.error('Error getting workflow execution status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get workflow execution status',
      message: error.message
    });
  }
});

// GET /api/workflows/executions/user/:userId - Get user's workflow executions
router.get('/executions/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const executions = workflowEngine.getExecutionsByUser(userId);
    
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
    logger.error('Error getting user workflow executions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user workflow executions',
      message: error.message
    });
  }
});

export { router as workflowRoutes };