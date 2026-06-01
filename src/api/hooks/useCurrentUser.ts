import { useEffect, useState } from "react";
import { authService } from "@/api";
import type { UserDto } from "@/api/types";

/**
 * Hook to get the current authenticated user
 * Returns user data or null if not authenticated
 */
export function useCurrentUser() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        // User not authenticated or error fetching
        console.debug("Failed to fetch current user:", err);
        setUser(null);
        // Don't set error for auth failures - it's expected when not logged in
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  return {
    user,
    userId: user?.id || null,
    isLoading,
    error,
  };
}
