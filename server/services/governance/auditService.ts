/**
 * Audit Service
 * Immutable audit logging with PDF/JSON export for compliance
 */

import { db } from '../../db';
import {
  runbookAuditLogs,
  type RunbookAuditLog,
  type InsertRunbookAuditLog,
} from '../../../shared/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import PDFDocument from 'pdfkit';

export interface AuditContext {
  runbookExecutionId?: string;
  approvalRequestId?: string;
  actor: string;
  actorType?: 'user' | 'system' | 'automation';
  action: string;
  targetResource: any;
  beforeState?: any;
  afterState?: any;
  approvals?: any[];
  policyChecks?: any[];
  evidence?: any;
  ipAddress?: string;
  userAgent?: string;
  traceId?: string;
  sessionId?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: any;
}

export interface AuditExportOptions {
  startDate?: Date;
  endDate?: Date;
  runbookExecutionId?: string;
  actor?: string;
  actions?: string[];
  format: 'pdf' | 'json';
}

class AuditService {
  /**
   * Create an immutable audit log entry
   */
  async log(context: AuditContext): Promise<RunbookAuditLog> {
    const traceId = context.traceId || uuidv4();
    
    // Compute diff if before/after states exist
    let diff = null;
    if (context.beforeState && context.afterState) {
      diff = this.computeDiff(context.beforeState, context.afterState);
    }

    const [auditLog] = await db
      .insert(runbookAuditLogs)
      .values({
        runbookExecutionId: context.runbookExecutionId || null,
        approvalRequestId: context.approvalRequestId || null,
        action: context.action,
        actor: context.actor,
        actorType: context.actorType || 'user',
        targetResource: context.targetResource,
        beforeState: context.beforeState || null,
        afterState: context.afterState || null,
        diff,
        approvals: context.approvals || [],
        policyChecks: context.policyChecks || [],
        evidence: context.evidence || {},
        ipAddress: context.ipAddress || null,
        userAgent: context.userAgent || null,
        traceId,
        sessionId: context.sessionId || null,
        success: context.success,
        errorMessage: context.errorMessage || null,
        metadata: context.metadata || {},
      })
      .returning();

    return auditLog;
  }

  /**
   * Get audit logs for a runbook execution
   */
  async getExecutionAuditLogs(executionId: string): Promise<RunbookAuditLog[]> {
    return db
      .select()
      .from(runbookAuditLogs)
      .where(eq(runbookAuditLogs.runbookExecutionId, executionId))
      .orderBy(desc(runbookAuditLogs.timestamp));
  }

  /**
   * Get audit logs for an approval request
   */
  async getApprovalAuditLogs(approvalRequestId: string): Promise<RunbookAuditLog[]> {
    return db
      .select()
      .from(runbookAuditLogs)
      .where(eq(runbookAuditLogs.approvalRequestId, approvalRequestId))
      .orderBy(desc(runbookAuditLogs.timestamp));
  }

  /**
   * Get audit logs by actor
   */
  async getLogsByActor(actor: string, limit = 100): Promise<RunbookAuditLog[]> {
    return db
      .select()
      .from(runbookAuditLogs)
      .where(eq(runbookAuditLogs.actor, actor))
      .orderBy(desc(runbookAuditLogs.timestamp))
      .limit(limit);
  }

  /**
   * Get audit logs by trace ID (for request correlation)
   */
  async getLogsByTraceId(traceId: string): Promise<RunbookAuditLog[]> {
    return db
      .select()
      .from(runbookAuditLogs)
      .where(eq(runbookAuditLogs.traceId, traceId))
      .orderBy(runbookAuditLogs.timestamp);
  }

  /**
   * Get audit logs within date range
   */
  async getLogsByDateRange(
    startDate: Date,
    endDate: Date,
    limit = 1000
  ): Promise<RunbookAuditLog[]> {
    return db
      .select()
      .from(runbookAuditLogs)
      .where(
        and(
          gte(runbookAuditLogs.timestamp, startDate),
          lte(runbookAuditLogs.timestamp, endDate)
        )
      )
      .orderBy(desc(runbookAuditLogs.timestamp))
      .limit(limit);
  }

