import { FileX, Download } from 'lucide-react';

interface UnsupportedViewerProps {
  fileUrl: string;
  fileName: string;
  fileType: string;
}

export const UnsupportedViewer = ({
  fileUrl,
  fileName,
  fileType,
}: UnsupportedViewerProps) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-8">
      <FileX className="w-24 h-24 text-gray-400 mb-6" />
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Preview Not Available
      </h3>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        This file type ({fileType}) cannot be previewed in the browser. You can download
        the file to view it with an appropriate application.
      </p>
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Download className="w-5 h-5" />
        Download {fileName}
      </button>
    </div>
  );
};
