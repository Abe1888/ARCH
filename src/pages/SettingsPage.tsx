import React, { useState } from 'react';
import { Settings, User, FolderTree, Bell, Shield, LogOut, Users, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserManagementSection } from '../components/settings/UserManagementSection';
import { CategoryManagementSection } from '../components/settings/CategoryManagementSection';
import { ProfileSettingsSection } from '../components/settings/ProfileSettingsSection';
import { useAuth } from '../contexts/AuthContext';

export const SettingsPage: React.FC = () => {
  const { signOut } = useAuth();
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      showNotification('Successfully signed out', 'success');
    } catch (error) {
      showNotification('Failed to sign out', 'error');
    }
  };

  const settingsSections = [
    {
      id: 'profile',
      title: 'Profile Settings',
      icon: User,
      description: 'Manage your account information',
      content: <ProfileSettingsSection onNotify={showNotification} />,
    },
    {
      id: 'users',
      title: 'User Management',
      icon: Users,
      description: 'Manage user accounts and roles',
      content: <UserManagementSection onNotify={showNotification} />,
    },
    {
      id: 'categories',
      title: 'Category Management',
      icon: FolderTree,
      description: 'Create and organize document categories',
      content: <CategoryManagementSection onNotify={showNotification} />,
    },
    {
      id: 'storage',
      title: 'Storage Management',
      icon: Database,
      description: 'Monitor and manage storage usage',
      content: <div className="p-4 text-gray-600">Storage management coming soon</div>,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      description: 'Configure notification preferences',
      content: <div className="p-4 text-gray-600">Notification settings coming soon</div>,
    },
    {
      id: 'security',
      title: 'Security',
      icon: Shield,
      description: 'Manage security settings',
      content: <div className="p-4 text-gray-600">Security settings coming soon</div>,
    },
  ];

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-blue-50/30 overflow-y-auto">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-6 py-4 lg:py-6">
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-4 rounded-lg ${
              notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {notification.message}
          </motion.div>
        )}

        <div className="mb-6 bg-white rounded-2xl px-6 py-4 shadow-sm border border-blue-100/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-0.5">Settings</h1>
              <p className="text-sm text-gray-600">Manage your account and system preferences</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {settingsSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.id}
                className="bg-white border border-blue-100/50 rounded-2xl overflow-hidden shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-base font-bold text-gray-900">{section.title}</h2>
                      <p className="text-sm text-gray-600 mt-0.5">{section.description}</p>
                    </div>
                  </div>
                </div>
                <div className="p-5">{section.content}</div>
              </motion.div>
            );
          })}

          <motion.div
            className="bg-white border border-red-200 rounded-2xl p-5 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: settingsSections.length * 0.05 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <LogOut className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Sign Out</h2>
                  <p className="text-sm text-gray-600 mt-0.5">Sign out of your account</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