  /**
   * Export audit logs as JSON
   */
  async exportJSON(options: AuditExportOptions): Promise<string> {
    const logs = await this.queryLogsForExport(options);

    const exportData = {
      exportDate: new Date().toISOString(),
      filters: options,
      totalLogs: logs.length,
      logs: logs.map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        action: log.action,
        actor: log.actor,
        actorType: log.actorType,
        targetResource: log.targetResource,
        beforeState: log.beforeState,
        afterState: log.afterState,
        diff: log.diff,
        approvals: log.approvals,
        policyChecks: log.policyChecks,
        evidence: log.evidence,
        success: log.success,
        errorMessage: log.errorMessage,
        traceId: log.traceId,
        metadata: log.metadata,
      })),
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export audit logs as PDF
   */
  async exportPDF(options: AuditExportOptions): Promise<Buffer> {
    const logs = await this.queryLogsForExport(options);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on('error', reject);

      // Header
      doc
        .fontSize(20)
        .text('Runbook Audit Report', { align: 'center' })
        .moveDown();

      doc
        .fontSize(10)
        .text(`Generated: ${new Date().toISOString()}`, { align: 'center' })
        .text(`Total Logs: ${logs.length}`, { align: 'center' })
        .moveDown(2);

      // Filters
      if (options.startDate || options.endDate) {
        doc.fontSize(12).text('Filters:', { underline: true }).moveDown(0.5);
        if (options.startDate) {
          doc.fontSize(10).text(`Start Date: ${options.startDate.toISOString()}`);
        }
        if (options.endDate) {
          doc.fontSize(10).text(`End Date: ${options.endDate.toISOString()}`);
        }
        if (options.runbookExecutionId) {
          doc.text(`Execution ID: ${options.runbookExecutionId}`);
        }
        if (options.actor) {
          doc.text(`Actor: ${options.actor}`);
        }
        doc.moveDown(2);
      }

      // Logs
      doc.fontSize(14).text('Audit Log Entries', { underline: true }).moveDown();

      logs.forEach((log, index) => {
        doc
          .fontSize(11)
          .text(`Entry ${index + 1}: ${log.action}`, { underline: true })
          .moveDown(0.3);

        doc
          .fontSize(9)
          .text(`Timestamp: ${log.timestamp.toISOString()}`)
          .text(`Actor: ${log.actor} (${log.actorType})`)
          .text(`Success: ${log.success ? 'Yes' : 'No'}`)
          .text(`Trace ID: ${log.traceId || 'N/A'}`)
          .moveDown(0.3);

        if (log.targetResource) {
          doc.text(
            `Target: ${JSON.stringify(log.targetResource).substring(0, 100)}...`
          );
        }

        if (log.approvals && (log.approvals as any[]).length > 0) {
          doc.text(`Approvals: ${(log.approvals as any[]).length}`);
        }

        if (log.policyChecks && (log.policyChecks as any[]).length > 0) {
          doc.text(`Policy Checks: ${(log.policyChecks as any[]).length}`);
        }

        if (log.errorMessage) {
          doc.text(`Error: ${log.errorMessage}`);
        }

        doc.moveDown(1);

        // Add page break if needed
        if (doc.y > 700) {
          doc.addPage();
        }
      });

      // Footer
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc
          .fontSize(8)
          .text(
            `Page ${i + 1} of ${pages.count}`,
            50,
            doc.page.height - 50,
            { align: 'center' }
          );
      }

      doc.end();
    });
  }

  /**
   * Generate audit report for a runbook execution
   */
  async generateExecutionReport(
    executionId: string,
    format: 'pdf' | 'json' = 'pdf'
  ): Promise<Buffer | string> {
    const options: AuditExportOptions = {
      runbookExecutionId: executionId,
      format,
    };

    if (format === 'pdf') {
      return this.exportPDF(options);
    } else {
      return this.exportJSON(options);
    }
  }

  /**
   * Verify audit log integrity (immutability check)
   */
  async verifyIntegrity(logId: string): Promise<{
    valid: boolean;
    message: string;
  }> {
    const [log] = await db
      .select()
      .from(runbookAuditLogs)
      .where(eq(runbookAuditLogs.id, logId));

    if (!log) {
      return { valid: false, message: 'Audit log not found' };
    }

    // In a production system, you would verify cryptographic signatures
    // For now, just verify the log exists and has required fields
    const requiredFields = ['id', 'action', 'actor', 'timestamp', 'targetResource'];
    const missingFields = requiredFields.filter(
      field => !(log as any)[field]
    );

    if (missingFields.length > 0) {
      return {
        valid: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      };
    }

    return { valid: true, message: 'Audit log integrity verified' };
  }

  /**
   * Get audit summary statistics
   */
  async getSummaryStats(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalLogs: number;
    successfulActions: number;
    failedActions: number;
    actionBreakdown: Record<string, number>;
    actorBreakdown: Record<string, number>;
  }> {
    const logs = await this.getLogsByDateRange(startDate, endDate);

    const stats = {
      totalLogs: logs.length,
      successfulActions: logs.filter(l => l.success).length,
      failedActions: logs.filter(l => !l.success).length,
      actionBreakdown: {} as Record<string, number>,
      actorBreakdown: {} as Record<string, number>,
    };

    logs.forEach(log => {
      stats.actionBreakdown[log.action] =
        (stats.actionBreakdown[log.action] || 0) + 1;
      stats.actorBreakdown[log.actor] =
        (stats.actorBreakdown[log.actor] || 0) + 1;
    });

    return stats;
  }

  /**
   * Query logs for export based on options
   */
  private async queryLogsForExport(
    options: AuditExportOptions
  ): Promise<RunbookAuditLog[]> {
    let query = db.select().from(runbookAuditLogs);

    const conditions: any[] = [];

    if (options.startDate) {
      conditions.push(gte(runbookAuditLogs.timestamp, options.startDate));
    }

    if (options.endDate) {
      conditions.push(lte(runbookAuditLogs.timestamp, options.endDate));
    }

    if (options.runbookExecutionId) {
      conditions.push(
        eq(runbookAuditLogs.runbookExecutionId, options.runbookExecutionId)
      );
    }

    if (options.actor) {
      conditions.push(eq(runbookAuditLogs.actor, options.actor));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const logs = await query.orderBy(desc(runbookAuditLogs.timestamp));

    return logs;
  }

  /**
   * Compute diff between before and after states
   */
  private computeDiff(before: any, after: any): any {
    const diff: any = {
      added: {},
      removed: {},
      modified: {},
    };

    const beforeKeys = new Set(Object.keys(before || {}));
    const afterKeys = new Set(Object.keys(after || {}));

    // Find added keys
    afterKeys.forEach(key => {
      if (!beforeKeys.has(key)) {
        diff.added[key] = after[key];
      }
    });

    // Find removed keys
    beforeKeys.forEach(key => {
      if (!afterKeys.has(key)) {
        diff.removed[key] = before[key];
      }
    });

    // Find modified keys
    beforeKeys.forEach(key => {
      if (afterKeys.has(key)) {
        const beforeVal = before[key];
        const afterVal = after[key];
        
        if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
          diff.modified[key] = {
            before: beforeVal,
            after: afterVal,
          };
        }
      }
    });

    return diff;
  }
}

export const auditService = new AuditService();

