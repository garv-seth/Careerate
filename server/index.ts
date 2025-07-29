import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { log, serveStatic } from "./utils";
import { env } from "./config/environment";
import { testDatabaseConnection } from "./db";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

(async () => {
  try {
    console.log(`🚀 Starting Careerate platform in ${env.NODE_ENV} mode...`);
    
    // Test database connection before starting server
    console.log("🔌 Testing database connection...");
    await testDatabaseConnection();
    
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error(`❌ Express error (${status}):`, message);
      res.status(status).json({ message });
      
      // Don't throw in production to keep server running
      if (env.NODE_ENV !== 'production') {
        throw err;
      }
    });

    // Setup Vite in development or serve static files in production
    if (env.NODE_ENV === "development") {
      console.log("🔧 Setting up Vite development server...");
      const { setupVite } = await import("./vite");
      await setupVite(app, server);
    } else {
      console.log("📦 Serving static files from dist/public...");
      serveStatic(app);
    }

    // Use Azure's assigned port or default to 5000 for local development
    const port = env.PORT;
    server.listen(port, "0.0.0.0", () => {
      console.log(`✅ Careerate platform is running on port ${port}`);
      console.log(`🌐 Health check: http://localhost:${port}/health`);
      console.log(`🔍 API docs: http://localhost:${port}/api/health`);
      
      if (env.NODE_ENV === 'development') {
        console.log(`🎯 Dashboard: http://localhost:${port}/dashboard`);
      }
    });

    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('💡 Check your environment variables and database connection');
    process.exit(1);
  }
})();
