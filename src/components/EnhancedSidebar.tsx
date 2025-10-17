import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  FileText,
  Star,
  Clock,
  Share2,
  PanelLeftClose,
  PanelLeft,
  Tag,
  Bookmark,
  Settings,
  FolderPlus,
  Keyboard,
  Folder,
  SlidersHorizontal,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useDocumentStore } from '../store/useDocumentStore';
import { CollapsibleSection } from './CollapsibleSection';
import { SearchSection } from './SearchSection';
import { ActiveFilters } from './ActiveFilters';
import { ResultStats } from './ResultStats';
import { SavedFilters } from './SavedFilters';
import { QuickTags } from './QuickTags';
import { EnhancedCategoryTreeItem } from './EnhancedCategoryTreeItem';
import { FolderSearchInput } from './FolderSearchInput';

const NewFolderModal = lazy(() => import('./ui/NewFolderModal').then(m => ({ default: m.NewFolderModal })));
const KeyboardShortcutsModal = lazy(() => import('./KeyboardShortcutsModal').then(m => ({ default: m.KeyboardShortcutsModal })));
import { type Document, type Category } from '../types';
import { createCategory } from '../services/categoryService';

export const EnhancedSidebar: React.FC = () => {
  const navigate = useNavigate();
  const {
    filters,
    setCategoryFilter,
    isSidebarCollapsed,
    toggleSidebar,
    getTotalDocumentCount,
    getFavoritesCount,
    getSharedCount,
    getCategoriesWithCounts,
    browseFolderContents,
    refreshCategories,
  } = useDocumentStore();

  const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [folderSearchQuery, setFolderSearchQuery] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const totalDocuments = getTotalDocumentCount();
  const favoritesCount = getFavoritesCount();
  const sharedCount = getSharedCount();
  const categoriesWithCounts = getCategoriesWithCounts();

  const mainMenuItems = [
    { icon: Home, label: 'Dashboard', id: 'dashboard', count: null, route: '/' },
    { icon: FileText, label: 'All Documents', id: null, count: totalDocuments, route: '/documents' },
    { icon: Star, label: 'Favorites', id: 'favorites', count: favoritesCount, route: '/documents' },
    { icon: Clock, label: 'Recent', id: 'recent', count: null, route: '/documents' },
    { icon: Share2, label: 'Shared with me', id: 'shared', count: sharedCount > 0 ? sharedCount : null, route: '/documents' },
  ];

  const documents = useDocumentStore((state) => state.documents);
  const setPreviewDocument = useDocumentStore((state) => state.setPreviewDocument);

  const handleCategoryClick = (categoryId: string) => {
    browseFolderContents(categoryId);
    navigate('/documents');
  };

  const handleDocumentClick = (document: Document) => {
    // When a file is clicked, set it as the preview document
    // Keep the folder context intact
    setPreviewDocument(document);
  };

  const handleCategoryUpdate = async () => {
    // Refresh categories from database after any CRUD operation
    await refreshCategories();
  };

  const handleCreateTopLevelFolder = async (folderName: string) => {
    setIsCreatingFolder(true);
    try {
      const { data, error } = await createCategory({
        name: folderName,
        parentId: null,
        color: '#3B82F6',
        icon: 'Folder',
      });

      if (!error && data) {
        await refreshCategories();
      }
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const filterCategories = (categories: Category[], query: string): Category[] => {
    if (!query.trim()) return categories;

    const lowerQuery = query.toLowerCase();
    return categories.filter(cat =>
      cat.name.toLowerCase().includes(lowerQuery)
    );
  };

  const filteredCategories = folderSearchQuery
    ? filterCategories(categoriesWithCounts, folderSearchQuery)
    : categoriesWithCounts;

  const parentCategories = filteredCategories.filter((cat) => !cat.parentId);
  const getChildCategories = (parentId: string) =>
    filteredCategories.filter((cat) => cat.parentId === parentId);
  const getCategoryDocuments = (categoryId: string) =>
    documents.filter((doc) => doc.categoryId === categoryId);

  const handleFolderSearch = (query: string) => {
    setFolderSearchQuery(query);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setShowShortcuts(true);
        return;
      }

      if (!navRef.current) return;

      const items = Array.from(navRef.current.querySelectorAll('[role="button"], button'));

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, items.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusedIndex(items.length - 1);
          break;
      }
    };

    if (navRef.current) {
      navRef.current.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (navRef.current) {
        navRef.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, []);

  useEffect(() => {
    if (focusedIndex >= 0 && navRef.current) {
      const items = Array.from(navRef.current.querySelectorAll('[role="button"], button'));
      const item = items[focusedIndex] as HTMLElement;
      item?.focus();
    }
  }, [focusedIndex]);

  if (isSidebarCollapsed) {
    return (
      <motion.aside
        initial={{ width: 64 }}
        animate={{ width: 64 }}
        className="w-16 bg-white/95 backdrop-blur-sm border-r border-gray-200 flex flex-col fixed h-[calc(100vh-4rem)] z-30 shadow-sm"
        role="navigation"
        aria-label="Sidebar navigation"
      >
        <div className="p-3 border-b border-gray-100">
          <motion.button
            onClick={toggleSidebar}
            className="w-full p-2.5 hover:bg-gray-100 rounded-xl transition-all flex items-center justify-center"
            aria-label="Expand sidebar"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PanelLeft className="w-5 h-5 text-gray-600" />
          </motion.button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2" ref={navRef}>
          {mainMenuItems.map((item) => {
            const isActive = filters.categoryId === item.id;
            return (
              <motion.button
                key={item.id || 'all'}
                onClick={() => {
                  if (item.id !== 'dashboard') {
                    setCategoryFilter(item.id);
                  }
                  navigate(item.route);
                }}
                className={`relative w-full p-3 flex items-center justify-center transition-all group ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={item.label}
                aria-label={item.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon className="w-5 h-5" />
                {isActive && (
                  <motion.div
                    layoutId="sidebarActive"
                    className="absolute inset-1 bg-blue-50 rounded-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 pointer-events-none whitespace-nowrap z-50 shadow-lg"
                >
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-4 border-transparent border-r-gray-900" />
                </motion.div>
              </motion.button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <motion.button
            onClick={() => navigate('/settings')}
            className="w-full p-2.5 hover:bg-gray-100 rounded-xl transition-all flex items-center justify-center"
            aria-label="Settings"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </motion.button>
        </div>
      </motion.aside>
    );
  }

  const activeFilterCount = (filters.categoryId ? 1 : 0) + filters.fileTypes.length + filters.tags.length;

  return (
    <motion.aside
      initial={{ width: 280 }}
      animate={{ width: 280 }}
      className="w-[280px] bg-gradient-to-b from-white to-gray-50/30 border-r border-gray-200 flex flex-col fixed h-[calc(100vh-4rem)] z-30 overflow-hidden shadow-sm"
      role="navigation"
      aria-label="Document library navigation"
    >
      <div className="p-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm flex items-center justify-between">
        <h2 className="font-bold text-gray-900 text-lg">Navigation</h2>
        <motion.button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          aria-label="Collapse sidebar"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <PanelLeftClose className="w-4 h-4 text-gray-600" />
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Search Section */}
        <SearchSection />

        {/* Active Filters */}
        <CollapsibleSection
          title="Active Filters"
          icon={SlidersHorizontal}
          defaultOpen={true}
          count={activeFilterCount > 0 ? activeFilterCount : undefined}
        >
          <div className="px-2">
            <ActiveFilters />
            <ResultStats />
          </div>
        </CollapsibleSection>

        {/* Quick Access */}
        <div className="px-3 py-4 border-b border-gray-100">
          <h3 className="px-3 pb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Quick Access</h3>
          <nav className="space-y-1" ref={navRef}>
            {mainMenuItems.map((item, index) => {
              const isActive = filters.categoryId === item.id;
              return (
                <motion.button
                  key={item.id || 'all'}
                  onClick={() => {
                    if (item.id !== 'dashboard') {
                      setCategoryFilter(item.id);
                    }
                    navigate(item.route);
                  }}
                  className={`relative w-full px-3 py-2.5 flex items-center gap-3 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'text-blue-700'
                      : 'text-gray-700 hover:bg-white hover:shadow-sm'
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="quickAccessActive"
                      className="absolute inset-0 bg-blue-50 rounded-lg -z-10 shadow-sm"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.count !== null && (
                    <motion.span
                      className="px-2 py-0.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      {item.count}
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Categories */}
        <CollapsibleSection
          title="Categories"
          icon={Folder}
          defaultOpen={true}
        >
          <div>
              <div className="px-2 mb-2">
                <button
                  onClick={() => setShowNewFolderModal(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <FolderPlus className="w-4 h-4 text-gray-500" />
                  <span>Create New Folder</span>
                </button>
              </div>
              <FolderSearchInput
                onSearch={handleFolderSearch}
                placeholder="Search folders..."
              />
              {parentCategories.length === 0 && !folderSearchQuery && (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Folder className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No folders yet</p>
                  <button
                    onClick={() => setShowNewFolderModal(true)}
                    className="mt-2 text-blue-600 hover:underline text-sm"
                  >
                    Create your first folder
                  </button>
                </div>
              )}
              {parentCategories.length === 0 && folderSearchQuery && (
                <div className="px-4 py-8 text-center text-gray-500">
                  <p className="text-sm">No folders match your search</p>
                </div>
              )}
              {isCreatingFolder && (
                <div className="px-4 py-2 flex items-center gap-2 text-sm text-gray-600 bg-blue-50 rounded-md mx-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>Creating folder...</span>
                </div>
              )}
              <div className="space-y-0.5">
                {parentCategories.map((category) => {
                  const childCategories = getChildCategories(category.id);
                  const categoryDocuments = getCategoryDocuments(category.id);

                  return (
                    <EnhancedCategoryTreeItem
                      key={category.id}
                      category={category}
                      childCategories={childCategories}
                      documents={categoryDocuments}
                      getCategoryDocuments={getCategoryDocuments}
                      getChildCategories={getChildCategories}
                      isSelected={filters.categoryId === category.id}
                      onSelect={(id) => {
                        handleCategoryClick(id);
                        setCategoryFilter(id);
                        navigate('/documents');
                      }}
                      onDocumentClick={handleDocumentClick}
                      onCategoryClick={handleCategoryClick}
                      onCategoryUpdate={handleCategoryUpdate}
                      animated={true}
                      level={0}
                    />
                  );
                })}
              </div>
            </div>
        </CollapsibleSection>

        {/* Quick Tags */}
        <CollapsibleSection
          title="Quick Tags"
          icon={Tag}
          defaultOpen={false}
        >
          <QuickTags />
        </CollapsibleSection>

        {/* Saved Filters */}
        <CollapsibleSection
          title="Saved Filters"
          icon={Bookmark}
          defaultOpen={false}
        >
          <SavedFilters />
        </CollapsibleSection>
      </div>

      <div className="p-3 border-t border-gray-100 bg-white/80 backdrop-blur-sm flex items-center gap-2">
        <motion.button
          onClick={() => setShowShortcuts(true)}
          className="flex-1 p-2.5 hover:bg-gray-100 rounded-lg transition-all flex items-center justify-center gap-2"
          aria-label="Keyboard shortcuts"
          title="Keyboard shortcuts (Press ?)"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Keyboard className="w-5 h-5 text-gray-600" />
          <span className="text-xs font-medium text-gray-600">Shortcuts</span>
        </motion.button>
        <motion.button
          onClick={() => navigate('/settings')}
          className="flex-1 p-2.5 hover:bg-gray-100 rounded-lg transition-all flex items-center justify-center gap-2"
          aria-label="Settings"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Settings className="w-5 h-5 text-gray-600" />
          <span className="text-xs font-medium text-gray-600">Settings</span>
        </motion.button>
      </div>

      <Suspense fallback={<div />}>
        <NewFolderModal
          isOpen={showNewFolderModal}
          onClose={() => setShowNewFolderModal(false)}
          onConfirm={handleCreateTopLevelFolder}
        />
      </Suspense>

      <Suspense fallback={<div />}>
        <KeyboardShortcutsModal
          isOpen={showShortcuts}
          onClose={() => setShowShortcuts(false)}
        />
      </Suspense>
    </motion.aside>
  );
};
