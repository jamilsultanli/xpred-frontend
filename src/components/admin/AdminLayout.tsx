import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Flag,
  CheckCircle,
  Headphones,
  DollarSign,
  Settings,
  FileSearch,
  Radio,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../lib/api/admin';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  permission?: { resource: string; action: 'read' };
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Users', path: '/admin/users', icon: <Users className="w-5 h-5" />, permission: { resource: 'users', action: 'read' } },
  { label: 'Predictions', path: '/admin/predictions', icon: <FileText className="w-5 h-5" />, permission: { resource: 'predictions', action: 'read' } },
  { label: 'Resolution Queue', path: '/admin/resolution-queue', icon: <CheckCircle className="w-5 h-5" />, permission: { resource: 'predictions', action: 'read' } },
  { label: 'Reports', path: '/admin/reports', icon: <Flag className="w-5 h-5" />, permission: { resource: 'reports', action: 'read' } },
  { label: 'KYC Requests', path: '/admin/kyc', icon: <Shield className="w-5 h-5" />, permission: { resource: 'kyc', action: 'read' } },
  { label: 'Support', path: '/admin/support', icon: <Headphones className="w-5 h-5" />, permission: { resource: 'support', action: 'read' } },
  { label: 'Finance', path: '/admin/finance', icon: <DollarSign className="w-5 h-5" />, permission: { resource: 'finance', action: 'read' } },
  { label: 'Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" />, permission: { resource: 'settings', action: 'read' } },
  { label: 'Audit Logs', path: '/admin/audit-logs', icon: <FileSearch className="w-5 h-5" />, permission: { resource: 'audit_logs', action: 'read' } },
  { label: 'Broadcast', path: '/admin/broadcast', icon: <Radio className="w-5 h-5" />, permission: { resource: 'broadcast', action: 'create' } },
];

export const AdminLayout: React.FC = () => {
  const { userData, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [permissions, setPermissions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        // Temporarily skip permission loading for debugging
        setPermissions({ user: { role: { level: 1, display_name: 'Super Admin' } }, permissions: [] });
        setLoading(false);
        return;
        
        /* 
        const data = await adminApi.getMyPermissions();
        setPermissions(data);
        */
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const hasPermission = (resource: string, action: string) => {
    if (!permissions) return false;
    
    // Super admin has all permissions
    if (permissions.user?.role?.level === 1) return true;

    const permission = permissions.permissions?.find((p: any) => p.resource === resource);
    if (!permission) return false;

    const actionKey = `can_${action}`;
    return permission[actionKey];
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredNavItems = navItems.filter(item => {
    // Temporarily show all items for debugging
    return true;
    // if (!item.permission) return true;
    // return hasPermission(item.permission.resource, item.permission.action);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 border-r border-gray-800 transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-purple-500" />
              <span className="font-bold text-lg">Admin Panel</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 transition-colors ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              {item.icon}
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Menu */}
        <div className="border-t border-gray-800 p-4">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`w-full flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg transition-colors ${
                sidebarOpen ? '' : 'justify-center'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
                {userData?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              {sidebarOpen && (
                <>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{userData?.username || 'Admin'}</div>
                    <div className="text-xs text-gray-400">
                      {permissions?.user?.role?.display_name || 'Admin'}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </>
              )}
            </button>

            {userMenuOpen && sidebarOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold">Admin Panel</h1>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              Role: <span className="text-purple-400 font-medium">{permissions?.user?.role?.display_name}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

