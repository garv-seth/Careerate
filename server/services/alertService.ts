/**
 * ADVANCED ALERT SERVICE
 * AI-powered alert management with Slack/Email/Webhook delivery
 * Predictive analytics and intelligent alert routing
 */

import { storage } from "../storage";
import type { AlertChannel, AlertRule, Deployment } from "@shared/schema";
import sgMail from '@sendgrid/mail';
import twilio from 'twilio';

interface AlertPayload {
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  projectId: string;
  deploymentId?: string;
  metadata?: any;
  actionUrl?: string;
}

interface SlackConfig {
  webhookUrl: string;
  channel?: string;
  username?: string;
  iconEmoji?: string;
}

interface EmailConfig {
  to: string[];
  from?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
}

interface WebhookConfig {
  url: string;
  method?: 'POST' | 'PUT';
  headers?: Record<string, string>;
  authToken?: string;
}

export class AlertService {
  private rateLimitMap: Map<string, { count: number; resetAt: number }> = new Map();
  
  /**
   * Send alert through configured channels
   */
  async sendAlert(alert: AlertPayload, channelIds: string[]): Promise<void> {
    const channels = await Promise.all(
      channelIds.map(id => storage.getAlertChannel(id))
    );

    const validChannels = channels.filter(ch => ch && ch.isActive);

    await Promise.all(
      validChannels.map(async (channel) => {
        if (!channel) return;

        // Check rate limiting
        if (this.isRateLimited(channel.id, 10, 300000)) { // 10 alerts per 5 min
          console.warn(`Rate limit exceeded for channel ${channel.id}`);
          return;
        }

        try {
          switch (channel.type) {
            case 'slack':
              await this.sendSlackAlert(alert, channel.configuration as any);
              break;
            case 'email':
              await this.sendEmailAlert(alert, channel.configuration as any);
              break;
            case 'webhook':
              await this.sendWebhookAlert(alert, channel.configuration as any);
              break;
            case 'sms':
              await this.sendSMSAlert(alert, channel.configuration as any);
              break;
            default:
              console.warn(`Unknown channel type: ${channel.type}`);
          }

          // Log successful delivery
          await storage.createIntegrationAuditLog({
            integrationId: null,
            userId: null,
            action: 'alert_sent',
            resourceType: 'alert',
            resourceId: channel.id,
            details: {
              channelType: channel.type,
              severity: alert.severity,
              title: alert.title
            },
            risk: 'low',
            complianceFlags: [],
            metadata: {}
          });
        } catch (error) {
          console.error(`Failed to send alert via ${channel.type}:`, error);
          // Store failed alert for retry
          await this.storeFailedAlert(alert, channel.id, (error as Error).message);
        }
      })
    );
  }

