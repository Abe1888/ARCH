import { useEffect } from 'react';
import { useDocumentStore } from '../store/useDocumentStore';

export function useDocumentInit() {
  const { refreshDocuments, refreshCategories, refreshSharedDocuments, initializeRealtime, cleanupRealtime } = useDocumentStore();

  useEffect(() => {
    const init = async () => {
      try {
        await refreshCategories();
        await refreshDocuments();
        await refreshSharedDocuments();
        initializeRealtime();
      } catch (error) {
        console.error('Error initializing documents:', error);
      }
    };

    init();

    return () => {
      cleanupRealtime();
    };
  }, [refreshDocuments, refreshCategories, refreshSharedDocuments, initializeRealtime, cleanupRealtime]);
}
