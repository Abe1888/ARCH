import { useState } from 'react';
import { AlertCircle, Download } from 'lucide-react';

interface VideoViewerProps {
  fileUrl: string;
  fileName: string;
}

export const VideoViewer = ({ fileUrl, fileName }: VideoViewerProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="flex items-center justify-center h-full bg-black p-4">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-sm text-gray-200">Loading video...</p>
          </div>
        </div>
      )}

      {error ? (
        <div className="text-center text-gray-300 max-w-md px-4">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">Unable to Load Video</p>
          <p className="text-sm mb-4">The video could not be loaded or is not supported by your browser.</p>
          <a
            href={fileUrl}
            download={fileName}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Video
          </a>
        </div>
      ) : (
        <video
          src={fileUrl}
          controls
          onLoadedData={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          className="max-w-full max-h-full"
          title={fileName}
          style={{ display: loading ? 'none' : 'block' }}
        >
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};
