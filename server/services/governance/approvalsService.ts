/**
 * Approvals Service
 * Manages approval requests and workflows for runbook executions
 */

import { db } from '../../db';
import {
  approvalRequests,
  approvalActions,
  type ApprovalRequest,
  type InsertApprovalRequest,
  type ApprovalAction,
  type InsertApprovalAction,
} from '../../../shared/schema';
import { eq, and, or, inArray } from 'drizzle-orm';
import { rbacService } from './rbacService';

export interface ApprovalResponse {
  id: string;
  status: 'approved' | 'rejected' | 'pending' | 'expired';
  approvedBy?: string[];
  rejectedBy?: string[];
  message?: string;
}

class ApprovalsService {
  /**
   * Create a new approval request
   */
  async createApprovalRequest(
    requestData: InsertApprovalRequest
  ): Promise<ApprovalRequest> {
    // Determine eligible approvers if not specified
    let approvers = requestData.approvers as string[] || [];
    
    if (approvers.length === 0) {
      approvers = await rbacService.getEligibleApprovers(
        requestData.resourceType || 'unknown',
        requestData.environment || 'production'
      );
    }

    // Determine required approval count based on risk level
    const requiredApprovals = this.getRequiredApprovalsForRisk(
      requestData.riskLevel || 'medium'
    );

    // Set approval deadline (default 24 hours)
    const approvalDeadline = requestData.approvalDeadline || new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    const [request] = await db
      .insert(approvalRequests)
      .values({
        ...requestData,
        approvers,
        requiredApprovals,
        approvalDeadline,
        status: 'pending',
      })
      .returning();

    // TODO: Send notifications to approvers
    // await this.notifyApprovers(request);

    return request;
  }

  /**
   * Approve an approval request
   */
  async approve(
    requestId: string,
    approverId: string,
    reason?: string,
    conditions?: any
  ): Promise<ApprovalResponse> {
    const request = await this.getApprovalRequest(requestId);

    if (!request) {
      throw new Error('Approval request not found');
    }

    if (request.status !== 'pending') {
      throw new Error(`Cannot approve request with status: ${request.status}`);
    }

    // Check if user is an eligible approver
    const approvers = request.approvers as string[];
    if (!approvers.includes(approverId)) {
      throw new Error('User is not an eligible approver for this request');
    }

    // Check if already approved by this user
    const approvedBy = (request.approvedBy as string[]) || [];
    if (approvedBy.includes(approverId)) {
      throw new Error('User has already approved this request');
    }

    // Record the approval action
    await db.insert(approvalActions).values({
      approvalRequestId: requestId,
      approverId,
      action: 'approve',
      reason,
      conditions,
    });

    // Update approval request
    const newApprovedBy = [...approvedBy, approverId];
    const newApprovedCount = (request.approvedCount || 0) + 1;
    
    let status: 'pending' | 'approved' = 'pending';
    let approvedAt: Date | null = null;

    if (newApprovedCount >= (request.requiredApprovals || 1)) {
      status = 'approved';
      approvedAt = new Date();
    }

    await db
      .update(approvalRequests)
      .set({
        approvedBy: newApprovedBy,
        approvedCount: newApprovedCount,
        status,
        approvedAt,
        updatedAt: new Date(),
      })
      .where(eq(approvalRequests.id, requestId));

    return {
      id: requestId,
      status,
      approvedBy: newApprovedBy,
      message: status === 'approved' 
        ? 'Approval request approved and ready for execution'
        : `Approval recorded (${newApprovedCount}/${request.requiredApprovals} required)`,
    };
  }

