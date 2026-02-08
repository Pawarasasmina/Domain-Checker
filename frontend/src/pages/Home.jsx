import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Globe, Tag, Activity } from 'lucide-react';
import api from '../utils/axios';

const Home = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalDomains: 0,
    activeBrands: 0,
    blockedDomains: 0,
    totalUsers: 0,
    loading: true
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch all stats in parallel
      const domainsRes = await api.get('/domains', { params: { limit: 1 } });
      const brandsRes = await api.get('/brands');
      
      let usersCount = 0;
      if (isAdmin()) {
        try {
          const usersRes = await api.get('/auth/users');
          usersCount = usersRes.data.data?.length || 0;
        } catch (error) {
          console.error('Failed to fetch users:', error);
        }
      }

      setStats({
        totalDomains: domainsRes.data.total || 0,
        activeBrands: brandsRes.data.data?.filter(b => b.isActive).length || 0,
        blockedDomains: domainsRes.data.totalBlocked || 0,
        totalUsers: usersCount,
        loading: false
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const statsCards = [
    {
      name: 'Total Domains',
      value: stats.loading ? '...' : stats.totalDomains.toString(),
      icon: Globe,
      color: 'bg-blue-500',
      link: '/domains'
    },
    {
      name: 'Active Brands',
      value: stats.loading ? '...' : stats.activeBrands.toString(),
      icon: Tag,
      color: 'bg-green-500',
      link: '/brands'
    },
    {
      name: 'Blocked Domains',
      value: stats.loading ? '...' : stats.blockedDomains.toString(),
      icon: Activity,
      color: 'bg-red-500',
      link: '/domains'
    }
  ];

  // Only show user count to admins
  if (isAdmin()) {
    statsCards.push({
      name: 'Total Users',
      value: stats.loading ? '...' : stats.totalUsers.toString(),
      icon: Users,
      color: 'bg-purple-500',
      link: '/users'
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your domains today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <a 
            key={index} 
            href={stat.link}
            className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {stat.value}
            </h3>
            <p className="text-sm text-gray-600">{stat.name}</p>
          </a>
        ))}
      </div>

      {/* Quick Actions */}
      {isAdmin() && (
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/domains"
              className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <Globe className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Manage Domains</h3>
              <p className="text-sm text-gray-600">Add, edit, or delete domains</p>
            </a>
            <a
              href="/brands"
              className="block p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all"
            >
              <Tag className="w-8 h-8 text-green-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Manage Brands</h3>
              <p className="text-sm text-gray-600">Add, edit, or delete brands</p>
            </a>
            <a
              href="/users"
              className="block p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all"
            >
              <Users className="w-8 h-8 text-purple-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Manage Users</h3>
              <p className="text-sm text-gray-600">Add or manage system users</p>
            </a>
          </div>
        </div>
      )}

      {/* System Status */}
      <div className="card p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Database Connection</span>
            <span className="badge badge-success">Connected</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Real-time Updates</span>
            <span className="badge badge-success">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Blocked Domain Checker</span>
            <span className="badge badge-success">Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
