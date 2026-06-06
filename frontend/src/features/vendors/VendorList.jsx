import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit2, Trash2, Search, Filter, CheckCircle, XCircle } from 'lucide-react';
import api from '../../api/axios';

const fetchVendors = async () => {
  const response = await api.get('/vendors');
  return response.data.data.vendors;
};

const VendorList = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const { data: vendors, isLoading, isError } = useQuery({
    queryKey: ['vendors'],
    queryFn: fetchVendors,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/vendors/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['vendors']);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to update vendor status');
    },
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading vendors...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load vendors</div>;

  const filteredVendors = vendors?.filter((vendor) => {
    const matchesSearch = vendor.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          vendor.gstNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || vendor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search by Company Name or GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-lg"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Blacklisted">Blacklisted</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
              <th className="p-4 font-medium">Company Name</th>
              <th className="p-4 font-medium">Contact Person</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">GST Number</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredVendors?.map((vendor) => (
              <tr key={vendor._id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-sm font-medium text-gray-800">{vendor.companyName}</td>
                <td className="p-4 text-sm text-gray-600">{vendor.contactPerson}</td>
                <td className="p-4 text-sm text-gray-600">{vendor.email}</td>
                <td className="p-4 text-sm text-gray-600">{vendor.gstNumber}</td>
                <td className="p-4 text-sm">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${
                      vendor.status === 'Approved'
                        ? 'bg-green-100 text-green-800'
                        : vendor.status === 'Blacklisted'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {vendor.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-right space-x-2">
                  {vendor.status === 'Pending' && (
                    <button 
                      onClick={() => statusMutation.mutate({ id: vendor._id, status: 'Approved' })}
                      className="text-green-500 hover:text-green-700 p-1 tooltip" title="Approve">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  {vendor.status !== 'Blacklisted' && (
                    <button 
                      onClick={() => statusMutation.mutate({ id: vendor._id, status: 'Blacklisted' })}
                      className="text-orange-500 hover:text-orange-700 p-1 tooltip" title="Blacklist">
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button className="text-primary-600 hover:text-primary-800 p-1 tooltip" title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="text-red-500 hover:text-red-700 p-1 tooltip" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredVendors?.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  No vendors found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

export default VendorList;