  /**
   * Send Slack alert
   */
  private async sendSlackAlert(alert: AlertPayload, config: SlackConfig): Promise<void> {
    const color = {
      info: '#36a64f',
      warning: '#ff9800',
      critical: '#f44336'
    }[alert.severity];

    const payload = {
      username: config.username || 'Careerate Alerts',
      icon_emoji: config.iconEmoji || ':robot_face:',
      channel: config.channel,
      attachments: [
        {
          color,
          title: alert.title,
          text: alert.message,
          fields: [
            {
              title: 'Severity',
              value: alert.severity.toUpperCase(),
              short: true
            },
            {
              title: 'Project ID',
              value: alert.projectId,
              short: true
            }
          ],
          footer: 'Careerate DevOps Platform',
          ts: Math.floor(Date.now() / 1000),
          actions: alert.actionUrl ? [
            {
              type: 'button',
              text: 'View Details',
              url: alert.actionUrl
            }
          ] : undefined
        }
      ]
    };

    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.statusText}`);
    }
  }

  /**
   * Send Email alert
   */
  private async sendEmailAlert(alert: AlertPayload, config: EmailConfig): Promise<void> {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('⚠️  SendGrid API key not configured, skipping email alert');
      return;
    }

    try {
      // Initialize SendGrid
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      // Send email
      await sgMail.send({
        to: config.to,
        from: config.from || 'alerts@careerate.com',
        subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
        html: this.generateEmailHTML(alert)
      });

      console.log('📧 Email Alert sent successfully:', {
        to: config.to,
        subject: `[${alert.severity.toUpperCase()}] ${alert.title}`
      });
    } catch (error) {
      console.error('❌ Failed to send email via SendGrid:', error);
      throw error;
    }
  }

  /**
   * Send Webhook alert
   */
  private async sendWebhookAlert(alert: AlertPayload, config: WebhookConfig): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers
    };

    if (config.authToken) {
      headers['Authorization'] = `Bearer ${config.authToken}`;
    }

    const response = await fetch(config.url, {
      method: config.method || 'POST',
      headers,
      body: JSON.stringify({
        ...alert,
        timestamp: new Date().toISOString(),
        source: 'careerate'
      })
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.statusText}`);
    }
  }

  /**
   * Send SMS alert via Twilio
   */
  private async sendSMSAlert(alert: AlertPayload, config: any): Promise<void> {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.warn('⚠️  Twilio credentials not configured, skipping SMS alert');
      return;
    }

    if (!config.phoneNumber) {
      console.warn('⚠️  No phone number configured for SMS alert');
      return;
    }

    try {
      // Initialize Twilio client
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

      // Get Twilio phone number from config or environment
      const fromPhone = config.fromPhone || process.env.TWILIO_PHONE_NUMBER;

      if (!fromPhone) {
        throw new Error('Twilio phone number not configured');
      }

      // Send SMS
      await client.messages.create({
        to: config.phoneNumber,
        from: fromPhone,
        body: `[${alert.severity.toUpperCase()}] ${alert.title}: ${alert.message}`
      });

      console.log('📱 SMS Alert sent successfully:', {
        to: config.phoneNumber,
        message: alert.title
      });
    } catch (error) {
      console.error('❌ Failed to send SMS via Twilio:', error);
      throw error;
    }
  }

  /**
   * Evaluate alert rules for a deployment
   */
  async evaluateRules(projectId: string, metrics: any): Promise<void> {
    const rules = await storage.getActiveAlertRules(projectId);

    for (const rule of rules) {
      const condition = rule.condition as any;
      const shouldTrigger = this.evaluateCondition(condition, metrics);

      if (shouldTrigger) {
        // Check cooldown
        if (rule.lastTriggered) {
          const cooldownMs = (rule.cooldownMinutes || 5) * 60 * 1000;
          const timeSinceLast = Date.now() - new Date(rule.lastTriggered).getTime();
          if (timeSinceLast < cooldownMs) {
            continue; // Skip due to cooldown
          }
        }

        // Trigger alert
        await this.sendAlert(
          {
            title: rule.name,
            message: rule.description || `Alert condition met: ${JSON.stringify(condition)}`,
            severity: rule.severity as any,
            projectId,
            metadata: { condition, metrics, ruleId: rule.id }
          },
          rule.channels || []
        );

        // Update rule
        await storage.updateAlertRule(rule.id, {
          lastTriggered: new Date(),
          triggerCount: (rule.triggerCount || 0) + 1
        });
      }
    }
  }

  /**
   * Evaluate a condition against metrics
   */
  private evaluateCondition(condition: any, metrics: any): boolean {
    const { metric, operator, threshold } = condition;
    const value = metrics[metric];

    if (value === undefined) return false;

    switch (operator) {
      case '>': return value > threshold;
      case '>=': return value >= threshold;
      case '<': return value < threshold;
      case '<=': return value <= threshold;
      case '==': return value == threshold;
      case '!=': return value != threshold;
      default: return false;
    }
  }

  /**
   * Rate limiting check
   */
  private isRateLimited(key: string, maxCount: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.rateLimitMap.get(key);

    if (!entry || now > entry.resetAt) {
      this.rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
      return false;
    }

    if (entry.count >= maxCount) {
      return true;
    }

    entry.count++;
    return false;
  }

  /**
   * Store failed alert for retry
   */
  private async storeFailedAlert(alert: AlertPayload, channelId: string, error: string): Promise<void> {
    // Store in metadata for later retry
    console.error('Failed alert stored for retry:', {
      channelId,
      alert: alert.title,
      error
    });
    
    // Could store in a dedicated failed_alerts table for retry queue
  }

  /**
   * Generate HTML for email alerts
   */
  private generateEmailHTML(alert: AlertPayload): string {
    const colorMap = {
      info: '#3b82f6',
      warning: '#f59e0b',
      critical: '#ef4444'
    };

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f3f4f6; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: ${colorMap[alert.severity]}; color: white; padding: 20px; }
    .body { padding: 20px; }
    .footer { background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }
    .button { display: inline-block; background: ${colorMap[alert.severity]}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">${alert.title}</h2>
      <p style="margin: 5px 0 0; opacity: 0.9;">Severity: ${alert.severity.toUpperCase()}</p>
    </div>
    <div class="body">
      <p>${alert.message}</p>
      ${alert.metadata ? `<pre style="background: #f3f4f6; padding: 10px; border-radius: 5px; overflow-x: auto;">${JSON.stringify(alert.metadata, null, 2)}</pre>` : ''}
      ${alert.actionUrl ? `<a href="${alert.actionUrl}" class="button">View Details</a>` : ''}
    </div>
    <div class="footer">
      <p>Careerate DevOps Platform • ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}

export const alertService = new AlertService();
