import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useTheme } from '../theme-provider';
import {
  Mail,
  Send,
  Database,
  MessageSquare,
  LayoutDashboard,
  LogOut,
  Settings,
  Moon,
  Sun,
} from 'lucide-react';

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/domains', label: 'Domains', icon: Database },
    { path: '/send', label: 'Send', icon: Send },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          {/* Logo */}
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
              <Mail className="h-6 w-6" />
              <span>EmailAPI</span>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                      active
                        ? 'bg-muted text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Actions */}
          <div className="mt-auto border-t p-4">
            <div className="grid gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="justify-start"
              >
                {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                {theme === 'dark' ? 'Light' : 'Dark'} mode
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="justify-start text-muted-foreground"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
