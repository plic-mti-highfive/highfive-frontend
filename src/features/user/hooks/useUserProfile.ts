import { useState, useEffect } from "react";
import { userService, type ProjectDto } from "@/api";
import type { User } from "@shared/types/user";
import type { UserProfileDto, UserProjectsDto } from "@/api/types/user.types";
import type { Project } from "@/shared/types/project";

const adaptProject = (p: ProjectDto, user: UserProfileDto): Project => ({
  id: p.id,
  name: p.name,
  description: p.description ?? "",
  tags: p.tags ?? [],
  author: user.displayName,
  authorAvatar: user.avatar,
  contributorsCount: 0, // TODO
  highfiveCount: p.highfiveCount,
  successRate: 0, // TODO
  daysLeft: null, // TODO
});

/**
 * Combine profile and projects data into a unified User object
 * Calculates stats counts from actual data arrays
 */
const buildUserFromData = (
  profile: UserProfileDto,
  projects: UserProjectsDto,
): User => ({
  username: profile.username,
  displayName: profile.displayName,
  avatar: profile.avatar,
  bio: profile.bio || "",
  createdAt: profile.createdAt,
  tags: profile.skills,
  stats: {
    projectsCreated: projects.created.length,
    projectsContributed: projects.collaborations.length,
    followers: profile.stats.followers,
    following: profile.stats.following,
  },
  projects: {
    created: projects.created.map((p) => adaptProject(p, profile)),
    collaborations: projects.collaborations.map((p) =>
      adaptProject(p, profile),
    ),
    liked: projects.liked.map((p) => adaptProject(p, profile)),
  },
  followers: profile.followers,
  following: profile.following,
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
