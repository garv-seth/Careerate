/**
 * Ejection API Routes
 * 
 * Handles Porter.run-style infrastructure ejection for all cloud providers
 */

import { Router, Request, Response } from 'express';
import { awsEjector } from '../cloud/ejection/awsEjector';
import { azureEjector } from '../cloud/ejection/azureEjector';
import { gcpEjector } from '../cloud/ejection/gcpEjector';
import { isAuthenticated } from '../azureAuth';
import JSZip from 'jszip';

const router = Router();

/**
 * POST /api/eject/:provider/:integrationId
 * Eject from cloud provider (AWS, Azure, or GCP)
 */
router.post('/:provider/:integrationId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { provider, integrationId } = req.params;
    const userId = req.user!.id;

    let result;

    switch (provider.toLowerCase()) {
      case 'aws':
        result = await awsEjector.eject(userId, integrationId);
        break;
      
      case 'azure':
        result = await azureEjector.eject(userId, integrationId);
        break;
      
      case 'gcp':
        result = await gcpEjector.eject(userId, integrationId);
        break;
      
      default:
        return res.status(400).json({
          success: false,
          error: `Unsupported provider: ${provider}`
        });
    }

    res.json({
      success: true,
      message: `Successfully ejected from ${provider}`,
      ...result
    });

  } catch (error) {
    console.error('Ejection error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Ejection failed'
    });
  }
});

/**
 * GET /api/eject/:provider/:integrationId/download
 * Download all IaC templates as ZIP
 */
router.get('/:provider/:integrationId/download', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { provider, integrationId } = req.params;
    const userId = req.user!.id;

    let result;

    switch (provider.toLowerCase()) {
      case 'aws':
        result = await awsEjector.eject(userId, integrationId);
        break;
      
      case 'azure':
        result = await azureEjector.eject(userId, integrationId);
        break;
      
      case 'gcp':
        result = await gcpEjector.eject(userId, integrationId);
        break;
      
      default:
        return res.status(400).json({
          success: false,
          error: `Unsupported provider: ${provider}`
        });
    }

    // Create ZIP file
    const zip = new JSZip();

    // Add master README
    zip.file('README.md', result.instructions);

    // Add each deployment's template
    result.exports.forEach((exp: any, index: number) => {
      const filename = provider === 'gcp' 
        ? `deployment-${index + 1}/main.tf`
        : `deployment-${index + 1}/template.json`;
      
      const content = typeof exp.template === 'string' 
        ? exp.template 
        : JSON.stringify(exp.template, null, 2);
      
      zip.file(filename, content);
      
      if (exp.instructions) {
        zip.file(`deployment-${index + 1}/README.md`, exp.instructions);
      }
    });

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Send as download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="careerate-${provider}-export.zip"`);
    res.send(zipBuffer);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Download failed'
    });
  }
});

/**
 * POST /api/eject/:provider/iam-template
 * Generate IAM setup template (AWS only)
 */
router.post('/:provider/iam-template', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const { externalId, permissions } = req.body;
    const userId = req.user!.id;

    if (provider.toLowerCase() !== 'aws') {
      return res.status(400).json({
        success: false,
        error: 'IAM template only available for AWS'
      });
    }

    const template = awsEjector.generateIAMRoleTemplate(userId, externalId, permissions);

    res.json({
      success: true,
      template,
      cloudFormationUrl: `https://console.aws.amazon.com/cloudformation/home#/stacks/create/template`
    });

  } catch (error) {
    console.error('IAM template error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate IAM template'
    });
  }
});

/**
 * GET /api/eject/status/:integrationId
 * Check if integration is ejected
 */
router.get('/status/:integrationId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { integrationId } = req.params;
    // In production, would check integration status in database
    
    res.json({
      success: true,
      ejected: false,
      message: 'Integration is active'
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Status check failed'
    });
  }
});

export default router;

