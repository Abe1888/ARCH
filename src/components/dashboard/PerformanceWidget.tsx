import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { usePerformanceMetrics } from '../../hooks/usePerformanceMetrics';
import { queryMonitor } from '../../services/queryMonitor';
import { monitoringService } from '../../services/monitoringService';

interface PerformanceWidgetProps {
  className?: string;
}

export function PerformanceWidget({ className = '' }: PerformanceWidgetProps) {
  const metrics = usePerformanceMetrics();
  const [queryStats, setQueryStats] = useState({
    totalQueries: 0,
    averageDuration: 0,
    slowQueries: 0,
    failedQueries: 0,
  });

  useEffect(() => {
    const updateQueryStats = () => {
      const slowQueries = queryMonitor.getSlowQueries();
      const failedQueries = queryMonitor.getFailedQueries();
      const querySummary = monitoringService.getQueryMetricsSummary();

      setQueryStats({
        totalQueries: querySummary.totalQueries,
        averageDuration: querySummary.averageDuration,
        slowQueries: slowQueries.length,
        failedQueries: failedQueries.length,
      });
    };

    updateQueryStats();
    const interval = setInterval(updateQueryStats, 5000);

    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-4 h-4" />;
    if (score >= 70) return <Activity className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  const calculatePerformanceScore = (): number => {
    let score = 100;

    if (metrics.fcp > 1800) score -= 20;
    else if (metrics.fcp > 1000) score -= 10;

    if (metrics.lcp > 2500) score -= 20;
    else if (metrics.lcp > 1500) score -= 10;

    if (metrics.cls > 0.25) score -= 20;
    else if (metrics.cls > 0.1) score -= 10;

    if (metrics.fid > 100) score -= 20;
    else if (metrics.fid > 50) score -= 10;

    if (queryStats.averageDuration > 500) score -= 10;
    if (queryStats.slowQueries > 0) score -= 5;
    if (queryStats.failedQueries > 0) score -= 10;

    return Math.max(0, Math.min(100, score));
  };

  const performanceScore = calculatePerformanceScore();

  return (
    <motion.div
      className={`bg-white rounded-2xl p-4 shadow-sm border border-blue-100/50 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Performance</h3>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${getScoreColor(performanceScore)} ${
          performanceScore >= 90 ? 'bg-green-50' : performanceScore >= 70 ? 'bg-yellow-50' : 'bg-red-50'
        }`}>
          {getScoreIcon(performanceScore)}
          <span className="text-lg font-bold">{performanceScore}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Core Web Vitals</h4>
          <div className="grid grid-cols-2 gap-2">
            <MetricCard
              label="FCP"
              value={metrics.fcp.toFixed(0)}
              unit="ms"
              threshold={1800}
              good={1000}
            />
            <MetricCard
              label="LCP"
              value={metrics.lcp.toFixed(0)}
              unit="ms"
              threshold={2500}
              good={1500}
            />
            <MetricCard
              label="FID"
              value={metrics.fid.toFixed(0)}
              unit="ms"
              threshold={100}
              good={50}
            />
            <MetricCard
              label="CLS"
              value={metrics.cls.toFixed(3)}
              unit=""
              threshold={0.25}
              good={0.1}
            />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Database</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50/50 rounded-lg p-2 border border-blue-100">
              <div className="text-xs text-gray-600 mb-0.5 font-medium">Queries</div>
              <div className="text-sm font-bold text-blue-600">{queryStats.totalQueries}</div>
            </div>
            <div className="bg-blue-50/50 rounded-lg p-2 border border-blue-100">
              <div className="text-xs text-gray-600 mb-0.5 font-medium">Avg Time</div>
              <div className="text-sm font-bold text-blue-600">
                {queryStats.averageDuration.toFixed(0)}ms
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  unit: string;
  threshold: number;
  good: number;
}

function MetricCard({ label, value, unit, threshold, good }: MetricCardProps) {
  const numValue = parseFloat(value);
  const status = numValue === 0 ? 'unknown' : numValue <= good ? 'good' : numValue <= threshold ? 'needs-improvement' : 'poor';

  const statusColors = {
    good: 'bg-green-50/50 border-green-200',
    'needs-improvement': 'bg-yellow-50/50 border-yellow-200',
    poor: 'bg-red-50/50 border-red-200',
    unknown: 'bg-gray-50 border-gray-200',
  };

  const textColors = {
    good: 'text-green-600',
    'needs-improvement': 'text-yellow-600',
    poor: 'text-red-600',
    unknown: 'text-gray-600',
  };

  const icons = {
    good: <TrendingUp className="w-3 h-3" />,
    'needs-improvement': <Activity className="w-3 h-3" />,
    poor: <TrendingDown className="w-3 h-3" />,
    unknown: <Activity className="w-3 h-3" />,
  };

  return (
    <div className={`rounded-lg p-2 border ${statusColors[status]} transition-all`}>
      <div className="flex items-center justify-between mb-0.5">
        <div className="text-xs text-gray-600 font-medium">{label}</div>
        <div className={textColors[status]}>
          {icons[status]}
        </div>
      </div>
      <div className={`text-sm font-bold ${textColors[status]}`}>
        {value === '0' ? '-' : `${value}${unit}`}
      </div>
    </div>
  );
}
