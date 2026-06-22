import { useState, useEffect } from "react";
import { userService } from "@/api";
import type { User } from "@shared/types/user";
import type {
  EnrichedUserProfileResponse,
  UserProjectsResponse,
} from "@/api/types/user.types";

/**
 * Combine profile and projects data into a unified User object
 * Calculates stats counts from actual data arrays
 */
const buildUserFromData = (
  profile: EnrichedUserProfileResponse,
  projects: UserProjectsResponse,
): User => ({
  username: profile.username,
  displayName: profile.displayName,
  avatar: profile.avatar,
  bio: profile.bio || "",
  createdAt: profile.createdAt,
  tags: profile.tags,
  stats: {
    projectsCreated: projects.created.length,
    projectsContributed: projects.collaborations.length,
    followers: profile.stats.followers,
    following: profile.stats.following,
  },
  projects: {
    created: projects.created,
    collaborations: projects.collaborations,
    liked: projects.liked,
  },
  followers: [], // TODO: implement when needed
  following: [], // TODO: implement when needed
});

export function useUserProfile(userId: string | undefined) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        // Fetch both endpoints in parallel
        const [profile, projects] = await Promise.all([
          userService.getUserProfile(userId),
          userService.getUserProjects(userId),
        ]);

        console.log("Fetched user profile:", profile);
        console.log("Fetched user projects:", projects);

        const combinedUser = buildUserFromData(profile, projects);
        setUser(combinedUser);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch user profile"),
        );
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  return { user, isLoading, error };
}
