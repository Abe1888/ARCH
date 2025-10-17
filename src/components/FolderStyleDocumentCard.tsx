import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Star,
  Eye,
  Calendar,
  FileType as FileTypeIcon,
  User,
  X,
  Share2,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  File,
} from 'lucide-react';
import { type Document } from '../types';

interface FolderStyleDocumentCardProps {
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
    return 'linear-gradient(135deg, #c94855 0%, #a23644 50%, #8b2e3a 100%)';
  }
  if (lowerType.includes('sheet') || lowerType.includes('excel') || lowerType.includes('xls')) {
    return 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #14532d 100%)';
  }
  if (lowerType.includes('word') || lowerType.includes('doc')) {
    return 'linear-gradient(135deg, #2563eb 0%, #1e40af 50%, #1e3a8a 100%)';
  }
  if (lowerType.includes('presentation') || lowerType.includes('powerpoint') || lowerType.includes('ppt')) {
    return 'linear-gradient(135deg, #ea580c 0%, #c2410c 50%, #7c2d12 100%)';
  }
  if (lowerType.includes('image') || lowerType.includes('png') || lowerType.includes('jpg')) {
    return 'linear-gradient(135deg, #9333ea 0%, #7e22ce 50%, #581c87 100%)';
  }
  if (lowerType.includes('video') || lowerType.includes('mp4') || lowerType.includes('mov')) {
    return 'linear-gradient(135deg, #ec4899 0%, #be185d 50%, #831843 100%)';
  }
  if (lowerType.includes('audio') || lowerType.includes('mp3')) {
    return 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #164e63 100%)';
  }
  if (lowerType.includes('tiff') || lowerType.includes('tif')) {
    return 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #3730a3 100%)';
  }
  if (lowerType.includes('cad') || lowerType.includes('dwg') || lowerType.includes('dxf')) {
    return 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #92400e 100%)';
  }

  return 'linear-gradient(135deg, #c94855 0%, #a23644 50%, #8b2e3a 100%)';
};

const getFileTypeTabColor = (fileType: string) => {
  const lowerType = fileType.toLowerCase();

  if (lowerType.includes('pdf')) return '#34495e';
  if (lowerType.includes('sheet') || lowerType.includes('excel') || lowerType.includes('xls')) return '#166534';
  if (lowerType.includes('word') || lowerType.includes('doc')) return '#1e40af';
  if (lowerType.includes('presentation') || lowerType.includes('powerpoint') || lowerType.includes('ppt')) return '#9a3412';
  if (lowerType.includes('image') || lowerType.includes('png') || lowerType.includes('jpg')) return '#6b21a8';
  if (lowerType.includes('video') || lowerType.includes('mp4') || lowerType.includes('mov')) return '#9f1239';
  if (lowerType.includes('audio') || lowerType.includes('mp3')) return '#0e7490';
  if (lowerType.includes('tiff') || lowerType.includes('tif')) return '#4338ca';
  if (lowerType.includes('cad') || lowerType.includes('dwg') || lowerType.includes('dxf')) return '#a16207';

  return '#34495e';
};

const getFileTypeSecondPageColor = (fileType: string) => {
  const lowerType = fileType.toLowerCase();

  if (lowerType.includes('pdf')) return '#4a7c7e';
  if (lowerType.includes('sheet') || lowerType.includes('excel') || lowerType.includes('xls')) return '#15803d';
  if (lowerType.includes('word') || lowerType.includes('doc')) return '#1e3a8a';
  if (lowerType.includes('presentation') || lowerType.includes('powerpoint') || lowerType.includes('ppt')) return '#7c2d12';
  if (lowerType.includes('image') || lowerType.includes('png') || lowerType.includes('jpg')) return '#581c87';
  if (lowerType.includes('video') || lowerType.includes('mp4') || lowerType.includes('mov')) return '#831843';
  if (lowerType.includes('audio') || lowerType.includes('mp3')) return '#164e63';
  if (lowerType.includes('tiff') || lowerType.includes('tif')) return '#3730a3';
  if (lowerType.includes('cad') || lowerType.includes('dwg') || lowerType.includes('dxf')) return '#92400e';

  return '#4a7c7e';
};

