import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  userId: string | null;
  login: (token: string, email: string, userId: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Event for cross-tab logout and API 401 handling
const AUTH_LOGOUT_EVENT = 'auth:logout';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for existing auth on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const email = localStorage.getItem('userEmail');
    const id = localStorage.getItem('userId');

    if (token && email && id) {
      setIsAuthenticated(true);
      setUserEmail(email);
      setUserId(id);
    }
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUserEmail(null);
    setUserId(null);

    // Only navigate if not already on public pages
    const publicPaths = ['/', '/login'];
    if (!publicPaths.includes(location.pathname)) {
      navigate('/login', { replace: true });
    }
  }, [navigate, location.pathname]);

  // Listen for logout events (from API 401 responses)
  useEffect(() => {
    const handleLogoutEvent = () => {
      logout();
    };

    window.addEventListener(AUTH_LOGOUT_EVENT, handleLogoutEvent);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handleLogoutEvent);
  }, [logout]);

  // Listen for storage changes (cross-tab logout)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' && e.newValue === null) {
        logout();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [logout]);

  const login = useCallback((token: string, email: string, id: string) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userId', id);
    setIsAuthenticated(true);
    setUserEmail(email);
    setUserId(id);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, userId, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Function to trigger logout from anywhere (e.g., API interceptor)
export function triggerLogout() {
  window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
}
