import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, CreditCard } from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import InvoiceViewModal from './InvoiceViewModal';

const fetchInvoices = async () => {
  const response = await api.get('/invoices');
  return response.data.data.invoices;
};

const InvoiceList = () => {
  const { user } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const { data: invoices, isLoading, isError } = useQuery({
    queryKey: ['invoices'],
    queryFn: fetchInvoices,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/invoices/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['invoices']);
      alert('Invoice marked as Paid!');
    },
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Invoices...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load Invoices</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
              <th className="p-4 font-medium">Invoice No</th>
              <th className="p-4 font-medium">PO Ref</th>
              <th className="p-4 font-medium">Vendor</th>
              <th className="p-4 font-medium">Due Date</th>
              <th className="p-4 font-medium">Amount</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices?.map((invoice) => (
              <tr key={invoice._id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-sm font-bold text-indigo-600">{invoice.invoiceNumber}</td>
                <td className="p-4 text-sm text-gray-600">{invoice.poId?.poNumber || 'Unknown'}</td>
                <td className="p-4 text-sm text-gray-800 font-medium">{invoice.vendorId?.companyName || 'Unknown'}</td>
                <td className="p-4 text-sm text-gray-600">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                <td className="p-4 text-sm font-black text-gray-800">₹{invoice.totalAmount.toLocaleString()}</td>
                <td className="p-4 text-sm">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold
                    ${
                      invoice.status === 'Paid'
                        ? 'bg-green-100 text-green-800'
                        : invoice.status === 'Overdue'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-right space-x-2">
                  <button 
                    onClick={() => setSelectedInvoice(invoice)}
                    className="text-gray-500 hover:text-indigo-600 tooltip" title="View Document">
                    <Eye className="w-5 h-5 inline" />
                  </button>
                  {/* Finance/Manager Action */}
                  {user?.role !== 'Vendor' && invoice.status !== 'Paid' && (
                    <button
                      onClick={() => statusMutation.mutate({ id: invoice._id, status: 'Paid' })}
                      className="text-green-500 hover:text-green-700 tooltip"
                      title="Mark as Paid"
                    >
                      <CreditCard className="w-5 h-5 inline" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {invoices?.length === 0 && (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedInvoice && (
        <InvoiceViewModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};

export default InvoiceList;
