import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    gcTime: Infinity,
    throwOnError: false,
  });

  const isAuthenticated = !!user && !error;
  
  return {
    user: isAuthenticated ? user : null,
    isLoading,
    isAuthenticated,
  };
}