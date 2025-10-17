import { motion } from 'framer-motion';
import {
  Download,
  Star,
  Eye,
  MoreVertical,
  Share2,
  Calendar,
  User,
} from 'lucide-react';
import { type Document } from '../types';
import { useDocumentStore } from '../store/useDocumentStore';
import { FileTypeIcon } from './folders/FileTypeIcon';

interface DocumentListProps {
  documents: Document[];
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};


const getFileTypeAccent = (fileType: string) => {
  const lowerType = fileType.toLowerCase();

  if (lowerType.includes('pdf')) return 'text-red-600 bg-red-100';
  if (lowerType.includes('sheet') || lowerType.includes('excel') || lowerType.includes('xls')) return 'text-green-600 bg-green-100';
  if (lowerType.includes('word') || lowerType.includes('doc')) return 'text-blue-600 bg-blue-100';
  if (lowerType.includes('presentation') || lowerType.includes('powerpoint') || lowerType.includes('ppt')) return 'text-orange-600 bg-orange-100';
  if (lowerType.includes('image') || lowerType.includes('png') || lowerType.includes('jpg')) return 'text-purple-600 bg-purple-100';
  if (lowerType.includes('video') || lowerType.includes('mp4') || lowerType.includes('mov')) return 'text-pink-600 bg-pink-100';
  if (lowerType.includes('audio') || lowerType.includes('mp3')) return 'text-cyan-600 bg-cyan-100';

  return 'text-gray-600 bg-gray-100';
};

export const DocumentList: React.FC<DocumentListProps> = ({ documents }) => {
  const { setPreviewDocument, setViewMode, toggleFavorite, previewDocument } = useDocumentStore();

  const isDocumentSelected = (docId: string) => previewDocument?.id === docId;

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <FileTypeIcon fileType="document" className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium">No documents found</p>
        <p className="text-sm">Try adjusting your filters or search query</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc, index) => {
        const accentClass = getFileTypeAccent(doc.fileType);
        const isSelected = isDocumentSelected(doc.id);

        return (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03, duration: 0.3 }}
            whileHover={{ x: 4, transition: { duration: 0.2 } }}
            className={`bg-white rounded-xl shadow-sm border transition-all duration-300 group cursor-pointer overflow-hidden ${
              isSelected
                ? 'border-blue-500 shadow-lg ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
            }`}
            onClick={() => {
              setViewMode('list');
              setPreviewDocument(doc);
            }}
          >
            <div className="p-5">
              <div className="flex items-center gap-4">
                {/* File Icon */}
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl ${accentClass.split(' ')[1]} flex items-center justify-center shadow-sm`}>
                    <FileTypeIcon fileType={doc.fileType} className={`w-6 h-6 ${accentClass.split(' ')[0]}`} />
                  </div>
                </div>

                {/* Document Name & Tags */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors mb-1">
                    {doc.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {doc.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 text-xs rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    {doc.tags.length > 3 && (
                      <span className="text-xs text-gray-500 font-medium">
                        +{doc.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* File Type Badge */}
                <div className="flex-shrink-0 hidden sm:block">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${accentClass}`}>
                    {doc.fileType}
                  </span>
                </div>

                {/* Size */}
                <div className="flex-shrink-0 hidden md:block text-right min-w-[80px]">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatFileSize(doc.fileSize)}
                  </div>
                </div>

                {/* Uploaded By */}
                <div className="flex-shrink-0 hidden lg:block min-w-[180px]">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{doc.uploadedBy}</span>
                  </div>
                </div>

                {/* Date */}
                <div className="flex-shrink-0 hidden lg:block min-w-[120px]">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{formatDate(doc.uploadedAt)}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex-shrink-0 hidden xl:flex items-center gap-4 min-w-[100px]">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">{doc.viewCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Download className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">{doc.downloadCount}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(doc.id);
                    }}
                    className="p-2 hover:bg-white/80 backdrop-blur-sm rounded-lg transition-all duration-200 hover:scale-110"
                    aria-label="Toggle favorite"
                  >
                    <Star
                      className={`w-4 h-4 transition-all ${
                        doc.isFavorite
                          ? 'fill-yellow-400 text-yellow-400 scale-110'
                          : 'text-gray-400 hover:text-yellow-400'
                      }`}
                    />
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 hover:bg-white/80 backdrop-blur-sm rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
                    aria-label="Download"
                  >
                    <Download className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 hover:bg-white/80 backdrop-blur-sm rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
                    aria-label="Share"
                  >
                    <Share2 className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 hover:bg-white/80 backdrop-blur-sm rounded-lg transition-all duration-200 hover:scale-110"
                    aria-label="More options"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
