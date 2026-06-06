import { Receipt } from 'lucide-react';
import InvoiceList from '../features/invoices/InvoiceList';

const Invoices = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
          <Receipt className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Invoices & Payments</h2>
          <p className="text-sm text-gray-500">Manage incoming vendor invoices and track payment statuses.</p>
        </div>
      </div>

      <InvoiceList />
    </div>
  );
};

export default Invoices;
