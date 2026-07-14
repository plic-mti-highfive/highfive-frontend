import { useEffect, useState } from "react";
import { userService } from "@/api";
import type { MinimalProfileDto } from "@/api/types";

export function useTrendingUsers(limit = 4) {
  const [users, setUsers] = useState<MinimalProfileDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await userService.searchProfiles({
          sortBy: "popularity",
          sortOrder: "DESC",
          limit,
        });
        if (!cancelled) setUsers(response.data);
      } catch (err) {
        console.error("Failed to fetch trending users:", err);
        if (!cancelled) setUsers([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchUsers();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return { users, isLoading };
}
