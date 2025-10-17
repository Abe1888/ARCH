import { useState } from 'react';
import { AlertCircle, Download } from 'lucide-react';

interface TiffViewerProps {
  fileUrl: string;
  fileName: string;
  zoom: number;
}

export const TiffViewer = ({ fileUrl, fileName, zoom }: TiffViewerProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const zoomScale = zoom / 100;

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-100 p-4">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-sm text-gray-600">Loading TIFF image...</p>
          </div>
        </div>
      )}
      
      {error ? (
        <div className="text-center text-gray-500 max-w-md px-4">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">Unable to Load TIFF Image</p>
          <p className="text-sm mb-4">This TIFF file may not be supported by your browser.</p>
          <a
            href={fileUrl}
            download={fileName}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Image
          </a>
        </div>
      ) : (
        <img
          src={fileUrl}
          alt={fileName}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          style={{ 
            transform: `scale(${zoomScale})`, 
            transformOrigin: 'center',
            display: loading ? 'none' : 'block'
          }}
          className="max-w-full max-h-full object-contain transition-transform"
        />
      )}
    </div>
  );
};
