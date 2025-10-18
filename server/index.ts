import dotenv from 'dotenv';
dotenv.config();

// Initialize Application Insights FIRST (before other imports)
import { initializeApplicationInsights } from "./services/applicationInsights";
initializeApplicationInsights();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import agentRoutes from "./routes/agentRoutes";
import ejectionRoutes from "./routes/ejectionRoutes";
import { setupVite, serveStatic, log } from "./vite";
import { healthMonitor } from "./services/healthMonitor";
import { loadSecretsFromKeyVault, loadGCPCredentials, validateRequiredSecrets, getAvailableIntegrations } from "./services/secretsLoader";
import { compressionMiddleware, optimizeResponseHeaders } from "./middleware/compression";

const app = express();

// Enable compression for all responses
app.use(compressionMiddleware);

// Optimize response headers
app.use(optimizeResponseHeaders);

// Stripe webhook needs raw body, so handle it before JSON parsing
app.use('/api/webhooks/stripe', express.raw({type: 'application/json'}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add cache-busting and deployment info headers
app.use((req, res, next) => {
  // Add deployment tracking headers
  const deployTimestamp = process.env.DEPLOY_TIMESTAMP || new Date().toISOString();
  const gitCommit = process.env.GIT_COMMIT || 'unknown';
  const cacheBust = process.env.CACHE_BUST || Date.now().toString();

  res.setHeader('X-Deploy-Timestamp', deployTimestamp);
  res.setHeader('X-Git-Commit', gitCommit);
  res.setHeader('X-Cache-Bust', cacheBust);

  // Prevent caching for HTML files to ensure latest app shell
  if (req.path === '/' || req.path.endsWith('.html')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  // Service Worker - must be served with correct MIME type and no cache
  if (req.path === '/sw.js') {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Service-Worker-Allowed', '/');
  }

  // Manifest and PWA icons - allow caching
  if (req.path === '/manifest.json' || req.path.match(/icon-\d+\.png$/)) {
    res.setHeader('Content-Type', req.path.endsWith('.json') ? 'application/json' : 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
  }

  // Allow caching for static assets but with validation
  if (req.path.includes('/assets/') || req.path.endsWith('.js') || req.path.endsWith('.css')) {
    res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
    res.setHeader('ETag', `"${gitCommit}-${cacheBust}"`);
    
    // Set correct MIME types for CSS and JS
    if (req.path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (req.path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
  }

  next();
});

// Track secret loading status globally
let secretsLoaded = false;
let secretsError: string | null = null;

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Add a simple health check route with deployment info
// This must respond immediately for Azure Container Apps health check
app.get('/api/health', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({
    status: 'healthy',
    healthy: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: 'connected',
      keyVault: 'connected',
      memory: process.memoryUsage(),
      version: 'v0.0.25'
    },
    deployTimestamp: process.env.DEPLOY_TIMESTAMP || 'unknown',
    gitCommit: process.env.GIT_COMMIT || 'unknown',
    cacheBust: process.env.CACHE_BUST || 'unknown',
    secretsStatus: secretsLoaded ? 'loaded' : (secretsError ? 'failed' : 'loading'),
    secretsError: secretsError || undefined
  });
});

(async () => {
  try {
    console.log('🚀 Starting Careerate Runbook Platform...');
    console.log('');

    // Load secrets in background (non-blocking)
    const secretsPromise = (async () => {
      try {
        log('🔐 Loading secrets from Azure Key Vault (background)...');
        const secretsResult = await Promise.race([
          loadSecretsFromKeyVault(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Key Vault timeout after 10 seconds')), 10000)
          )
        ]) as any;
        
        await loadGCPCredentials();
        validateRequiredSecrets();
        
        const integrations = getAvailableIntegrations();
        console.log('');
        console.log('🔌 Configured Cloud Providers:');
        if (integrations.includes('aws')) console.log('  ✅ AWS');
        if (integrations.includes('azure')) console.log('  ✅ Azure');
        if (integrations.includes('gcp')) console.log('  ✅ GCP');
        if (integrations.includes('github')) console.log('  ✅ GitHub');
        if (integrations.includes('gitlab')) console.log('  ✅ GitLab');
        if (integrations.includes('openai')) console.log('  ✅ OpenAI');
        console.log('');
        secretsLoaded = true;
      } catch (error: any) {
        secretsError = error.message;
        console.error('⚠️  Secrets loading failed (non-fatal):', error.message);
        console.error('');
        console.error('💡 Using environment variables as fallback');
        console.error('💡 Make sure required secrets are set in environment');
        console.error('');
        // In production, we'll still start but log the error
        // Health check will reflect the status
      }
    })();

    // Don't wait for secrets - start server immediately

    const server = await registerRoutes(app);
    
    // Register agent routes
    app.use('/api/agent', agentRoutes);

    // Register deployment routes (NEW - CORE FEATURE)
    const deploymentRoutes = (await import('./routes/deployment')).default;
    app.use('/api/deploy', deploymentRoutes);

    // Register ejection routes
    app.use('/api/eject', ejectionRoutes);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    
    // Import collaborationServer to initialize WebSocket AFTER server starts
    const { collaborationServer } = await import("./services/collaborationServer");
    
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use. Retrying in 2 seconds...`);
        setTimeout(() => {
          server.close();
          server.listen(port, "0.0.0.0");
        }, 2000);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });

    server.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
      console.log(`🚀 Careerate server running on port ${port}`);
      console.log(`🔗 Production URL: https://gocareerate.com`);
      console.log(`🔗 Direct URL: https://careerate-web.politetree-6f564ad5.westus2.azurecontainerapps.io`);

      // Initialize WebSocket server AFTER HTTP server is listening
      collaborationServer.initialize(server);

      // Initialize Agent Orchestrator
      (async () => {
        try {
          const { orchestrator } = await import("./agents/orchestrator");
          console.log('🤖 Initializing Agent Orchestrator...');
          await orchestrator.initialize();
          console.log('✅ Agent Orchestrator initialized successfully');
        } catch (error) {
          console.error('⚠️ Failed to initialize Agent Orchestrator:', error);
          console.error('   Agents will auto-init on first use');
        }
      })();

      // Start health monitoring agent for all active deployments
      healthMonitor.start().then(() => {
        console.log(`🏥 Health Monitor started - monitoring active deployments`);
      }).catch((error) => {
        console.error(`⚠️ Failed to start Health Monitor:`, error);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();
