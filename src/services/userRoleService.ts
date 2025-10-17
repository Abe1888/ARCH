import { supabase } from '../lib/supabase';

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface UserWithAuth {
  user_id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  job_title: string | null;
  phone: string | null;
  employee_id: string | null;
  department: string | null;
  avatar_url: string | null;
  permissions: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  role: UserRole;
  full_name?: string;
  job_title?: string;
  phone?: string;
  employee_id?: string;
  department?: string;
}

export interface UpdateUserData {
  role?: UserRole;
  full_name?: string;
  job_title?: string;
  phone?: string;
  employee_id?: string;
  department?: string;
  permissions?: Record<string, any>;
}

export const userRoleService = {
  async isAdmin(): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_admin');

      if (error) {
        console.error('[userRoleService.isAdmin] RPC error:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('[userRoleService.isAdmin] Exception:', error);
      return false;
    }
  },

  async getAllUsers(): Promise<UserWithAuth[]> {
    try {
      const { data, error } = await supabase.rpc('list_all_users');

      if (error) {
        console.error('[userRoleService.getAllUsers] RPC error:', error);
        throw new Error(error.message || 'Failed to fetch users');
      }

      return (data || []) as UserWithAuth[];
    } catch (error: any) {
      console.error('[userRoleService.getAllUsers] Exception:', error);
      throw error;
    }
  },

  async createUser(userData: CreateUserData): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name,
          },
        },
      });

      if (authError || !authData.user) {
        return { success: false, error: authError?.message || 'User creation failed' };
      }

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: userData.role,
          full_name: userData.full_name || null,
          job_title: userData.job_title || null,
          phone: userData.phone || null,
          employee_id: userData.employee_id || null,
          department: userData.department || null,
          permissions: {},
        });

      if (roleError) {
        return { success: false, error: roleError.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error' };
    }
  },

  async updateUser(userId: string, userData: UpdateUserData): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('update_user_role_and_profile', {
        p_user_id: userId,
        p_role: userData.role || null,
        p_full_name: userData.full_name || null,
        p_job_title: userData.job_title || null,
        p_phone: userData.phone || null,
        p_employee_id: userData.employee_id || null,
        p_department: userData.department || null,
        p_permissions: userData.permissions || null,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data && !data.success) {
        return { success: false, error: data.message || 'Update failed' };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error' };
    }
  },

  async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('delete_user_account', {
        p_user_id: userId,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data && !data.success) {
        return { success: false, error: data.message || 'Delete failed' };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error' };
    }
  },
};
