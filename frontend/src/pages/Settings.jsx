import { Settings as SettingsIcon, User, Bell, Shield, Key } from 'lucide-react';
import { useSelector } from 'react-redux';

const Settings = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-gray-100 text-gray-600 rounded-lg">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
          <p className="text-sm text-gray-500">Manage your account preferences and application settings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1 space-y-2">
          <button className="w-full text-left px-4 py-2.5 rounded-lg font-medium bg-primary-50 text-primary-700 flex items-center space-x-3">
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-50 flex items-center space-x-3">
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-50 flex items-center space-x-3">
            <Shield className="w-4 h-4" />
            <span>Security</span>
          </button>
        </div>

        <div className="col-span-1 md:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Profile Information</h3>
              <p className="text-sm text-gray-500 mt-1">Update your account details here.</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-2xl uppercase">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    Change Avatar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user?.name}
                    className="w-full rounded-md border-gray-300 shadow-sm p-2.5 border focus:border-primary-500 focus:ring-primary-500"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    className="w-full rounded-md border-gray-300 shadow-sm p-2.5 border focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-500"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <input
                    type="text"
                    defaultValue={user?.role}
                    className="w-full rounded-md border-gray-300 shadow-sm p-2.5 border focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-500"
                    disabled
                  />
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
                <button className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
