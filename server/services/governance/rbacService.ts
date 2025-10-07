/**
 * RBAC Service - Role-Based Access Control
 * Manages user roles and permission checks for runbook operations
 */

import { db } from '../../db';
import { userRoles, users, type UserRole, type InsertUserRole } from '../../../shared/schema';
import { eq, and } from 'drizzle-orm';

export type RoleName = 'admin' | 'approver' | 'operator' | 'viewer';

export interface PermissionCheck {
  userId: string;
  action: string; // e.g., "execute-runbook", "approve-deployment", "view-audit-logs"
  resource?: string; // e.g., "runbook:incident", "environment:prod"
  scope?: string;
}

export interface RolePermissions {
  [key: string]: {
    allowedActions: string[];
    requiresApproval?: boolean;
  };
}

// Permission matrix
const ROLE_PERMISSIONS: RolePermissions = {
  admin: {
    allowedActions: [
      'execute-runbook',
      'approve-deployment',
      'approve-incident',
      'view-audit-logs',
      'export-audit-logs',
      'manage-policies',
      'manage-budgets',
      'manage-roles',
      'toggle-kill-switch',
      'view-all-resources',
      'manage-integrations',
    ],
    requiresApproval: false,
  },
  approver: {
    allowedActions: [
      'approve-deployment',
      'approve-incident',
      'view-audit-logs',
      'export-audit-logs',
      'view-all-resources',
    ],
    requiresApproval: false,
  },
  operator: {
    allowedActions: [
      'request-runbook-execution',
      'view-runbook-status',
      'view-health-checks',
      'view-deployments',
    ],
    requiresApproval: true,
  },
  viewer: {
    allowedActions: [
      'view-runbook-status',
      'view-health-checks',
      'view-deployments',
    ],
    requiresApproval: false,
  },
};

class RBACService {
  /**
   * Grant a role to a user
   */
  async grantRole(roleData: InsertUserRole): Promise<UserRole> {
    const [role] = await db
      .insert(userRoles)
      .values(roleData)
      .returning();

    return role;
  }

  /**
   * Revoke a role from a user
   */
  async revokeRole(roleId: string): Promise<boolean> {
    await db
      .update(userRoles)
      .set({ isActive: false })
      .where(eq(userRoles.id, roleId));

    return true;
  }

  /**
   * Get all roles for a user
   */
  async getUserRoles(userId: string, activeOnly = true): Promise<UserRole[]> {
    const conditions = [eq(userRoles.userId, userId)];
    
    if (activeOnly) {
      conditions.push(eq(userRoles.isActive, true));
    }

    const roles = await db
      .select()
      .from(userRoles)
      .where(and(...conditions));

    return roles;
  }

  /**
   * Get highest privilege role for a user
   */
  async getHighestRole(userId: string): Promise<RoleName | null> {
    const roles = await this.getUserRoles(userId);
    
    if (roles.length === 0) {
      return null;
    }

    // Priority: admin > approver > operator > viewer
    const rolePriority: RoleName[] = ['admin', 'approver', 'operator', 'viewer'];
    
    for (const priorityRole of rolePriority) {
      if (roles.some(r => r.role === priorityRole)) {
        return priorityRole;
      }
    }

    return null;
  }

