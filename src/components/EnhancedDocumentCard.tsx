import { motion } from 'framer-motion';
import {
  Download,
  Star,
  Eye,
  MoreVertical,
  Share2,
  Calendar,
  FileType,
} from 'lucide-react';
import { type Document } from '../types';
import { FileTypeIcon } from './folders/FileTypeIcon';

interface EnhancedDocumentCardProps {
  document: Document;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
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

const getFileTypeGradient = (fileType: string) => {
  const lowerType = fileType.toLowerCase();

  if (lowerType.includes('pdf')) {
    return 'from-red-50 via-red-100/50 to-white';
  }
  if (lowerType.includes('sheet') || lowerType.includes('excel') || lowerType.includes('xls')) {
    return 'from-green-50 via-green-100/50 to-white';
  }
  if (lowerType.includes('word') || lowerType.includes('doc')) {
    return 'from-blue-50 via-blue-100/50 to-white';
  }
  if (lowerType.includes('presentation') || lowerType.includes('powerpoint') || lowerType.includes('ppt')) {
    return 'from-orange-50 via-orange-100/50 to-white';
  }
  if (lowerType.includes('image') || lowerType.includes('png') || lowerType.includes('jpg')) {
    return 'from-purple-50 via-purple-100/50 to-white';
  }
  if (lowerType.includes('video') || lowerType.includes('mp4') || lowerType.includes('mov')) {
    return 'from-pink-50 via-pink-100/50 to-white';
  }
  if (lowerType.includes('audio') || lowerType.includes('mp3')) {
    return 'from-cyan-50 via-cyan-100/50 to-white';
  }

  return 'from-gray-50 via-gray-100/50 to-white';
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

export const EnhancedDocumentCard: React.FC<EnhancedDocumentCardProps> = ({
  document: doc,
  index,
  isSelected,
  onSelect,
  onToggleFavorite,
}) => {
  const gradientClass = getFileTypeGradient(doc.fileType);
  const accentClass = getFileTypeAccent(doc.fileType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={`bg-white rounded-xl shadow-sm border transition-all duration-300 group relative overflow-hidden ${
        isSelected
          ? 'border-blue-500 shadow-xl ring-2 ring-blue-200 scale-[1.02]'
          : 'border-gray-200 hover:border-blue-300 hover:shadow-xl'
      }`}
    >
      <div
        className={`relative h-36 bg-gradient-to-br ${gradientClass} flex items-center justify-center cursor-pointer overflow-hidden`}
        onClick={onSelect}
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <motion.div
          whileHover={{ scale: 1.1, rotate: 3 }}
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          <FileTypeIcon fileType={doc.fileType} className="w-20 h-20 drop-shadow-lg" />
        </motion.div>

        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-lg transition-all shadow-sm"
          >
            <Star
              className={`w-4 h-4 ${
                doc.isFavorite
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-400'
              }`}
            />
          </motion.button>
        </div>

        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg ${accentClass} text-xs font-bold uppercase tracking-wide shadow-sm`}>
          {doc.fileType}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/10 to-transparent"></div>
      </div>

      <div className="p-4" onClick={onSelect}>
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-sm leading-snug cursor-pointer hover:text-blue-600 transition-colors">
          {doc.title}
        </h3>

        <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">
          {doc.description || 'No description available'}
        </p>

        {doc.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {doc.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 text-xs rounded-md font-medium border border-gray-200"
              >
                {tag}
              </span>
            ))}
            {doc.tags.length > 2 && (
              <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 text-xs rounded-md font-medium border border-blue-200">
                +{doc.tags.length - 2}
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <FileType className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-medium">{formatFileSize(doc.fileSize)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-medium">{formatDate(doc.uploadedAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500 py-2.5 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-semibold text-gray-700">{doc.viewCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-green-500" />
            <span className="font-semibold text-gray-700">{doc.downloadCount}</span>
          </div>
          <div className="ml-auto text-xs text-gray-500 font-medium">
            by {doc.uploadedBy}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileHover={{ opacity: 1, y: 0 }}
        className="border-t border-gray-100 px-4 py-3 bg-gradient-to-br from-gray-50 to-white flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-200"
      >
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-xs text-gray-600 hover:text-blue-600 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50"
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </motion.button>
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-xs text-gray-600 hover:text-green-600 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-green-50"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share
        </motion.button>
        <motion.button
          onClick={(e) => e.stopPropagation()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
