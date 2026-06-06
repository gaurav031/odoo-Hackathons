import { useState } from 'react';
import { Plus } from 'lucide-react';
import VendorList from '../features/vendors/VendorList';
import VendorForm from '../features/vendors/VendorForm';

const Vendors = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Vendors Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage all your supplier profiles and compliance details.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vendor</span>
        </button>
      </div>

      <VendorList />

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <VendorForm onClose={() => setIsFormOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;
