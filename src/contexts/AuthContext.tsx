import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { loginRequest } from '@/lib/authConfig';
import { entraAuthApi, setInitializing, type TenantInfo } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  userId: string | null;
  userName: string | null;
  tenantId: string | null;
  availableTenants: TenantInfo[];
  login: () => Promise<void>;
  logout: () => void;
  switchTenant: (tenantId: string) => Promise<void>;
  isLoading: boolean;
  isInitialized: boolean;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Event for cross-tab logout and API 401 handling
const AUTH_LOGOUT_EVENT = 'auth:logout';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [availableTenants, setAvailableTenants] = useState<TenantInfo[]>([]);
  const initializingRef = useRef(false);

  const account = accounts[0];
  const userEmail = account?.username || null;
  const userId = account?.localAccountId || null;
  const userName = account?.name || null;

  // Initialize user session with backend after MSAL authentication
  useEffect(() => {
    const initializeUser = async () => {
      if (!isAuthenticated || initializingRef.current || isInitialized) return;
      if (inProgress !== InteractionStatus.None) return;
      if (!account) return; // Wait for account to be available

      initializingRef.current = true;
      setInitializing(true); // Prevent 401 from triggering logout during init
      try {
        console.log('Initializing user session with backend...');
        const response = await entraAuthApi.initialize();
        setTenantId(response.tenantId);
        setAvailableTenants(response.availableTenants);
        setIsInitialized(true);
        console.log('User initialized:', response.isNewUser ? 'new user' : 'existing user');
      } catch (error) {
        console.error('Failed to initialize user:', error);
        // Still mark as initialized to prevent infinite retries
        setIsInitialized(true);
      } finally {
        initializingRef.current = false;
        setInitializing(false);
      }
    };

    initializeUser();
  }, [isAuthenticated, inProgress, isInitialized, account]);

  // Set loading state based on MSAL interaction status
  useEffect(() => {
    if (inProgress === InteractionStatus.None) {
      setIsLoading(false);
    }
  }, [inProgress]);

  const login = useCallback(async () => {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [instance]);

  const logout = useCallback(() => {
    // Clear tenant state on logout
    setTenantId(null);
    setAvailableTenants([]);
    setIsInitialized(false);
    instance.logoutRedirect({
      postLogoutRedirectUri: window.location.origin,
    });
  }, [instance]);

  const switchTenant = useCallback(async (newTenantId: string) => {
    try {
      const response = await entraAuthApi.switchTenant(newTenantId);
      setTenantId(response.tenantId);
      setAvailableTenants(response.availableTenants);
    } catch (error) {
      console.error('Failed to switch tenant:', error);
      throw error;
    }
  }, []);

  // Get access token for API calls
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (!account) return null;

    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account,
      });
      return response.accessToken;
    } catch (error) {
      console.error('Token acquisition error:', error);
      // If silent acquisition fails, try interactive
      try {
        await instance.acquireTokenRedirect(loginRequest);
        return null; // Redirect will happen, so we won't get here
      } catch (interactiveError) {
        console.error('Interactive token acquisition error:', interactiveError);
        return null;
      }
    }
  }, [instance, account]);

  // Listen for logout events (from API 401 responses)
  useEffect(() => {
    const handleLogoutEvent = () => {
      logout();
    };

    window.addEventListener(AUTH_LOGOUT_EVENT, handleLogoutEvent);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handleLogoutEvent);
  }, [logout]);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      userEmail,
      userId,
      userName,
      tenantId,
      availableTenants,
      login,
      logout,
      switchTenant,
      isLoading,
      isInitialized,
      getAccessToken,
    }}>
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
