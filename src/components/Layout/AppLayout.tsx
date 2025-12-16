import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { useTheme } from '../theme-provider';
import { useAuth } from '../../contexts/AuthContext';
import { WorkspaceSwitcher } from '../WorkspaceSwitcher';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import {
  Mail,
  Send,
  Database,
  MessageSquare,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  Key,
  User,
  Webhook,
  CreditCard,
  Settings,
  HelpCircle,
  FileText,
  Inbox,
  Menu,
} from 'lucide-react';

export function AppLayout() {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { logout, userEmail } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/domains', label: 'Domains', icon: Database },
    { path: '/templates', label: 'Templates', icon: FileText },
    { path: '/send', label: 'Send', icon: Send },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
    { path: '/inbound', label: 'Inbound', icon: Inbox },
    { path: '/apikeys', label: 'API Keys', icon: Key },
    { path: '/webhooks', label: 'Webhooks', icon: Webhook },
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/billing', label: 'Billing', icon: CreditCard },
    { path: '/contact', label: 'Contact Us', icon: HelpCircle },
  ];

  // Navigation content shared between desktop sidebar and mobile drawer
  const NavigationContent = ({ onNavClick }: { onNavClick?: () => void }) => (
    <>
      {/* Logo and Workspace Switcher */}
      <div className="border-b px-4 py-3">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold mb-3" onClick={onNavClick}>
          <Mail className="h-6 w-6" />
          <span>Sendbase</span>
        </Link>
        <WorkspaceSwitcher />
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
                onClick={onNavClick}
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
          <Link
            to="/profile"
            onClick={onNavClick}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary ${
              isActive('/profile')
                ? 'bg-muted text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <User className="h-4 w-4" />
            <div className="flex-1 truncate">
              <span className="block text-xs font-medium truncate">{userEmail || 'Profile'}</span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="justify-start text-muted-foreground"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <Mail className="h-5 w-5" />
          <span>Sendbase</span>
        </Link>
      </header>

      {/* Mobile Navigation Drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col">
            <NavigationContent onNavClick={() => setMobileMenuOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-muted/40 md:flex md:flex-col">
        <div className="flex h-full flex-col">
          <NavigationContent />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 pt-14 md:pt-0 md:ml-64">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
