import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, FileDigit } from 'lucide-react';
import api from '../api/axios';

const QuotationComparison = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: rfq } = useQuery({
    queryKey: ['rfq', id],
    queryFn: async () => {
      const res = await api.get(`/rfqs/${id}`);
      return res.data.data.rfq;
    },
  });

  const { data: quotes, isLoading } = useQuery({
    queryKey: ['quotations', id],
    queryFn: async () => {
      const res = await api.get(`/quotations/rfq/${id}`);
      return res.data.data.quotations;
    },
  });

  const mutation = useMutation({
    mutationFn: ({ quoteId, status }) => api.put(`/quotations/${quoteId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['quotations', id]);
      alert('Quotation status updated!');
    },
  });

  const generatePoMutation = useMutation({
    mutationFn: (quoteId) => api.post('/purchase-orders', { quotationId: quoteId }),
    onSuccess: () => {
      alert('Purchase Order generated successfully!');
      navigate('/purchase-orders');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to generate PO');
    },
  });

  if (isLoading || !rfq) return <div className="p-8 text-center text-gray-500">Loading comparison...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <button onClick={() => navigate('/rfqs')} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Compare Quotes: {rfq.title}</h2>
          <p className="text-sm text-gray-500">Analyze vendor bids side-by-side.</p>
        </div>
      </div>

      {quotes?.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-500">
          No quotations received yet for this RFQ.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-4 font-bold text-gray-700 border-r w-1/4">Line Items</th>
                {quotes.map((quote) => (
                  <th key={quote._id} className="p-4 font-bold text-center border-r min-w-[250px]">
                    <div className="text-primary-700 text-lg">{quote.vendorId?.companyName}</div>
                    <div className="text-xs font-normal text-gray-500 mt-1">Rating: {quote.vendorId?.rating} / 5</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Item Rows */}
              {rfq.items.map((rfqItem, index) => (
                <tr key={rfqItem._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 border-r text-sm">
                    <span className="font-bold text-gray-800 block">{rfqItem.name}</span>
                    <span className="text-gray-500 text-xs">Qty: {rfqItem.quantity}</span>
                  </td>
                  {quotes.map((quote) => {
                    const quoteItem = quote.items[index];
                    return (
                      <td key={quote._id} className="p-4 border-r text-center">
                        <div className="font-bold text-gray-800">₹{quoteItem?.unitPrice?.toFixed(2) || 'N/A'}</div>
                        <div className="text-xs text-gray-500">Tax: ₹{quoteItem?.tax?.toFixed(2) || '0.00'}</div>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Delivery Timeline Row */}
              <tr className="border-b bg-orange-50/30">
                <td className="p-4 border-r font-bold text-sm text-gray-700">Delivery Timeline</td>
                {quotes.map((quote) => (
                  <td key={quote._id} className="p-4 border-r text-center text-sm font-medium text-gray-700">
                    {quote.deliveryTimeline}
                  </td>
                ))}
              </tr>

              {/* Grand Total Row */}
              <tr className="border-b bg-green-50/50">
                <td className="p-4 border-r font-bold text-gray-800 text-lg">Grand Total</td>
                {quotes.map((quote) => {
                  // highlight the lowest price
                  const isLowest = quote.grandTotal === Math.min(...quotes.map((q) => q.grandTotal));
                  return (
                    <td key={quote._id} className="p-4 border-r text-center">
                      <div className={`text-2xl font-black ${isLowest ? 'text-green-600' : 'text-gray-800'}`}>
                        ₹{quote.grandTotal.toFixed(2)}
                      </div>
                      {isLowest && <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full uppercase mt-2 inline-block">Lowest Bid</span>}
                    </td>
                  );
                })}
              </tr>

              {/* Actions Row */}
              <tr>
                <td className="p-4 border-r"></td>
                {quotes.map((quote) => (
                  <td key={quote._id} className="p-4 border-r text-center">
                    {quote.status === 'Approved' ? (
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-center space-x-2 text-green-600 font-bold bg-green-50 py-2 rounded-lg">
                          <CheckCircle className="w-5 h-5" />
                          <span>Awarded</span>
                        </div>
                        <button
                          onClick={() => generatePoMutation.mutate(quote._id)}
                          disabled={generatePoMutation.isPending}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center space-x-1"
                        >
                          <FileDigit className="w-4 h-4" />
                          <span>Generate PO</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => mutation.mutate({ quoteId: quote._id, status: 'Approved' })}
                        disabled={mutation.isPending || quotes.some(q => q.status === 'Approved')}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Award Contract
                      </button>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QuotationComparison;
