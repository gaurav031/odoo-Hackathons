import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import QuotationForm from '../features/quotations/QuotationForm';

const fetchVendorRFQs = async () => {
  // A vendor gets RFQs assigned to them
  const response = await api.get('/rfqs');
  return response.data.data.rfqs; // In a real app, backend filters by invitedVendors
};

const VendorPortal = () => {
  const [selectedRFQ, setSelectedRFQ] = useState(null);

  const { data: rfqs, isLoading } = useQuery({
    queryKey: ['vendor-rfqs'],
    queryFn: fetchVendorRFQs,
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading your RFQs...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Vendor Portal</h2>
        <p className="text-sm text-gray-500 mt-1">Review Requests for Quotation and submit your bids.</p>
      </div>

      {!selectedRFQ ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rfqs?.map((rfq) => (
            <div key={rfq._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800">{rfq.title}</h3>
                  <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded">{rfq.rfqNumber}</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{rfq.description}</p>
                <div className="text-xs text-gray-500 space-y-1 font-medium">
                  <p>Items: {rfq.items?.length || 0}</p>
                  <p>Deadline: <span className="text-red-500">{new Date(rfq.deadline).toLocaleDateString()}</span></p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRFQ(rfq)}
                className="mt-4 w-full bg-gray-900 hover:bg-black text-white py-2 rounded-lg text-sm font-medium transition-colors"
                disabled={rfq.status === 'Closed'}
              >
                {rfq.status === 'Closed' ? 'Bidding Closed' : 'Submit Quotation'}
              </button>
            </div>
          ))}
          {rfqs?.length === 0 && (
            <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
              No RFQs assigned to you at the moment.
            </div>
          )}
        </div>
      ) : (
        <QuotationForm rfq={selectedRFQ} onBack={() => setSelectedRFQ(null)} />
      )}
    </div>
  );
};

export default VendorPortal;
