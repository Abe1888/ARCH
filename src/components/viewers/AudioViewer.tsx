import { useState } from 'react';
import { Music, AlertCircle, Download } from 'lucide-react';

interface AudioViewerProps {
  fileUrl: string;
  fileName: string;
}

export const AudioViewer = ({ fileUrl, fileName }: AudioViewerProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <Music className="w-24 h-24 text-purple-600 mb-6" />
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{fileName}</h3>
      
      {loading && (
        <div className="mb-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      )}

      {error ? (
        <div className="text-center text-gray-500 max-w-md px-4">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-sm mb-4">Unable to load audio file.</p>
          <a
            href={fileUrl}
            download={fileName}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Audio
          </a>
        </div>
      ) : (
        <audio
          src={fileUrl}
          controls
          onLoadedData={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          className="w-full max-w-md"
          style={{ display: loading ? 'none' : 'block' }}
        >
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
};
