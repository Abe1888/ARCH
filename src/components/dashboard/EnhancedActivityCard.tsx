import { motion } from 'framer-motion';
import { type LucideIcon, Upload, FileText, Clock } from 'lucide-react';

interface Activity {
  id: string;
  time: string;
  description: string;
}

interface EnhancedActivityCardProps {
  title: string;
  icon: LucideIcon;
  activities: Activity[];
  delay?: number;
}

export const EnhancedActivityCard = ({
  title,
  icon: Icon,
  activities,
  delay = 0,
}: EnhancedActivityCardProps) => {
  const getActivityIcon = (index: number) => {
    const icons = [Upload, FileText, Clock];
    return icons[index % icons.length];
  };

  const getActivityColor = (index: number) => {
    const colors = [
      'bg-blue-50 text-blue-600',
      'bg-blue-100 text-blue-700',
      'bg-blue-50 text-blue-600',
    ];
    return colors[index % colors.length];
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-blue-100/50 overflow-hidden flex flex-col min-h-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="bg-white border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
        </div>
      </div>

      <div className="p-5 flex-1 overflow-auto">
        <div className="space-y-2">
          {activities.length > 0 ? (
            activities.map((activity, index) => {
              const ActivityIcon = getActivityIcon(index);
              const colorClass = getActivityColor(index);

              return (
                <motion.div
                  key={activity.id}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group border border-transparent hover:border-blue-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: delay + 0.1 * index }}
                  whileHover={{ x: 2 }}
                >
                  <div className={`p-1.5 rounded-lg ${colorClass} flex-shrink-0 transition-all`}>
                    <ActivityIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-blue-600">
                        {activity.time}
                      </span>
                      <span className="text-xs text-gray-600 line-clamp-2">
                        {activity.description}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-6">
              <Clock className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-500 font-medium">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
