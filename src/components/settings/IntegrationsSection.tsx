import { Link2 } from 'lucide-react';

export const IntegrationsSection = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Link2 className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Integrations</h3>
      </div>
      <p className="text-gray-600">Integration features coming soon.</p>
    </div>
  );
};
