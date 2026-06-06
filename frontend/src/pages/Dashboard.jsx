import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Users, FileText, ShieldCheck, FileDigit } from 'lucide-react';
import api from '../api/axios';

const fetchDashboardStats = async () => {
  const response = await api.get('/analytics/dashboard');
  return response.data.data;
};

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
  });

  const handleExportCSV = () => {
    if (!stats?.vendorPerformance) return;
    
    const headers = ['Vendor Name', 'Total Orders', 'Total Spent (INR)', 'Rating'];
    const rows = stats.vendorPerformance.map(v => [
      `"${v.companyName}"`,
      v.totalOrders,
      v.totalSpent,
      v.rating
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + "\n"
      + rows.map(e => e.join(',')).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "vendor_performance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading dashboard data...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load dashboard data.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name}</h2>
          <p className="text-sm text-gray-500 mt-1">Here's your procurement overview.</p>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <h3 className="text-gray-500 text-sm font-medium">Total Vendors</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-primary-600">{stats?.counts?.totalVendors || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <h3 className="text-gray-500 text-sm font-medium">Active RFQs</h3>
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-blue-600">{stats?.counts?.activeRFQs || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <h3 className="text-gray-500 text-sm font-medium">Pending Approvals</h3>
            <ShieldCheck className="w-5 h-5 text-gray-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-orange-500">{stats?.counts?.pendingApprovals || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <h3 className="text-gray-500 text-sm font-medium">Total Spend (POs)</h3>
            <FileDigit className="w-5 h-5 text-gray-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-green-600">₹{(stats?.counts?.totalPoAmount || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Monthly Procurement Spend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.monthlySpend || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={(value) => `₹${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Total Spend']}
                />
                <Bar dataKey="spend" fill="#0284c7" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vendor Performance Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Top Vendors</h3>
            {user?.role !== 'Vendor' && (
              <button 
                onClick={handleExportCSV}
                className="text-sm flex items-center space-x-1 text-primary-600 hover:text-primary-800 font-medium bg-primary-50 px-3 py-1 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {stats?.vendorPerformance?.length > 0 ? (
              <div className="space-y-4">
                {stats.vendorPerformance.map((vendor) => (
                  <div key={vendor._id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{vendor.companyName}</p>
                      <p className="text-xs text-gray-500">{vendor.totalOrders} Orders • {vendor.rating} ★</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 text-sm">₹{vendor.totalSpent.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No vendor data available yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
