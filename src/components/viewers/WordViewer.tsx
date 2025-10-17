import { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { AlertCircle, Download } from 'lucide-react';

interface WordViewerProps {
  fileUrl: string;
  fileName: string;
  zoom: number;
}

export const WordViewer = ({ fileUrl, fileName, zoom }: WordViewerProps) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadDocument = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(fileUrl, {
          mode: 'cors',
          credentials: 'omit',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch document: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();

        if (!mounted) return;

        const result = await mammoth.convertToHtml({ arrayBuffer });
        
        if (!mounted) return;

        setHtmlContent(result.value);
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        console.error('WordViewer error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load document');
        setLoading(false);
      }
    };

    loadDocument();

    return () => {
      mounted = false;
    };
  }, [fileUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-sm text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500 max-w-md px-4">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">Unable to Load Document</p>
          <p className="text-sm mb-4">{error}</p>
          <a
            href={fileUrl}
            download={fileName}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Document
          </a>
        </div>
      </div>
    );
  }

  const zoomScale = zoom / 100;

  return (
    <div className="h-full overflow-auto bg-gray-100 p-8">
      <div
        className="max-w-4xl mx-auto bg-white shadow-lg p-12 rounded-lg"
        style={{ 
          transform: `scale(${zoomScale})`, 
          transformOrigin: 'top center',
          marginBottom: zoomScale !== 1 ? `${(zoomScale - 1) * 100}%` : '0'
        }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};
