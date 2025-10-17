import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Edit, Trash2, Loader, AlertCircle } from 'lucide-react';
import { userRoleService } from '../../services/userRoleService';
import { supabase } from '../../lib/supabase';
import { CategoryModal } from './CategoryModal';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  parent_id: string | null;
  created_at: string;
}

interface CategoryManagementSectionProps {
  onNotify?: (message: string, type: 'success' | 'error') => void;
}

export const CategoryManagementSection: React.FC<CategoryManagementSectionProps> = ({ onNotify }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    const checkAdminAndLoadCategories = async () => {
      setIsAdmin(null);

      const adminStatus = await userRoleService.isAdmin();
      setIsAdmin(adminStatus);

      if (adminStatus) {
        await loadCategories();
      }
    };

    checkAdminAndLoadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      console.log('Loading categories...');

      // Use the same approach as other components - fetch all and sort manually
      const { data, error } = await supabase
        .from('categories')
        .select();

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      console.log('Categories loaded:', data);

      // Sort manually by created_at descending
      const sortedData = (data || []).sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setCategories(sortedData);
    } catch (error: any) {
      console.error('Error loading categories:', error);
      onNotify?.('Failed to load categories: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? Documents in this category will not be deleted.')) {
      return;
    }

    setDeletingCategoryId(categoryId);
    try {
      console.log('Deleting category:', categoryId);

      // Fetch all categories first, then filter to find the one to delete
      const { data: allCategories, error: fetchError } = await supabase
        .from('categories')
        .select();

      if (fetchError) {
        console.error('Error fetching categories for deletion:', fetchError);
        throw fetchError;
      }

      const categoryToDelete = allCategories?.find(cat => cat.id === categoryId);

      if (!categoryToDelete) {
        throw new Error('Category not found');
      }

      // Now delete using the RPC approach or direct delete
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .match({ id: categoryId });

      if (deleteError) {
        console.error('Error deleting category:', deleteError);
        throw deleteError;
      }

      console.log('Category deleted successfully');
      onNotify?.('Category deleted successfully', 'success');
      await loadCategories();
    } catch (error: any) {
      console.error('Exception in handleDeleteCategory:', error);
      onNotify?.('Error: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleModalClose = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const handleModalSuccess = async () => {
    await loadCategories();
    handleModalClose();
  };

  if (isAdmin === null) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-orange-900">Access Restricted</p>
            <p className="text-sm text-orange-700 mt-1">
              Only administrators can access category management features.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FolderTree className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Category Management</h3>
            <p className="text-sm text-gray-600 mt-0.5">Create and organize document categories</p>
          </div>
        </div>
        <button
          onClick={handleAddCategory}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12">
          <FolderTree className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No categories found</p>
          <p className="text-sm text-gray-500 mt-1">Create your first category to organize documents</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Color</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Created</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <FolderTree className="w-5 h-5" style={{ color: category.color }} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{category.name}</p>
                        <p className="text-xs text-gray-500">{category.icon}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border border-gray-200"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm text-gray-600 font-mono">{category.color}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600">
                      {new Date(category.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Category"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={deletingCategoryId === category.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete Category"
                      >
                        {deletingCategoryId === category.id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        Showing {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
      </div>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        categoryToEdit={editingCategory}
      />
    </div>
  );
};
