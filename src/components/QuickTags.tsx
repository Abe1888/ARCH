import { motion } from 'framer-motion';
import { useDocumentStore } from '../store/useDocumentStore';
import { useMemo } from 'react';

export const QuickTags: React.FC = () => {
  const { filters, setTagFilter, documents } = useDocumentStore();

  const tagsWithCounts = useMemo(() => {
    const tagMap = new Map<string, number>();

    documents.forEach(doc => {
      doc.tags.forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [documents]);

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    setTagFilter(newTags);
  };

  if (tagsWithCounts.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-gray-500">
        <p className="text-xs">No tags available</p>
        <p className="text-xs mt-1 text-gray-400">Add tags to your documents to see them here</p>
      </div>
    );
  }

  return (
    <div className="px-2 space-y-2">
      <div className="flex flex-wrap gap-2">
        {tagsWithCounts.map(({ tag, count }, index) => {
          const isActive = filters.tags.includes(tag);
          return (
            <motion.button
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all transform hover:scale-105 flex items-center gap-1.5 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-pressed={isActive}
              aria-label={`Filter by ${tag} tag`}
            >
              <span>{tag}</span>
              <span className={`text-xs ${isActive ? 'text-blue-200' : 'text-gray-500'}`}>
                {count}
              </span>
            </motion.button>
          );
        })}
      </div>

      {filters.tags.length > 0 && (
        <button
          onClick={() => setTagFilter([])}
          className="w-full px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Clear Tag Filters
        </button>
      )}
    </div>
  );
};
