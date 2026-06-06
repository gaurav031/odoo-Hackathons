import { useQuery } from '@tanstack/react-query';
import { Activity, Clock, User, FileText, CheckCircle, ShieldCheck, FileDigit, Receipt } from 'lucide-react';
import api from '../api/axios';

const fetchActivities = async () => {
  const response = await api.get('/activities?limit=50');
  return response.data.data.activities;
};

const getEntityIcon = (type) => {
  switch (type) {
    case 'RFQ': return <FileText className="w-5 h-5 text-blue-500" />;
    case 'Quotation': return <FileText className="w-5 h-5 text-indigo-500" />;
    case 'Approval': return <ShieldCheck className="w-5 h-5 text-orange-500" />;
    case 'PurchaseOrder': return <FileDigit className="w-5 h-5 text-green-500" />;
    case 'Invoice': return <Receipt className="w-5 h-5 text-purple-500" />;
    case 'Vendor': return <User className="w-5 h-5 text-gray-500" />;
    default: return <Activity className="w-5 h-5 text-gray-400" />;
  }
};

const getActionColor = (action) => {
  switch (action) {
    case 'CREATED': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'GENERATED': return 'text-purple-600 bg-purple-50 border-purple-200';
    case 'APPROVED': return 'text-green-600 bg-green-50 border-green-200';
    case 'REJECTED': return 'text-red-600 bg-red-50 border-red-200';
    case 'UPDATED': return 'text-orange-600 bg-orange-50 border-orange-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const ActivityLogs = () => {
  const { data: activities, isLoading, isError } = useQuery({
    queryKey: ['activities'],
    queryFn: fetchActivities,
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-gray-100 text-gray-600 rounded-lg">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Activity Timeline & Audit Logs</h2>
          <p className="text-sm text-gray-500">Track all major procurement events and state transitions.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {isLoading && <div className="text-center text-gray-500 py-8">Loading timeline...</div>}
        {isError && <div className="text-center text-red-500 py-8">Failed to load activity logs.</div>}

        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
          {activities?.map((activity) => (
            <div key={activity._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-gray-50 text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                {getEntityIcon(activity.entityType)}
              </div>
              
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded border ${getActionColor(activity.action)}`}>
                    {activity.action}
                  </span>
                  <div className="flex items-center text-xs text-gray-400 font-medium">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {new Date(activity.createdAt).toLocaleString()}
                  </div>
                </div>
                <p className="text-sm text-gray-700 font-medium leading-relaxed">{activity.details}</p>
                <div className="mt-3 flex items-center text-xs text-gray-500">
                  <User className="w-3.5 h-3.5 mr-1" />
                  Performed by <span className="font-bold ml-1 text-gray-700">{activity.performedBy?.name || 'System'}</span>
                  {activity.performedBy?.role && <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">{activity.performedBy.role}</span>}
                </div>
              </div>
            </div>
          ))}

          {activities?.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 relative z-10">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-gray-700">No activity recorded yet.</p>
              <p className="text-sm">Major procurement actions will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
