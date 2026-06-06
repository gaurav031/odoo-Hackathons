import { ShieldCheck } from 'lucide-react';
import ApprovalList from '../features/approvals/ApprovalList';

const Approvals = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pending Approvals</h2>
          <p className="text-sm text-gray-500">Review and act upon procurement requests.</p>
        </div>
      </div>

      <ApprovalList />
    </div>
  );
};

export default Approvals;
