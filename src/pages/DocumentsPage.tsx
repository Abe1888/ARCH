import React, { useState, lazy, Suspense } from 'react';
import { Grid2x2 as Grid, List, SlidersHorizontal, ArrowUpDown, Layers3, ChevronRight, Folder, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDocumentStore } from '../store/useDocumentStore';
import { DocumentGrid } from '../components/DocumentGrid';
import { DocumentList } from '../components/DocumentList';
import { EnhancedSidebar } from '../components/EnhancedSidebar';
import { FilterPanel } from '../components/FilterPanel';
import { useDocumentInit } from '../hooks/useDocumentInit';
import { DocumentGridSkeleton } from '../components/ui/DocumentGridSkeleton';
import { DocumentListSkeleton } from '../components/ui/DocumentListSkeleton';

const DocumentDetailModal = lazy(() => import('../components/DocumentDetailModal').then(m => ({ default: m.DocumentDetailModal })));
const UploadModal = lazy(() => import('../components/UploadModal').then(m => ({ default: m.UploadModal })));

export const DocumentsPage: React.FC = () => {
  useDocumentInit();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const {
    viewMode,
    use3DView,
    isLoading,
    isFolderLoading,
    setViewMode,
    toggle3DView,
    selectedDocument,
    setSelectedDocument,
    setPreviewDocument,
    isUploadModalOpen,
    setUploadModalOpen,
    preSelectedCategoryId,
    getFilteredDocuments,
    filters,
    setSortBy,
    setSortOrder,
    browseFolderContents,
    getCategoriesWithCounts,
    isSidebarCollapsed,
  } = useDocumentStore();

  const documents = getFilteredDocuments();

  // Get current category and its subfolders
  const categoriesWithCounts = getCategoriesWithCounts();
  const currentCategory = filters.categoryId
    ? categoriesWithCounts.find(c => c.id === filters.categoryId)
    : null;

  const subfolders = currentCategory
    ? categoriesWithCounts.filter(c => c.parentId === currentCategory.id)
    : [];

  // Build breadcrumb trail
  const buildBreadcrumbs = () => {
    if (!currentCategory) return [];
    const trail = [currentCategory];
    let parent = categoriesWithCounts.find(c => c.id === currentCategory.parentId);
    while (parent) {
      trail.unshift(parent);
      parent = categoriesWithCounts.find(c => c.id === parent?.parentId);
    }
    return trail;
  };

  const breadcrumbs = buildBreadcrumbs();

  const hasActiveFilters =
    filters.search ||
    filters.categoryId ||
    filters.fileTypes.length > 0 ||
    filters.tags.length > 0;

  return (
    <div className="flex h-full">
      <EnhancedSidebar />

      <div className={`flex-1 overflow-auto transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-16' : 'ml-[280px]'
      }`}>
        <div className="p-4 lg:p-6">
          {breadcrumbs.length > 0 && (
            <motion.div
              className="mb-6 flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center text-sm text-gray-600">
                {breadcrumbs.map((category, index) => (
                  <React.Fragment key={category.id}>
                    {index > 0 && <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />}
                    {index === breadcrumbs.length - 1 ? (
                      <span className="font-semibold text-gray-900">{category.name}</span>
                    ) : (
                      <button
                        onClick={() => browseFolderContents(category.id)}
                        className="hover:text-blue-600 hover:underline"
                      >
                        {category.name}
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {currentCategory && (
                <motion.button
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-md transition-all text-sm font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download className="w-4 h-4" />
                  Download
                </motion.button>
              )}
            </motion.div>
          )}

      <motion.div
        className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {viewMode === 'grid' && (
            <button
              onClick={toggle3DView}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                use3DView
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
              title="Toggle 3D folder view"
            >
              <Layers3 className="w-4 h-4" />
              <span className="text-sm font-medium">3D</span>
            </button>
          )}

          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <ArrowUpDown className="w-4 h-4 text-gray-600" />
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-') as [
                  'name' | 'date' | 'size' | 'type',
                  'asc' | 'desc'
                ];
                setSortBy(sortBy);
                setSortOrder(sortOrder);
              }}
              className="text-sm text-gray-700 border-none focus:outline-none bg-transparent cursor-pointer"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="size-desc">Largest First</option>
              <option value="size-asc">Smallest First</option>
              <option value="type-asc">Type (A-Z)</option>
            </select>
          </div>

          {hasActiveFilters && (
            <motion.div
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 rounded-lg text-sm font-medium"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <span>Filters active</span>
              <span className="text-blue-500">•</span>
              <span>{documents.length} results</span>
            </motion.div>
          )}
        </div>

        <motion.button
          onClick={() => setIsFilterOpen(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
            hasActiveFilters
              ? 'bg-blue-50 border-blue-200 text-blue-700 hover:shadow-md'
              : 'bg-white border-gray-200 text-gray-700 hover:shadow-md'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="font-medium">Filters</span>
          {hasActiveFilters && (
            <motion.span
              className="min-w-[20px] h-5 px-1.5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-semibold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            >
              {(filters.fileTypes.length || 0) + (filters.tags.length || 0)}
            </motion.span>
          )}
        </motion.button>
      </motion.div>

      <motion.div
        className="mb-6 flex items-center justify-between text-sm text-gray-700 bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="font-medium">
          Showing <span className="text-blue-600 font-bold">{documents.length}</span>{' '}
          documents
          {subfolders.length > 0 && (
            <span> and <span className="text-blue-600 font-bold">{subfolders.length}</span> folders</span>
          )}
        </p>
        {filters.categoryId && !currentCategory && (
          <p className="text-sm">
            In category:{' '}
            <span className="font-bold text-gray-900">
              {filters.categoryId === 'favorites' && 'Favorites'}
              {filters.categoryId === 'recent' && 'Recent'}
              {filters.categoryId === 'shared' && 'Shared with me'}
            </span>
          </p>
        )}
      </motion.div>

      {subfolders.length > 0 && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Folders</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {subfolders.map((subfolder, index) => {
              return (
                <motion.button
                  key={subfolder.id}
                  onClick={() => browseFolderContents(subfolder.id)}
                  className="flex items-start gap-3 p-5 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all group text-left"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <Folder className="w-9 h-9 text-amber-500 group-hover:text-amber-600 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {subfolder.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1.5 font-medium">
                      {subfolder.documentCount} {subfolder.documentCount === 1 ? 'document' : 'documents'}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {(isLoading || isFolderLoading) ? (
        <div>
          {viewMode === 'grid' ? (
            <DocumentGridSkeleton count={8} />
          ) : (
            <DocumentListSkeleton count={10} />
          )}
        </div>
      ) : documents.length > 0 ? (
        <div>
          {subfolders.length > 0 && (
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Documents</h2>
          )}
          <div onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('[data-preview-trigger]')) {
              const docId = target.closest('[data-preview-trigger]')?.getAttribute('data-doc-id');
              const doc = documents.find(d => d.id === docId);
              if (doc) {
                setPreviewDocument(doc);
              }
            }
          }}>
            {viewMode === 'grid' ? (
              <DocumentGrid documents={documents} use3DView={use3DView} />
            ) : (
              <DocumentList documents={documents} />
            )}
          </div>
        </div>
      ) : null}

      {!isLoading && subfolders.length === 0 && documents.length === 0 && filters.categoryId && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Folder className="w-20 h-20 mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">Empty Folder</p>
          <p className="text-sm">This folder doesn't contain any documents or subfolders yet</p>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Upload Documents
          </button>
        </div>
      )}

      {!isLoading && subfolders.length === 0 && documents.length === 0 && !filters.categoryId && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Folder className="w-20 h-20 mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No Documents</p>
          <p className="text-sm mb-4">Get started by uploading your first document</p>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Upload Documents
          </button>
        </div>
      )}

      <FilterPanel isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />

      {selectedDocument && (
        <Suspense fallback={<div />}>
          <DocumentDetailModal
            document={selectedDocument}
            onClose={() => setSelectedDocument(null)}
          />
        </Suspense>
      )}

      <Suspense fallback={<div />}>
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          preSelectedCategoryId={preSelectedCategoryId}
        />
      </Suspense>
        </div>
      </div>
    </div>
  );
};
