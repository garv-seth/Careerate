import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
    queryFn: async () => {
      try {
        const res = await fetch("/api/user");
        if (res.status === 401) {
          return null; // Not authenticated, return null instead of throwing
        }
        if (!res.ok) {
          throw new Error("Failed to fetch user");
        }
        return res.json();
      } catch (error) {
        console.error("Auth query error:", error);
        return null;
      }
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}