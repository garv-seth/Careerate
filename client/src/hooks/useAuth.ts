import { useState, useEffect } from "react";

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

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
  };
}