const getFileTypeIcon = (fileType: string) => {
  const lowerType = fileType.toLowerCase();

  if (lowerType.includes('pdf')) return FileText;
  if (lowerType.includes('sheet') || lowerType.includes('excel') || lowerType.includes('xls')) return FileText;
  if (lowerType.includes('word') || lowerType.includes('doc')) return FileText;
  if (lowerType.includes('presentation') || lowerType.includes('powerpoint') || lowerType.includes('ppt')) return FileText;
  if (lowerType.includes('image') || lowerType.includes('png') || lowerType.includes('jpg')) return ImageIcon;
  if (lowerType.includes('video') || lowerType.includes('mp4') || lowerType.includes('mov')) return Video;
  if (lowerType.includes('audio') || lowerType.includes('mp3')) return Music;
  if (lowerType.includes('tiff') || lowerType.includes('tif')) return ImageIcon;
  if (lowerType.includes('cad') || lowerType.includes('dwg') || lowerType.includes('dxf')) return FileText;

  return File;
};

export const FolderStyleDocumentCard: React.FC<FolderStyleDocumentCardProps> = ({
  document: doc,
  index,
  onSelect,
  onToggleFavorite,
}) => {
  const [isOpened, setIsOpened] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const gradientStyle = getFileTypeGradient(doc.fileType);
  const tabColor = getFileTypeTabColor(doc.fileType);
  const secondPageColor = getFileTypeSecondPageColor(doc.fileType);
  const FileIconComponent = getFileTypeIcon(doc.fileType);

  const handleOpen = () => {
    if (!isOpened) {
      setIsOpened(true);
      onSelect();
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpened(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className={`relative w-full mx-auto h-[390px] sm:h-[465px] cursor-pointer select-none ${
        isOpened ? 'cursor-default' : ''
      }`}
      style={{
        perspective: '2000px',
        maxWidth: '338px'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={handleClose}
        className={`absolute top-5 right-5 z-50 w-10 h-10 bg-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 active:scale-95 ${
          isOpened ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ transform: isOpened ? 'scale(1)' : 'scale(0.8)' }}
        aria-label="Close folder"
      >
        <X className="w-6 h-6 text-gray-700" />
      </button>

      <motion.div
        className="absolute w-[98%] h-[98%] top-[1%] left-0 rounded-xl"
        style={{
          backgroundColor: secondPageColor,
          zIndex: 1,
          boxShadow: 'inset 2px 0px 5px rgba(0,0,0,0.1)',
          transformOrigin: 'left center',
          transformStyle: 'preserve-3d',
        }}
        animate={{
          rotateY: isHovered && !isOpened ? 0 : 5,
          x: isHovered && !isOpened ? 16 : 0,
        }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className={`w-full h-full p-6 sm:p-10 overflow-y-auto transition-opacity duration-500 ${
          isOpened ? 'opacity-100' : 'opacity-0'
        }`}>
          <h2 className="text-white text-xl sm:text-2xl font-semibold mb-5 mt-8">{doc.title}</h2>
          <div className="space-y-4 text-white/90">
            <p className="text-sm sm:text-base leading-relaxed">{doc.description || 'No description available'}</p>

            <div className="pt-5 space-y-3 border-t border-white/20">
              <div className="flex items-center gap-3 text-sm sm:text-base">
                <FileTypeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold">File Size:</span>
                <span>{formatFileSize(doc.fileSize)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm sm:text-base">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold">Uploaded:</span>
                <span>{formatDate(doc.uploadedAt)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm sm:text-base">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold">Uploaded By:</span>
                <span>{doc.uploadedBy}</span>
              </div>
              <div className="flex items-center gap-3 text-sm sm:text-base">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold">Views:</span>
                <span>{doc.viewCount}</span>
              </div>
              <div className="flex items-center gap-3 text-sm sm:text-base">
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold">Downloads:</span>
                <span>{doc.downloadCount}</span>
              </div>
            </div>

            {doc.tags.length > 0 && (
              <div className="pt-5">
                <p className="text-sm sm:text-base font-semibold mb-3">Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {doc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm rounded-md font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-5 flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-sm sm:text-base font-medium transition-colors">
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                Download
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-sm sm:text-base font-medium transition-colors">
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                Share
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute w-[98%] h-[98%] top-[1%] left-0 bg-gray-50 rounded-xl"
        style={{
          zIndex: 2,
          boxShadow: 'inset 2px 0px 5px rgba(0,0,0,0.1)',
          transformOrigin: 'left center',
          transformStyle: 'preserve-3d',
        }}
        animate={{
          rotateY: isHovered && !isOpened ? 0 : 10,
          x: isHovered && !isOpened ? 8 : 0,
        }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      />

      <motion.div
        className="absolute w-full h-full rounded-xl overflow-hidden"
        style={{
          background: gradientStyle,
          zIndex: 10,
          transformOrigin: 'left center',
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
        }}
        animate={{
          rotateY: isOpened ? -155 : (isHovered ? 0 : 15),
          x: isHovered && !isOpened ? -5 : 0,
          boxShadow: isOpened
            ? '-5px 5px 15px rgba(45, 25, 35, 0.25), -10px 10px 30px rgba(45, 25, 35, 0.25)'
            : isHovered
              ? '2px 2px 10px rgba(45, 25, 35, 0.25), 5px 5px 20px rgba(45, 25, 35, 0.25), 0 0 40px rgba(103, 206, 202, 0.2)'
              : '5px 5px 15px rgba(45, 25, 35, 0.25), 15px 15px 35px rgba(45, 25, 35, 0.25)',
        }}
        transition={{
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1],
        }}
        onClick={handleOpen}
      >
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-0 left-0 w-[200%] h-[200%] opacity-0"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              transform: 'rotate(30deg) translateX(-100%)',
            }}
            animate={{
              opacity: isHovered ? 1 : 0,
              x: isHovered ? '100%' : '-100%',
            }}
            transition={{
              opacity: { duration: 0.6 },
              x: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
            }}
          />

          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at top right, rgba(255,255,255,0.15), transparent 60%)',
            }}
            animate={{
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.6 }}
          />
        </div>

        <div className="relative w-full h-full p-6 sm:p-10 flex flex-col items-center text-white">
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-4 right-4 p-2.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors z-10"
          >
            <Star
              className={`w-5 h-5 ${
                doc.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-white'
              }`}
            />
          </motion.button>

          <motion.h1
            className="text-2xl sm:text-3xl font-black leading-tight text-center mt-16 sm:mt-20 px-6 uppercase tracking-tight text-white"
            style={{
              lineHeight: '1.2',
              textRendering: 'optimizeLegibility',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              fontWeight: 900,
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.05, duration: 1 }}
          >
            {doc.title.length > 30 ? doc.title.substring(0, 30) + '...' : doc.title}
          </motion.h1>

          <motion.div
            className="absolute bottom-6 right-6 z-20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + index * 0.05, duration: 0.5 }}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <FileIconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2.5} />
            </div>
          </motion.div>

          <svg className="absolute bottom-[-60px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-60 pointer-events-none" viewBox="0 0 600 300">
            <motion.path
              className="fill-none stroke-[rgba(255,255,255,0.4)] stroke-[1.5]"
              d="M 50 280 A 230 230 0 0 1 550 280"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0 + index * 0.05, ease: 'easeOut' }}
            />
            <motion.path
              className="fill-none stroke-[rgba(255,255,255,0.4)] stroke-[1.5]"
              d="M 70 280 A 210 210 0 0 1 530 280"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.1 + index * 0.05, ease: 'easeOut' }}
            />
            <motion.path
              className="fill-none stroke-[rgba(255,255,255,0.4)] stroke-[1.5]"
              d="M 90 280 A 190 190 0 0 1 510 280"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.2 + index * 0.05, ease: 'easeOut' }}
            />
            <motion.path
              className="fill-none stroke-[rgba(255,255,255,0.4)] stroke-[1.5]"
              d="M 110 280 A 170 170 0 0 1 490 280"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.3 + index * 0.05, ease: 'easeOut' }}
            />
            <motion.path
              className="fill-none stroke-[#5da8a6] stroke-[1.5]"
              d="M 130 280 A 150 150 0 0 1 470 280"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.4 + index * 0.05, ease: 'easeOut' }}
            />
            <motion.path
              className="fill-none stroke-[#5da8a6] stroke-[1.5]"
              d="M 150 280 A 130 130 0 0 1 450 280"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.5 + index * 0.05, ease: 'easeOut' }}
            />
            <g className="dots">
              {[
                { cx: 137, cy: 164, delay: 0.7 },
                { cx: 168, cy: 138, delay: 0.8 },
                { cx: 212, cy: 120, delay: 0.9 },
                { cx: 300, cy: 100, delay: 1.0 },
                { cx: 388, cy: 120, delay: 1.1 },
                { cx: 432, cy: 138, delay: 1.2 },
                { cx: 463, cy: 164, delay: 1.3 },
              ].map((dot, i) => (
                <motion.circle
                  key={i}
                  className="fill-[#5da8a6]"
                  cx={dot.cx}
                  cy={dot.cy}
                  r="4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: dot.delay + index * 0.05 }}
                />
              ))}
            </g>
          </svg>
        </div>
      </motion.div>

      <motion.div
        className="absolute top-28 sm:top-36 -right-5 w-11 sm:w-12 flex flex-col gap-4 sm:gap-5"
        style={{
          transformOrigin: 'left center',
          transformStyle: 'preserve-3d',
          zIndex: 9,
        }}
        animate={{
          rotateY: isHovered && !isOpened ? 0 : 10,
          x: isHovered && !isOpened ? 8 : 0,
          opacity: isOpened ? 0 : 1,
        }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.div
          className="h-28 sm:h-32 flex items-center justify-center rounded-r-lg shadow-md cursor-pointer px-2"
          style={{
            background: tabColor,
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
          }}
          whileHover={{ x: 3, boxShadow: '3px 3px 8px rgba(0,0,0,0.25)' }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-1 relative overflow-hidden">
            <motion.div
              className="absolute top-0 left-[-100%] w-full h-full"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              }}
              whileHover={{ left: '100%' }}
              transition={{ duration: 0.5 }}
            />
            <span className="text-white text-xs sm:text-sm font-bold z-10">01</span>
            <span className="text-white text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.15em] z-10">
              PAGE
            </span>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute top-52 sm:top-64 -right-5 w-11 sm:w-12"
        style={{
          transformOrigin: 'left center',
          transformStyle: 'preserve-3d',
          zIndex: 1.5,
        }}
        animate={{
          rotateY: isHovered && !isOpened ? 0 : 10,
          x: isHovered && !isOpened ? 8 : 0,
          opacity: isOpened ? 0 : 1,
        }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.div
          className="h-28 sm:h-32 flex items-center justify-center rounded-r-lg shadow-md cursor-pointer"
          style={{
            background: secondPageColor,
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            paddingLeft: '0.8rem',
          }}
          whileHover={{ x: 3, boxShadow: '3px 3px 8px rgba(0,0,0,0.25)' }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-1 relative overflow-hidden">
            <motion.div
              className="absolute top-0 left-[-100%] w-full h-full"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              }}
              whileHover={{ left: '100%' }}
              transition={{ duration: 0.5 }}
            />
            <span className="text-white text-xs sm:text-sm font-bold z-10">02</span>
            <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.15em] z-10 text-white">
              PAGE
            </span>
          </div>
        </motion.div>
      </motion.div>

    </motion.div>
  );
};
