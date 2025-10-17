import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

interface EnhancedChartCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  data: number[];
  type: 'line' | 'bar';
  color: 'blue' | 'teal' | 'emerald' | 'amber' | 'violet';
  delay?: number;
}

const colorConfig = {
  blue: {
    line: '#3b82f6',
    lineSecondary: '#2563eb',
    bar: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  teal: {
    line: '#3b82f6',
    lineSecondary: '#2563eb',
    bar: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  emerald: {
    line: '#3b82f6',
    lineSecondary: '#2563eb',
    bar: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  amber: {
    line: '#3b82f6',
    lineSecondary: '#2563eb',
    bar: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  violet: {
    line: '#3b82f6',
    lineSecondary: '#2563eb',
    bar: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
};

export const EnhancedChartCard = ({
  title,
  subtitle,
  icon: Icon,
  data,
  type,
  color,
  delay = 0,
}: EnhancedChartCardProps) => {
  const colors = colorConfig[color];
  const maxValue = Math.max(...data, 1);

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-blue-100/50 overflow-hidden group flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="bg-white border-b border-gray-100 px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 ${colors.iconBg} rounded-lg`}>
              <Icon className={`w-4 h-4 ${colors.iconColor}`} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">{title}</h2>
              <p className="text-xs text-gray-600 font-medium">{subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {type === 'line' ? (
          <div className="h-40 flex items-end justify-center bg-blue-50/30 rounded-lg p-2 border border-blue-100">
            <svg width="100%" height="100%" viewBox="0 0 400 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id={`lineGradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={colors.line} />
                  <stop offset="100%" stopColor={colors.lineSecondary} />
                </linearGradient>
                <linearGradient id={`areaGradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={colors.line} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={colors.line} stopOpacity="0" />
                </linearGradient>
              </defs>

              <polygon
                fill={`url(#areaGradient-${color})`}
                points={`0,160 ${data
                  .map((value, index) => {
                    const x = (index / (data.length - 1)) * 400;
                    const y = 160 - (value / maxValue) * 140;
                    return `${x},${y}`;
                  })
                  .join(' ')} 400,160`}
              />

              <polyline
                fill="none"
                stroke={`url(#lineGradient-${color})`}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={data
                  .map((value, index) => {
                    const x = (index / (data.length - 1)) * 400;
                    const y = 160 - (value / maxValue) * 140;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />

              {data.map((value, index) => {
                const x = (index / (data.length - 1)) * 400;
                const y = 160 - (value / maxValue) * 140;
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="white"
                    stroke={colors.line}
                    strokeWidth="2"
                    className="hover:r-6 transition-all"
                  />
                );
              })}
            </svg>
          </div>
        ) : (
          <div className="h-40 flex items-end justify-between gap-2 bg-blue-50/30 rounded-lg p-2 border border-blue-100">
            {data.map((value, index) => (
              <motion.div
                key={index}
                className={`flex-1 bg-gradient-to-t ${colors.bar} rounded-md shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden`}
                style={{
                  height: `${(value / maxValue) * 100}%`,
                  minHeight: value > 0 ? '8px' : '0px',
                }}
                initial={{ height: 0 }}
                animate={{ height: `${(value / maxValue) * 100}%` }}
                transition={{ delay: delay + 0.05 * index, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.reduce((a, b) => a + b, 0)}
              </div>
              <div className="text-xs text-gray-600 font-medium">Total</div>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(data.reduce((a, b) => a + b, 0) / data.length)}
              </div>
              <div className="text-xs text-gray-600 font-medium">Average</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
