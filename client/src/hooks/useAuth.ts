import { useState, useEffect, createContext, useContext, ReactNode } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for demo authentication first
    const checkAuth = async () => {
      try {
        // Check localStorage for demo auth
        const demoAuth = localStorage.getItem('demo_auth');
        const demoUser = localStorage.getItem('demo_user');
        
        if (demoAuth === 'true' && demoUser) {
          const userData = JSON.parse(demoUser);
          setUser(userData);
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        // Fallback to server auth check
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.log('Auth check failed:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []); // Only run once on mount

  const logout = async () => {
    try {
      // Clear demo auth from localStorage
      localStorage.removeItem('demo_auth');
      localStorage.removeItem('demo_user');
      
      // Also try to logout from server
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout on frontend even if backend fails
      localStorage.removeItem('demo_auth');
      localStorage.removeItem('demo_user');
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/';
    }
  };

  const login = () => {
    // Demo login for development
    const demoUser = {
      id: 'demo-user-123',
      username: 'demo-user',
      name: 'Demo Developer', 
      email: 'demo@careerate.dev',
      provider: 'demo'
    };
    
    localStorage.setItem('demo_auth', 'true');
    localStorage.setItem('demo_user', JSON.stringify(demoUser));
    setUser(demoUser);
    setIsAuthenticated(true);
    window.location.href = '/dashboard';
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
    login,
  };
}

// Create Auth Context
interface AuthContextType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  login: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}