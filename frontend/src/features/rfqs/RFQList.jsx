import { useQuery } from '@tanstack/react-query';
import { Eye, Edit2, GitCompare } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const fetchRFQs = async () => {
  const response = await api.get('/rfqs');
  return response.data.data.rfqs;
};

const RFQList = () => {
  const { data: rfqs, isLoading, isError } = useQuery({
    queryKey: ['rfqs'],
    queryFn: fetchRFQs,
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading RFQs...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load RFQs</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
              <th className="p-4 font-medium">RFQ Number</th>
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Items</th>
              <th className="p-4 font-medium">Deadline</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rfqs?.map((rfq) => (
              <tr key={rfq._id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-sm font-bold text-primary-600">{rfq.rfqNumber}</td>
                <td className="p-4 text-sm text-gray-800 font-medium">{rfq.title}</td>
                <td className="p-4 text-sm text-gray-600">{rfq.items?.length || 0} items</td>
                <td className="p-4 text-sm text-gray-600">
                  {new Date(rfq.deadline).toLocaleDateString()}
                </td>
                <td className="p-4 text-sm">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${
                      rfq.status === 'Open'
                        ? 'bg-blue-100 text-blue-800'
                        : rfq.status === 'Awarded'
                        ? 'bg-green-100 text-green-800'
                        : rfq.status === 'Closed'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {rfq.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-right space-x-3">
                  <Link to={`/rfqs/${rfq._id}/compare`} className="text-primary-500 hover:text-primary-700 tooltip" title="Compare Quotes">
                    <GitCompare className="w-4 h-4 inline" />
                  </Link>
                  <button className="text-gray-500 hover:text-primary-600">
                    <Eye className="w-4 h-4 inline" />
                  </button>
                  <button className="text-gray-500 hover:text-primary-600">
                    <Edit2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
            {rfqs?.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  No RFQs found. Click "Create RFQ" to broadcast one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RFQList;
