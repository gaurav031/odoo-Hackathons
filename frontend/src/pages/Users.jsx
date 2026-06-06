import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../api/axios';

const fetchUsers = async () => {
  const response = await api.get('/users');
  return response.data.data.users;
};

const Users = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();

  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: currentUser?.role === 'Admin',
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/users/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to update user status');
    },
  });

  if (currentUser?.role !== 'Admin') {
    return <div className="p-8 text-center text-red-500">Access Denied. Admins only.</div>;
  }

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading users...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load users</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-gray-100 text-gray-600 rounded-lg">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <p className="text-sm text-gray-500">Approve or reject new user registrations.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users?.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm font-medium text-gray-800">{user.name}</td>
                  <td className="p-4 text-sm text-gray-600">{user.email}</td>
                  <td className="p-4 text-sm text-gray-600">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">{user.role}</span>
                  </td>
                  <td className="p-4 text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${
                        user.status === 'Approved'
                          ? 'bg-green-100 text-green-800'
                          : user.status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {user.status || 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-right space-x-2">
                    {user.status === 'Pending' && (
                      <>
                        <button 
                          onClick={() => statusMutation.mutate({ id: user._id, status: 'Approved' })}
                          className="text-green-500 hover:text-green-700 p-1 tooltip" title="Approve">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => statusMutation.mutate({ id: user._id, status: 'Rejected' })}
                          className="text-red-500 hover:text-red-700 p-1 tooltip" title="Reject">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {users?.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No users found.
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

export default Users;
