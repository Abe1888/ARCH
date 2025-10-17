import { motion } from 'framer-motion';
import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface EnhancedStatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'blue' | 'emerald' | 'amber' | 'violet' | 'rose' | 'teal';
  delay?: number;
}

const colorClasses = {
  blue: {
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    accentColor: 'text-blue-600',
    borderColor: 'border-blue-100',
  },
  emerald: {
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    accentColor: 'text-blue-600',
    borderColor: 'border-blue-100',
  },
  amber: {
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    accentColor: 'text-blue-600',
    borderColor: 'border-blue-100',
  },
  violet: {
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    accentColor: 'text-blue-600',
    borderColor: 'border-blue-100',
  },
  rose: {
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    accentColor: 'text-blue-600',
    borderColor: 'border-blue-100',
  },
  teal: {
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    accentColor: 'text-blue-600',
    borderColor: 'border-blue-100',
  },
};

export const EnhancedStatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color,
  delay = 0,
}: EnhancedStatCardProps) => {
  const colors = colorClasses[color];

  return (
    <motion.div
      className={`relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer border ${colors.borderColor}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -3, scale: 1.01 }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 ${colors.iconBg} rounded-lg transition-all duration-300 group-hover:scale-110`}>
            <Icon className={`w-5 h-5 ${colors.iconColor}`} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${
              trend.isPositive ? 'bg-green-50' : 'bg-red-50'
            }`}>
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3 text-green-600" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600" />
              )}
              <span className={`text-xs font-semibold ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>{trend.value}%</span>
            </div>
          )}
        </div>

        <div className="space-y-0.5">
          <div className={`text-2xl font-bold ${colors.accentColor} transition-all duration-300`}>
            {value}
          </div>
          <div className="text-sm font-medium text-gray-600">
            {title}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
