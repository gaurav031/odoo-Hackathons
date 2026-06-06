import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users as UsersIcon, FileText, Settings, ShieldCheck, FileDigit, Receipt, Activity, UserCog } from 'lucide-react';

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Vendors', path: '/vendors', icon: UsersIcon },
    { name: 'Vendor Portal', path: '/vendor-portal', icon: UsersIcon },
    { name: 'RFQs', path: '/rfqs', icon: FileText },
    { name: 'Approvals', path: '/approvals', icon: ShieldCheck },
    { name: 'Purchase Orders', path: '/purchase-orders', icon: FileDigit },
    { name: 'Invoices', path: '/invoices', icon: Receipt },
    { name: 'Activity Logs', path: '/activity-logs', icon: Activity },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const vendorNavItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Quotations', path: '/vendor-portal', icon: FileText },
    { name: 'Invoices', path: '/invoices', icon: Receipt },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  let itemsToDisplay = navItems;
  if (user?.role === 'Vendor') {
    itemsToDisplay = vendorNavItems;
  } else if (user?.role === 'Admin') {
    itemsToDisplay = [...navItems, { name: 'Users', path: '/users', icon: UserCog }];
  }

  return (
    <aside className="w-64 bg-primary-900 text-white min-h-screen flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-primary-800">
        <h1 className="text-xl font-bold">VendorBridge</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-800 text-white'
                    : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