  /**
   * Reject an approval request
   */
  async reject(
    requestId: string,
    approverId: string,
    reason: string
  ): Promise<ApprovalResponse> {
    const request = await this.getApprovalRequest(requestId);

    if (!request) {
      throw new Error('Approval request not found');
    }

    if (request.status !== 'pending') {
      throw new Error(`Cannot reject request with status: ${request.status}`);
    }

    // Check if user is an eligible approver
    const approvers = request.approvers as string[];
    if (!approvers.includes(approverId)) {
      throw new Error('User is not an eligible approver for this request');
    }

    // Record the rejection action
    await db.insert(approvalActions).values({
      approvalRequestId: requestId,
      approverId,
      action: 'reject',
      reason,
    });

    // Update approval request
    const rejectedBy = [...((request.rejectedBy as string[]) || []), approverId];
    const rejectedCount = (request.rejectedCount || 0) + 1;

    await db
      .update(approvalRequests)
      .set({
        rejectedBy,
        rejectedCount,
        status: 'rejected',
        rejectedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(approvalRequests.id, requestId));

    return {
      id: requestId,
      status: 'rejected',
      rejectedBy,
      message: `Approval request rejected by approver`,
    };
  }

  /**
   * Add a comment to an approval request
   */
  async addComment(
    requestId: string,
    userId: string,
    comment: string
  ): Promise<void> {
    const request = await this.getApprovalRequest(requestId);

    if (!request) {
      throw new Error('Approval request not found');
    }

    const comments = (request.comments as any[]) || [];
    comments.push({
      userId,
      comment,
      timestamp: new Date().toISOString(),
    });

    await db
      .update(approvalRequests)
      .set({
        comments,
        updatedAt: new Date(),
      })
      .where(eq(approvalRequests.id, requestId));
  }

  /**
   * Get approval request by ID
   */
  async getApprovalRequest(requestId: string): Promise<ApprovalRequest | null> {
    const [request] = await db
      .select()
      .from(approvalRequests)
      .where(eq(approvalRequests.id, requestId));

    return request || null;
  }

  /**
   * Get pending approval requests for a user
   */
  async getPendingApprovalsForUser(userId: string): Promise<ApprovalRequest[]> {
    const requests = await db
      .select()
      .from(approvalRequests)
      .where(eq(approvalRequests.status, 'pending'));

    // Filter to requests where user is an eligible approver and hasn't acted yet
    return requests.filter(request => {
      const approvers = request.approvers as string[];
      const approvedBy = (request.approvedBy as string[]) || [];
      const rejectedBy = (request.rejectedBy as string[]) || [];
      
      return approvers.includes(userId) && 
             !approvedBy.includes(userId) && 
             !rejectedBy.includes(userId);
    });
  }

  /**
   * Get all approval requests for a specific runbook execution
   */
  async getApprovalsByExecution(executionId: string): Promise<ApprovalRequest[]> {
    return db
      .select()
      .from(approvalRequests)
      .where(eq(approvalRequests.runbookExecutionId, executionId));
  }

  /**
   * Get approval actions for a request
   */
  async getApprovalActions(requestId: string): Promise<ApprovalAction[]> {
    return db
      .select()
      .from(approvalActions)
      .where(eq(approvalActions.approvalRequestId, requestId));
  }

  /**
   * Cancel an approval request
   */
  async cancelApprovalRequest(requestId: string, userId: string): Promise<void> {
    const request = await this.getApprovalRequest(requestId);

    if (!request) {
      throw new Error('Approval request not found');
    }

    if (request.requesterId !== userId) {
      // Check if user is admin
      const isAdmin = await rbacService.hasRole(userId, 'admin');
      if (!isAdmin) {
        throw new Error('Only the requester or an admin can cancel approval requests');
      }
    }

    await db
      .update(approvalRequests)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(approvalRequests.id, requestId));
  }

  /**
   * Check if an approval request is expired
   */
  async checkAndMarkExpired(): Promise<void> {
    const now = new Date();
    
    await db
      .update(approvalRequests)
      .set({
        status: 'expired',
        updatedAt: now,
      })
      .where(
        and(
          eq(approvalRequests.status, 'pending'),
          // approvalDeadline is in the past
        )
      );
  }

  /**
   * Get all approval requests created by a user
   */
  async getRequestsByRequester(userId: string): Promise<ApprovalRequest[]> {
    return db
      .select()
      .from(approvalRequests)
      .where(eq(approvalRequests.requesterId, userId));
  }

  /**
   * Get approval statistics for a user
   */
  async getApprovalStats(userId: string): Promise<{
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  }> {
    const requests = await this.getPendingApprovalsForUser(userId);
    const actions = await db
      .select()
      .from(approvalActions)
      .where(eq(approvalActions.approverId, userId));

    const approved = actions.filter(a => a.action === 'approve').length;
    const rejected = actions.filter(a => a.action === 'reject').length;

    return {
      pending: requests.length,
      approved,
      rejected,
      total: approved + rejected + requests.length,
    };
  }

  /**
   * Determine required approvals based on risk level
   */
  private getRequiredApprovalsForRisk(riskLevel: string): number {
    const riskMap: Record<string, number> = {
      low: 1,
      medium: 1,
      high: 2,
      critical: 2,
    };

    return riskMap[riskLevel] || 1;
  }

  /**
   * Mark approval as executed
   */
  async markExecuted(requestId: string): Promise<void> {
    await db
      .update(approvalRequests)
      .set({
        executedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(approvalRequests.id, requestId));
  }

  /**
   * Check if approval is ready for execution
   */
  async isReadyForExecution(requestId: string): Promise<boolean> {
    const request = await this.getApprovalRequest(requestId);

    if (!request) {
      return false;
    }

    return (
      request.status === 'approved' &&
      request.approvedCount! >= request.requiredApprovals! &&
      !request.executedAt
    );
  }
}

export const approvalsService = new ApprovalsService();

