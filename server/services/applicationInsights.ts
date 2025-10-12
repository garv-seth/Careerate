/**
 * Application Insights Integration
 * 
 * Azure Application Insights for monitoring, logging, and telemetry
 * Enterprise-grade observability for Careerate
 */

import * as appInsights from 'applicationinsights';

// Environment variables
const APPINSIGHTS_CONNECTION_STRING = process.env.APPINSIGHTS_CONNECTION_STRING || '';
const APPINSIGHTS_ENABLED = process.env.APPINSIGHTS_ENABLED === 'true';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Application Insights client
let telemetryClient: appInsights.TelemetryClient | null = null;

/**
 * Initialize Application Insights
 */
export function initializeApplicationInsights(): boolean {
  if (!APPINSIGHTS_ENABLED) {
    console.log('[AppInsights] Disabled in environment');
    return false;
  }

  if (!APPINSIGHTS_CONNECTION_STRING) {
    console.warn('[AppInsights] Connection string not configured');
    return false;
  }

  try {
    // Setup Application Insights
    appInsights
      .setup(APPINSIGHTS_CONNECTION_STRING)
      .setAutoCollectRequests(true) // Auto-collect HTTP requests
      .setAutoCollectPerformance(true, true) // Collect performance metrics
      .setAutoCollectExceptions(true) // Auto-collect exceptions
      .setAutoCollectDependencies(true) // Collect dependency tracking
      .setAutoCollectConsole(true, true) // Collect console logs
      .setUseDiskRetriesOnFailure(true) // Retry on failure
      .setSendLiveMetrics(NODE_ENV === 'production') // Live metrics in production
      .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C) // Distributed tracing
      .start();

    telemetryClient = appInsights.defaultClient;

    // Set common properties
    telemetryClient.commonProperties = {
      environment: NODE_ENV,
      application: 'Careerate',
      version: process.env.npm_package_version || '1.0.0',
    };

    // Configure sampling (reduce volume in production)
    telemetryClient.config.samplingPercentage = NODE_ENV === 'production' ? 50 : 100;

    console.log('[AppInsights] ✅ Initialized successfully');
    return true;
  } catch (error) {
    console.error('[AppInsights] ❌ Initialization failed:', error);
    return false;
  }
}

/**
 * Track custom event
 */
export function trackEvent(
  name: string,
  properties?: Record<string, any>,
  measurements?: Record<string, number>
) {
  if (!telemetryClient) return;

  telemetryClient.trackEvent({
    name,
    properties,
    measurements,
  });
}

/**
 * Track custom metric
 */
export function trackMetric(
  name: string,
  value: number,
  properties?: Record<string, string>
) {
  if (!telemetryClient) return;

  telemetryClient.trackMetric({
    name,
    value,
    properties,
  });
}

/**
 * Track exception
 */
export function trackException(
  exception: Error,
  properties?: Record<string, any>
) {
  if (!telemetryClient) return;

  telemetryClient.trackException({
    exception,
    properties,
  });

  // Also log to console for development
  if (NODE_ENV !== 'production') {
    console.error('[Exception]', exception, properties);
  }
}

/**
 * Track dependency (external service call)
 */
export function trackDependency(
  name: string,
  data: string,
  duration: number,
  success: boolean,
  dependencyType: string = 'HTTP'
) {
  if (!telemetryClient) return;

  telemetryClient.trackDependency({
    name,
    data,
    duration,
    success,
    dependencyTypeName: dependencyType,
  });
}

/**
 * Track custom trace/log
 */
export function trackTrace(
  message: string,
  severity: 'Verbose' | 'Information' | 'Warning' | 'Error' | 'Critical' = 'Information',
  properties?: Record<string, any>
) {
  if (!telemetryClient) return;

  const severityMap = {
    Verbose: appInsights.Contracts.SeverityLevel.Verbose,
    Information: appInsights.Contracts.SeverityLevel.Information,
    Warning: appInsights.Contracts.SeverityLevel.Warning,
    Error: appInsights.Contracts.SeverityLevel.Error,
    Critical: appInsights.Contracts.SeverityLevel.Critical,
  };

  telemetryClient.trackTrace({
    message,
    severity: severityMap[severity],
    properties,
  });
}

/**
 * Flush telemetry (ensure all data is sent)
 */
export async function flushTelemetry(): Promise<void> {
  if (!telemetryClient) return;

  return new Promise((resolve) => {
    telemetryClient!.flush({
      callback: () => {
        console.log('[AppInsights] Telemetry flushed');
        resolve();
      },
    });
  });
}

/**
 * Track deployment event
 */
export function trackDeployment(
  deploymentId: string,
  status: string,
  provider: string,
  duration?: number
) {
  trackEvent('Deployment', {
    deploymentId,
    status,
    provider,
  }, duration ? { duration } : undefined);
}

/**
 * Track agent execution
 */
export function trackAgentExecution(
  agentName: string,
  action: string,
  success: boolean,
  duration: number,
  errorMessage?: string
) {
  trackEvent('AgentExecution', {
    agentName,
    action,
    success: success.toString(),
    errorMessage: errorMessage || '',
  }, { duration });
}

/**
 * Track API call
 */
export function trackAPICall(
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number,
  userId?: string
) {
  trackEvent('APICall', {
    endpoint,
    method,
    statusCode: statusCode.toString(),
    userId: userId || 'anonymous',
  }, { duration });
}

/**
 * Track user action
 */
export function trackUserAction(
  action: string,
  userId: string,
  properties?: Record<string, any>
) {
  trackEvent('UserAction', {
    action,
    userId,
    ...properties,
  });
}

// Export the client for advanced usage
export { telemetryClient };