  /**
   * Check if a user has a specific role
   */
  async hasRole(userId: string, roleName: RoleName, scope?: string): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    
    return roles.some(r => {
      const roleMatches = r.role === roleName;
      const scopeMatches = !scope || r.scope === 'global' || r.scope === scope;
      return roleMatches && scopeMatches;
    });
  }

  /**
   * Check if a user has permission to perform an action
   */
  async hasPermission(check: PermissionCheck): Promise<boolean> {
    const roles = await this.getUserRoles(check.userId);
    
    if (roles.length === 0) {
      return false;
    }

    // Check each role's permissions
    for (const userRole of roles) {
      const rolePermissions = ROLE_PERMISSIONS[userRole.role];
      
      if (!rolePermissions) {
        continue;
      }

      // Check scope matching
      const scopeMatches = 
        !check.scope || 
        userRole.scope === 'global' || 
        userRole.scope === check.scope;

      if (!scopeMatches) {
        continue;
      }

      // Check if role has the required action
      if (rolePermissions.allowedActions.includes(check.action)) {
        return true;
      }

      // Check wildcard permissions
      if (rolePermissions.allowedActions.includes('*')) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if an action requires approval for the user
   */
  async requiresApproval(userId: string, action: string): Promise<boolean> {
    const highestRole = await this.getHighestRole(userId);
    
    if (!highestRole) {
      return true; // No role = require approval
    }

    const rolePermissions = ROLE_PERMISSIONS[highestRole];
    return rolePermissions.requiresApproval === true;
  }

  /**
   * Get eligible approvers for a resource
   */
  async getEligibleApprovers(
    resource: string,
    environment: string
  ): Promise<string[]> {
    // Get all users with approver or admin role in the relevant scope
    const approverRoles = await db
      .select({
        userId: userRoles.userId,
        role: userRoles.role,
        scope: userRoles.scope,
      })
      .from(userRoles)
      .where(
        and(
          eq(userRoles.isActive, true)
        )
      );

    const eligibleApprovers = approverRoles
      .filter(r => {
        const hasPermission = r.role === 'admin' || r.role === 'approver';
        const scopeMatches = 
          r.scope === 'global' || 
          r.scope === `environment:${environment}` ||
          r.scope === `resource:${resource}`;
        
        return hasPermission && scopeMatches;
      })
      .map(r => r.userId);

    // Remove duplicates
    return Array.from(new Set(eligibleApprovers));
  }

  /**
   * List all users with a specific role
   */
  async getUsersWithRole(roleName: RoleName, scope?: string): Promise<UserRole[]> {
    const conditions = [
      eq(userRoles.role, roleName),
      eq(userRoles.isActive, true),
    ];

    if (scope) {
      conditions.push(eq(userRoles.scope, scope));
    }

    const roles = await db
      .select()
      .from(userRoles)
      .where(and(...conditions));

    return roles;
  }

  /**
   * Validate if a user can grant a role
   */
  async canGrantRole(granterId: string, roleToGrant: RoleName): Promise<boolean> {
    // Only admins can grant roles
    return this.hasRole(granterId, 'admin');
  }

  /**
   * Get permission summary for a user
   */
  async getPermissionSummary(userId: string): Promise<{
    roles: UserRole[];
    highestRole: RoleName | null;
    allowedActions: string[];
    requiresApproval: boolean;
  }> {
    const roles = await this.getUserRoles(userId);
    const highestRole = await this.getHighestRole(userId);
    
    const allowedActions = new Set<string>();
    let requiresApproval = true;

    for (const role of roles) {
      const permissions = ROLE_PERMISSIONS[role.role];
      if (permissions) {
        permissions.allowedActions.forEach(action => allowedActions.add(action));
        if (permissions.requiresApproval === false) {
          requiresApproval = false;
        }
      }
    }

    return {
      roles,
      highestRole,
      allowedActions: Array.from(allowedActions),
      requiresApproval,
    };
  }

  /**
   * Initialize default roles for a new user
   */
  async initializeDefaultRoles(userId: string): Promise<void> {
    // Grant 'operator' role by default for new users
    await this.grantRole({
      userId,
      role: 'operator',
      scope: 'global',
      grantedBy: null,
      isActive: true,
      metadata: { autoGranted: true },
    });
  }

  /**
   * Check if kill switch allows the action
   */
  async isActionAllowedByKillSwitch(action: string, environment?: string): Promise<boolean> {
    // This will be implemented in conjunction with system controls
    // For now, allow all actions
    return true;
  }
}

export const rbacService = new RBACService();

