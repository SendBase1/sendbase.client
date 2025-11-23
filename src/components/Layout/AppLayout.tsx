import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import {
  Mail,
  Send,
  Database,
  MessageSquare,
  LayoutDashboard,
  LogOut
} from 'lucide-react';

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/domains', label: 'Domains', icon: Database },
    { path: '/send', label: 'Send Email', icon: Send },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50/30">
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200/50">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Email Platform</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200'
                        : 'text-gray-700 hover:bg-gray-100/80 hover:translate-x-0.5'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className={isActive(item.path) ? 'font-medium' : ''}>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200/50">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 hover:bg-red-50 hover:text-red-600 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Nav */}
        <header className="h-16 bg-white/60 backdrop-blur-xl border-b border-gray-200/50 flex items-center justify-between px-6 shadow-sm">
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {navItems.find((item) => isActive(item.path))?.label || 'Email Platform'}
          </h1>
          <div className="flex items-center gap-4">
            {/* User info or additional actions could go here */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
