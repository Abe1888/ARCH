import React, { lazy, Suspense } from 'react';
import { detectFileFormat } from '../utils/fileFormatDetector';

const PDFViewer = lazy(() => import('./PDFViewer').then(m => ({ default: m.PDFViewer })));
const ImageViewer = lazy(() => import('./viewers/ImageViewer').then(m => ({ default: m.ImageViewer })));
const VideoViewer = lazy(() => import('./viewers/VideoViewer').then(m => ({ default: m.VideoViewer })));
const AudioViewer = lazy(() => import('./viewers/AudioViewer').then(m => ({ default: m.AudioViewer })));
const WordViewer = lazy(() => import('./viewers/WordViewer').then(m => ({ default: m.WordViewer })));
const ExcelViewer = lazy(() => import('./viewers/ExcelViewer').then(m => ({ default: m.ExcelViewer })));
const TiffViewer = lazy(() => import('./viewers/TiffViewer').then(m => ({ default: m.TiffViewer })));
const UnsupportedViewer = lazy(() => import('./viewers/UnsupportedViewer').then(m => ({ default: m.UnsupportedViewer })));

const ViewerLoadingFallback = () => (
  <div className="flex items-center justify-center h-full min-h-[400px]">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
      <p className="text-sm text-gray-600">Loading viewer...</p>
    </div>
  </div>
);

interface UnifiedDocumentViewerProps {
  fileUrl: string;
  fileName: string;
  fileType: string;
  zoom?: number;
}

export const UnifiedDocumentViewer: React.FC<UnifiedDocumentViewerProps> = ({
  fileUrl,
  fileName,
  fileType,
  zoom = 100,
}) => {
  const formatInfo = detectFileFormat(fileName, fileType);

  const renderViewer = () => {
    switch (formatInfo.format) {
      case 'pdf':
        return <PDFViewer fileUrl={fileUrl} fileName={fileName} zoom={zoom} />;

      case 'image':
        return <ImageViewer fileUrl={fileUrl} fileName={fileName} zoom={zoom} />;

      case 'tiff':
        return <TiffViewer fileUrl={fileUrl} fileName={fileName} zoom={zoom} />;

      case 'video':
        return <VideoViewer fileUrl={fileUrl} fileName={fileName} />;

      case 'audio':
        return <AudioViewer fileUrl={fileUrl} fileName={fileName} />;

      case 'word':
        return <WordViewer fileUrl={fileUrl} fileName={fileName} zoom={zoom} />;

      case 'excel':
        return <ExcelViewer fileUrl={fileUrl} fileName={fileName} zoom={zoom} />;

      case 'powerpoint':
      case 'cad':
      case 'unsupported':
      default:
        return (
          <UnsupportedViewer
            fileUrl={fileUrl}
            fileName={fileName}
            fileType={formatInfo.format}
          />
        );
    }
  };

  return (
    <Suspense fallback={<ViewerLoadingFallback />}>
      {renderViewer()}
    </Suspense>
  );
};
