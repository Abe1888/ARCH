import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface RealtimeContextType {
  refreshTrigger: number;
}

const RealtimeContext = createContext<RealtimeContextType>({ refreshTrigger: 0 });

export const useRealtimeRefresh = () => useContext(RealtimeContext);

interface RealtimeProviderProps {
  children: ReactNode;
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const channels: RealtimeChannel[] = [];

    // Subscribe to user_roles table changes
    const userRolesChannel = supabase
      .channel('user_roles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles'
        },
        () => {
          setRefreshTrigger(prev => prev + 1);
        }
      )
      .subscribe();

    channels.push(userRolesChannel);

    // Subscribe to documents table changes
    const documentsChannel = supabase
      .channel('documents_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents'
        },
        () => {
          setRefreshTrigger(prev => prev + 1);
        }
      )
      .subscribe();

    channels.push(documentsChannel);

    // Subscribe to categories table changes
    const categoriesChannel = supabase
      .channel('categories_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories'
        },
        () => {
          setRefreshTrigger(prev => prev + 1);
        }
      )
      .subscribe();

    channels.push(categoriesChannel);

    // Subscribe to document_versions table changes
    const versionsChannel = supabase
      .channel('document_versions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'document_versions'
        },
        () => {
          setRefreshTrigger(prev => prev + 1);
        }
      )
      .subscribe();

    channels.push(versionsChannel);

    // Subscribe to sharing table changes
    const sharingChannel = supabase
      .channel('sharing_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sharing'
        },
        () => {
          setRefreshTrigger(prev => prev + 1);
        }
      )
      .subscribe();

    channels.push(sharingChannel);

    // Subscribe to audit_logs table changes
    const auditLogsChannel = supabase
      .channel('audit_logs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audit_logs'
        },
        () => {
          setRefreshTrigger(prev => prev + 1);
        }
      )
      .subscribe();

    channels.push(auditLogsChannel);

    // Cleanup function to unsubscribe from all channels
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, []);

  return (
    <RealtimeContext.Provider value={{ refreshTrigger }}>
      {children}
    </RealtimeContext.Provider>
  );
}
