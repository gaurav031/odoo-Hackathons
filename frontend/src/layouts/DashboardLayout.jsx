import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { Bell, UserCircle } from 'lucide-react';

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-6 z-10">
          <div className="flex items-center">
            <h2 className="text-lg font-medium text-gray-800">Procurement Module</h2>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-primary-600 transition-colors relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
            <div className="flex items-center space-x-2 border-l border-gray-200 pl-4">
              <UserCircle className="w-8 h-8 text-gray-400" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
                <span className="text-xs text-gray-500">{user?.role || 'Role'}</span>
              </div>
              <button
                onClick={() => dispatch(logout())}
                className="ml-4 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
