// Barakah AI Agents - Integration Management API Routes
import express from 'express';
import { IntegrationHub } from '../core/IntegrationHub';
import { logger } from '../utils/logger';

const router = express.Router();
const integrationHub = new IntegrationHub();

// GET /api/integrations - List all available integrations
router.get('/', async (req, res) => {
  try {
    const integrations = integrationHub.getAllIntegrations();
    res.json({
      success: true,
      data: integrations,
      count: integrations.length
    });
  } catch (error: any) {
    logger.error('Error listing integrations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list integrations',
      message: error.message
    });
  }
});

// GET /api/integrations/:id - Get specific integration details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const integration = integrationHub.getIntegration(id);
    
    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found',
        integrationId: id
      });
    }

    res.json({
      success: true,
      data: integration
    });
  } catch (error: any) {
    logger.error('Error getting integration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get integration',
      message: error.message
    });
  }
});

// POST /api/integrations/:id/test - Test integration with sample data
router.post('/:id/test', async (req, res) => {
  try {
    const { id } = req.params;
    const { apiKeys, testData } = req.body;

    const integration = integrationHub.getIntegration(id);
    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found',
        integrationId: id
      });
    }

    // Create test input
    const testInput = {
      result: {
        deliverable: testData || `Test data for ${integration.name} integration`
      },
      apiKeys: apiKeys || {}
    };

    // Execute integration test
    const result = await integrationHub.execute(id, testInput);

    res.json({
      success: true,
      data: result,
      message: `Integration ${integration.name} test completed`
    });

    logger.info(`Integration ${id} test executed: ${result.success ? 'SUCCESS' : 'FAILED'}`);

  } catch (error: any) {
    logger.error('Error testing integration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test integration',
      message: error.message
    });
  }
});

// POST /api/integrations/validate-keys - Validate API keys for integrations
router.post('/validate-keys', async (req, res) => {
  try {
    const { integrationId, apiKeys } = req.body;

    if (!integrationId || !apiKeys) {
      return res.status(400).json({
        success: false,
        error: 'Missing integrationId or apiKeys'
      });
    }

    const integration = integrationHub.getIntegration(integrationId);
    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found',
        integrationId
      });
    }

    // Check if all required keys are provided
    const missingKeys = integration.requiredKeys.filter(key => !apiKeys[key]);
    
    if (missingKeys.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required API keys',
        missingKeys,
        requiredKeys: integration.requiredKeys
      });
    }

    // For now, just validate presence. In production, would test actual API calls
    res.json({
      success: true,
      data: {
        valid: true,
        integration: integrationId,
        providedKeys: Object.keys(apiKeys),
        requiredKeys: integration.requiredKeys
      },
      message: 'API keys validation successful'
    });

  } catch (error: any) {
    logger.error('Error validating API keys:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate API keys',
      message: error.message
    });
  }
});

// GET /api/integrations/categories/:type - Get integrations by type
router.get('/categories/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const allIntegrations = integrationHub.getAllIntegrations();
    
    const filteredIntegrations = allIntegrations.filter(
      integration => integration.type === type
    );

    res.json({
      success: true,
      data: filteredIntegrations,
      count: filteredIntegrations.length,
      category: type
    });

  } catch (error: any) {
    logger.error('Error getting integrations by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get integrations by category',
      message: error.message
    });
  }
});

export { router as integrationRoutes };