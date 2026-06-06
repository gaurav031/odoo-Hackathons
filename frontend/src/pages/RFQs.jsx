import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import RFQList from '../features/rfqs/RFQList';

const RFQs = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Request for Quotations (RFQs)</h2>
          <p className="text-sm text-gray-500 mt-1">Manage active and past RFQs and review vendor bids.</p>
        </div>
        <Link
          to="/rfqs/create"
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create RFQ</span>
        </Link>
      </div>

      <RFQList />
    </div>
  );
};

export default RFQs;
