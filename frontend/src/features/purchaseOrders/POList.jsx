import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, Download, CheckCircle, Truck, Receipt } from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import POViewModal from './POViewModal';
import GenerateInvoiceModal from '../invoices/GenerateInvoiceModal';

const fetchPOs = async () => {
  const response = await api.get('/purchase-orders');
  return response.data.data.pos;
};

const POList = () => {
  const { user } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const [selectedPO, setSelectedPO] = useState(null);
  const [invoicePO, setInvoicePO] = useState(null);

  const { data: pos, isLoading, isError } = useQuery({
    queryKey: ['pos'],
    queryFn: fetchPOs,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/purchase-orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pos']);
      alert('PO Status Updated!');
    },
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Purchase Orders...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load Purchase Orders</div>;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-medium">PO Number</th>
                <th className="p-4 font-medium">Vendor</th>
                <th className="p-4 font-medium">RFQ Title</th>
                <th className="p-4 font-medium">Total Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pos?.map((po) => (
                <tr key={po._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm font-bold text-primary-600">{po.poNumber}</td>
                  <td className="p-4 text-sm text-gray-800 font-medium">{po.vendorId?.companyName || 'Unknown'}</td>
                  <td className="p-4 text-sm text-gray-600">{po.rfqId?.title || 'Unknown'}</td>
                  <td className="p-4 text-sm font-bold text-gray-800">₹{po.totalAmount.toLocaleString()}</td>
                  <td className="p-4 text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${
                        po.status === 'Sent'
                          ? 'bg-blue-100 text-blue-800'
                          : po.status === 'Accepted'
                          ? 'bg-orange-100 text-orange-800'
                          : po.status === 'Fulfilled'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {po.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-right space-x-2">
                    <button onClick={() => setSelectedPO(po)} className="text-gray-500 hover:text-primary-600 tooltip" title="View Document">
                      <Eye className="w-5 h-5 inline" />
                    </button>
                    <button className="text-gray-500 hover:text-primary-600 tooltip" title="Download PDF">
                      <Download className="w-5 h-5 inline" />
                    </button>
                    {/* Vendor specific actions */}
                    {user?.role === 'Vendor' && po.status === 'Sent' && (
                      <button 
                        onClick={() => statusMutation.mutate({ id: po._id, status: 'Accepted' })}
                        className="text-orange-500 hover:text-orange-700 tooltip" title="Accept PO">
                        <CheckCircle className="w-5 h-5 inline" />
                      </button>
                    )}
                    {user?.role === 'Vendor' && po.status === 'Accepted' && (
                      <button 
                        onClick={() => statusMutation.mutate({ id: po._id, status: 'Fulfilled' })}
                        className="text-green-500 hover:text-green-700 tooltip" title="Mark as Fulfilled">
                        <Truck className="w-5 h-5 inline" />
                      </button>
                    )}
                    {user?.role === 'Vendor' && ['Accepted', 'Fulfilled'].includes(po.status) && (
                      <button 
                        onClick={() => setInvoicePO(po)}
                        className="text-indigo-500 hover:text-indigo-700 tooltip" title="Generate Invoice">
                        <Receipt className="w-5 h-5 inline" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {pos?.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No Purchase Orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPO && (
        <POViewModal
          po={selectedPO}
          onClose={() => setSelectedPO(null)}
        />
      )}

      {invoicePO && (
        <GenerateInvoiceModal
          po={invoicePO}
          onClose={() => setInvoicePO(null)}
        />
      )}
    </>
  );
};

export default POList;
