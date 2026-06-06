import { FileDigit } from 'lucide-react';
import POList from '../features/purchaseOrders/POList';

const PurchaseOrders = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
          <FileDigit className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Purchase Orders</h2>
          <p className="text-sm text-gray-500">Track and manage generated purchase orders.</p>
        </div>
      </div>

      <POList />
    </div>
  );
};

export default PurchaseOrders;
