import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    staleTime: Infinity, // Don't refetch unless explicitly requested
    enabled: true,
    throwOnError: false, // Don't throw on 401 errors
  });

  // If we get a 401, user is not authenticated (this is expected)
  const isUnauthenticated = error && (String(error).includes('401') || String(error).includes('Not authenticated'));
  
  return {
    user: isUnauthenticated ? null : user,
    isLoading: isLoading && !isUnauthenticated,
    isAuthenticated: !!user && !isUnauthenticated,
  };
}