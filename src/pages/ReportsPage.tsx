import React, { useState } from 'react';
import { TrendingUp, FileText, Download, Activity, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'workflows' | 'reports'>('workflows');

  const pendingWorkflows = [
    { id: 1, title: 'Approve Client Onboarding Docs', status: 'pending', priority: 'high' },
    { id: 2, title: 'Categorize Old Blueprints', status: 'in-progress', priority: 'medium' },
    { id: 3, title: 'Review Q1 Financial Reports', status: 'pending', priority: 'high' },
    { id: 4, title: 'Archive Legacy Documents', status: 'in-progress', priority: 'low' },
  ];

  const completedWorkflows = [
    { id: 5, title: 'Monthly Document Audit', completedAt: '2 hours ago' },
    { id: 6, title: 'Vendor Contract Processing', completedAt: '5 hours ago' },
    { id: 7, title: 'Employee Records Update', completedAt: '1 day ago' },
  ];

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-blue-50/30 overflow-y-auto">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-6 py-4 lg:py-6">
        <div className="mb-6 bg-white rounded-2xl px-6 py-4 shadow-sm border border-blue-100/50">
          <h1 className="text-2xl font-bold text-gray-900 mb-0.5">Workflow & Reports</h1>
          <p className="text-sm text-gray-600">
            Track document workflows and generate analytics reports
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            className="bg-white border border-blue-100/50 rounded-2xl p-5 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-500">This Month</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">1,247</p>
              <p className="text-xs text-gray-600">Documents Processed</p>
              <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>12% increase</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white border border-blue-100/50 rounded-2xl p-5 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-500">Active</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">24</p>
              <p className="text-xs text-gray-600">Active Workflows</p>
              <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>8% increase</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white border border-blue-100/50 rounded-2xl p-5 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-500">Average</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">2.4</p>
              <p className="text-xs text-gray-600">Days to Process</p>
              <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>15% faster</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white border border-blue-100/50 rounded-2xl p-5 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-500">Completed</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">142</p>
              <p className="text-xs text-gray-600">This Week</p>
              <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>18% increase</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-blue-100/50 overflow-hidden mb-5">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('workflows')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                activeTab === 'workflows'
                  ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Activity className="w-4 h-4" />
                Workflows
              </div>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                activeTab === 'reports'
                  ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                Reports & Analytics
              </div>
            </button>
          </div>

          {activeTab === 'workflows' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900">Pending & Active</h3>
                    </div>
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg">
                      {pendingWorkflows.length} items
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {pendingWorkflows.map((workflow) => (
                      <motion.div
                        key={workflow.id}
                        className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all border border-transparent hover:border-blue-200 group"
                        whileHover={{ x: 2 }}
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                            {workflow.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                              workflow.status === 'pending'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {workflow.status === 'pending' ? 'Pending' : 'In Progress'}
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                              workflow.priority === 'high'
                                ? 'bg-red-100 text-red-700'
                                : workflow.priority === 'medium'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {workflow.priority}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900">Recently Completed</h3>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {completedWorkflows.map((workflow) => (
                      <div
                        key={workflow.id}
                        className="flex items-start gap-3 p-3.5 bg-green-50/50 rounded-xl border border-green-100"
                      >
                        <div className="p-1 bg-green-500 rounded-full mt-0.5">
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {workflow.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Completed {workflow.completedAt}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900">Document Types</h3>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Download className="w-3.5 h-3.5" />
                      Export
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-medium text-gray-700">PDF Documents</span>
                        <span className="font-bold text-gray-900">45%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '45%' }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-medium text-gray-700">Word Documents</span>
                        <span className="font-bold text-gray-900">30%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '30%' }}
                          transition={{ duration: 1, delay: 0.4 }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-medium text-gray-700">Spreadsheets</span>
                        <span className="font-bold text-gray-900">15%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '15%' }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-medium text-gray-700">Other</span>
                        <span className="font-bold text-gray-900">10%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '10%' }}
                          transition={{ duration: 1, delay: 0.6 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900">Processing Metrics</h3>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Average Processing Time</span>
                        <span className="text-lg font-bold text-blue-600">2.4 days</span>
                      </div>
                      <p className="text-xs text-gray-600">15% faster than last month</p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Success Rate</span>
                        <span className="text-lg font-bold text-green-600">98.5%</span>
                      </div>
                      <p className="text-xs text-gray-600">Above target threshold</p>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Pending Reviews</span>
                        <span className="text-lg font-bold text-amber-600">12</span>
                      </div>
                      <p className="text-xs text-gray-600">Requires attention</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
