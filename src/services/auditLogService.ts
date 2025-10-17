import { supabase } from '../lib/supabase';

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  metadata: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export const auditLogService = {
  /**
   * FIX: Properly construct the Supabase query chain with await at the beginning.
   * This ensures all query methods (.order, .limit) are called on the query builder
   * before the promise is awaited.
   */
  async getRecentLogs(limit = 50): Promise<AuditLog[]> {
    // Construct the complete query chain, then await it
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      // Throw error so it can be caught by the calling component
      throw new Error(`Failed to fetch recent logs: ${error.message}`);
    }

    return data || [];
  },

  /**
   * FIX: Properly construct the Supabase query chain with await at the beginning.
   * The query builder methods must be chained before awaiting the result.
   */
  async getUserLogs(userId: string, limit = 50): Promise<AuditLog[]> {
    // Construct the complete query chain, then await it
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      // Throw error so it can be caught by the calling component
      throw new Error(`Failed to fetch user logs: ${error.message}`);
    }

    return data || [];
  },

  /**
   * FIX: Properly construct the RPC call with await at the beginning.
   * This logs an action by calling a database stored procedure.
   */
  async logAction(
    action: string,
    resourceType: string,
    resourceId: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    // Execute the RPC call with proper error handling
    const { error } = await supabase.rpc('create_audit_log', {
      p_action: action,
      p_resource_type: resourceType,
      p_resource_id: resourceId,
      p_metadata: metadata,
    });

    if (error) {
      // Throw error so it can be caught by the calling component
      throw new Error(`Failed to log action: ${error.message}`);
    }
  },
};
