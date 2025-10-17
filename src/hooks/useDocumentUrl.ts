import { useState, useEffect } from 'react';
import { getDocumentUrl } from '../services/documentService';

export function useDocumentUrl(filePath: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!filePath) {
      setUrl(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    getDocumentUrl(filePath)
      .then((signedUrl) => {
        if (isMounted) {
          setUrl(signedUrl);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Error getting document URL:', err);
          setError(err.message || 'Failed to load document');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [filePath]);

  return { url, loading, error };
}
