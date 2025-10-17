import React, { useMemo, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDocumentStore } from '../store/useDocumentStore';
import { useDocumentInit } from '../hooks/useDocumentInit';
import { Loader as Loader2, FileText, Upload, Search, Settings, FileStack, Printer, Home, Scan, File as FileEdit, TrendingUp, Activity, ChartBar as BarChart3, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PerformanceWidget } from '../components/dashboard/PerformanceWidget';
import { EnhancedStatCard } from '../components/dashboard/EnhancedStatCard';
import { EnhancedActivityCard } from '../components/dashboard/EnhancedActivityCard';
import { EnhancedChartCard } from '../components/dashboard/EnhancedChartCard';

const AdvancedSearchModal = lazy(() => import('../components/AdvancedSearchModal').then(m => ({ default: m.AdvancedSearchModal })));
const UploadModal = lazy(() => import('../components/UploadModal').then(m => ({ default: m.UploadModal })));

export const DashboardPage: React.FC = () => {
  useDocumentInit();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    documents,
    isLoading,
    isUploadModalOpen,
    setUploadModalOpen,
  } = useDocumentStore();
  const [isSoftCopyMode, setIsSoftCopyMode] = useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);

  const totalDocuments = documents.length;

  const scannedToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return documents.filter(doc => {
      const docDate = new Date(doc.uploadedAt);
      docDate.setHours(0, 0, 0, 0);
      return docDate.getTime() === today.getTime();
    }).length;
  }, [documents]);

  const storageUsed = useMemo(() => {
    const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
    const maxStorage = 100 * 1024 * 1024 * 1024;
    return Math.round((totalSize / maxStorage) * 100);
  }, [documents]);

  const recentActivity = useMemo(() => {
    return documents
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, 3)
      .map(doc => ({
        id: doc.id,
        time: new Date(doc.uploadedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        description: `${doc.fileName} uploaded by ${user?.email?.split('@')[0] || 'User'}`,
      }));
  }, [documents, user]);

  const dailyScansData = useMemo(() => {
    const data = [];
    for (let i = 49; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const count = documents.filter(doc => {
        const docDate = new Date(doc.uploadedAt);
        docDate.setHours(0, 0, 0, 0);
        return docDate.getTime() === date.getTime();
      }).length;

      data.push(count);
    }
    return data;
  }, [documents]);

  const documentAnalytics = useMemo(() => {
    const last6Days = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const count = documents.filter(doc => {
        const docDate = new Date(doc.uploadedAt);
        docDate.setHours(0, 0, 0, 0);
        return docDate.getTime() === date.getTime();
      }).length;

      last6Days.push(count);
    }
    return last6Days;
  }, [documents]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-blue-50/30 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-[1920px] mx-auto px-6 py-4 flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0 bg-white rounded-2xl px-6 py-4 shadow-sm border border-blue-100/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-0.5">Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, <span className="font-semibold text-blue-600">{user?.email?.split('@')[0] || 'User'}</span></p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-blue-700">System Active</span>
              </div>
            </div>
          </motion.div>

          <div className="flex-1 min-h-0 grid grid-cols-12 gap-4">
            <div className="col-span-12 grid grid-cols-4 gap-4">
              <EnhancedStatCard
                title="Total Documents"
                value={totalDocuments.toLocaleString()}
                icon={FileStack}
                trend={{ value: 12, isPositive: true }}
                color="blue"
                delay={0.05}
              />
              <EnhancedStatCard
                title="Scanned Today"
                value={scannedToday.toString()}
                icon={Scan}
                trend={{ value: 8, isPositive: true }}
                color="blue"
                delay={0.1}
              />
              <EnhancedStatCard
                title="Storage Used"
                value={`${storageUsed}%`}
                icon={BarChart3}
                trend={{ value: 3, isPositive: false }}
                color="blue"
                delay={0.15}
              />
              <EnhancedStatCard
                title="Active Workflows"
                value="2"
                icon={Activity}
                color="blue"
                delay={0.2}
              />
            </div>

            <div className="col-span-8 flex flex-col gap-4 min-h-0">
              <motion.div
                className="bg-white rounded-2xl shadow-sm border border-blue-100/50 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <div className="bg-white border-b border-gray-100 px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Home className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-base font-bold text-gray-900">Quick Actions</h2>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-3">
                    <motion.button
                      onClick={() => navigate('/upload')}
                      className="flex flex-col items-center gap-2.5 p-3.5 bg-gradient-to-br from-blue-50 to-white hover:from-blue-100 hover:to-blue-50 rounded-xl transition-all shadow-sm hover:shadow-md border border-blue-200 group"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="p-2.5 bg-blue-500 rounded-lg transition-all duration-300 group-hover:bg-blue-600 shadow-sm">
                        <Printer className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 text-center leading-tight">Scan & Upload</span>
                    </motion.button>

                    <motion.button
                      onClick={() => {
                        setIsSoftCopyMode(true);
                        setUploadModalOpen(true);
                      }}
                      className="flex flex-col items-center gap-2.5 p-3.5 bg-gradient-to-br from-blue-50 to-white hover:from-blue-100 hover:to-blue-50 rounded-xl transition-all shadow-sm hover:shadow-md border border-blue-200 group"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="p-2.5 bg-blue-500 rounded-lg transition-all duration-300 group-hover:bg-blue-600 shadow-sm">
                        <FileEdit className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 text-center leading-tight">Upload Soft Copy</span>
                    </motion.button>

                    <motion.button
                      onClick={() => {
                        setIsSoftCopyMode(false);
                        setUploadModalOpen(true);
                      }}
                      className="flex flex-col items-center gap-2.5 p-3.5 bg-gradient-to-br from-blue-50 to-white hover:from-blue-100 hover:to-blue-50 rounded-xl transition-all shadow-sm hover:shadow-md border border-blue-200 group"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="p-2.5 bg-blue-500 rounded-lg transition-all duration-300 group-hover:bg-blue-600 shadow-sm">
                        <Upload className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 text-center leading-tight">Upload Files</span>
                    </motion.button>

                    <motion.button
                      onClick={() => setIsAdvancedSearchOpen(true)}
                      className="flex flex-col items-center gap-2.5 p-3.5 bg-gradient-to-br from-blue-50 to-white hover:from-blue-100 hover:to-blue-50 rounded-xl transition-all shadow-sm hover:shadow-md border border-blue-200 group"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="p-2.5 bg-blue-500 rounded-lg transition-all duration-300 group-hover:bg-blue-600 shadow-sm">
                        <Search className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 text-center leading-tight">Search</span>
                    </motion.button>

                    <motion.button
                      onClick={() => navigate('/upload')}
                      className="flex flex-col items-center gap-2.5 p-3.5 bg-gradient-to-br from-blue-50 to-white hover:from-blue-100 hover:to-blue-50 rounded-xl transition-all shadow-sm hover:shadow-md border border-blue-200 group"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="p-2.5 bg-blue-500 rounded-lg transition-all duration-300 group-hover:bg-blue-600 shadow-sm">
                        <Scan className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 text-center leading-tight">Scan</span>
                    </motion.button>

                    <motion.button
                      onClick={() => navigate('/settings')}
                      className="flex flex-col items-center gap-2.5 p-3.5 bg-gradient-to-br from-blue-50 to-white hover:from-blue-100 hover:to-blue-50 rounded-xl transition-all shadow-sm hover:shadow-md border border-blue-200 group"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="p-2.5 bg-blue-500 rounded-lg transition-all duration-300 group-hover:bg-blue-600 shadow-sm">
                        <Settings className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 text-center leading-tight">Settings</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-2 gap-4">
                <EnhancedChartCard
                  title="Daily Scans"
                  subtitle="Last 50 Days"
                  icon={TrendingUp}
                  data={dailyScansData}
                  type="line"
                  color="blue"
                  delay={0.3}
                />

                <EnhancedChartCard
                  title="Document Analytics"
                  subtitle="Last 6 Days"
                  icon={BarChart3}
                  data={documentAnalytics}
                  type="bar"
                  color="blue"
                  delay={0.35}
                />
              </div>
            </div>

            <div className="col-span-4 flex flex-col gap-4 min-h-0">
              <EnhancedActivityCard
                title="Recent Activity"
                icon={Clock}
                activities={recentActivity}
                delay={0.4}
              />

              <motion.div
                className="bg-white rounded-2xl shadow-sm border border-blue-100/50 overflow-hidden flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <div className="bg-white border-b border-gray-100 px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-base font-bold text-gray-900">Pending Workflows</h2>
                  </div>
                </div>
                <div className="p-4 flex-1 overflow-auto">
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50/50 transition-all duration-200 cursor-pointer border border-transparent hover:border-blue-200">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all"
                      />
                      <span className="text-sm text-gray-700 font-medium">Approve Client Onboarding Docs</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50/50 transition-all duration-200 cursor-pointer border border-transparent hover:border-blue-200">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all"
                      />
                      <span className="text-sm text-gray-700 font-medium">Categorize Old Blueprints</span>
                    </label>
                  </div>
                </div>
              </motion.div>

              <PerformanceWidget className="flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={<div />}>
        <AdvancedSearchModal
          isOpen={isAdvancedSearchOpen}
          onClose={() => setIsAdvancedSearchOpen(false)}
        />
      </Suspense>

      <Suspense fallback={<div />}>
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setUploadModalOpen(false);
            setIsSoftCopyMode(false);
          }}
          initialSoftCopyMode={isSoftCopyMode}
        />
      </Suspense>
    </div>
  );
};
