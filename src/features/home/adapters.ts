import type { ProjectDto } from "@/api";
import type { Project } from "@shared/types";

/**
 * Adapt ProjectDto from backend to Project domain model for UI
 * Handles data transformation and field defaults
 */
export const adaptProjectDto = (dto: ProjectDto): Project => ({
  id: dto.id,
  name: dto.name,
  description: dto.description || "",
  tags: dto.tags || [],
  author: "unknown", // TODO: récupérer l'auteur via les membres
  contributorsCount: 0, // TODO: calculer depuis les membres
  highfiveCount: dto.highfiveCount || 0,
  successRate: 100, // TODO: calculer selon la logique métier
  daysLeft: null, // TODO: calculer depuis une date de fin si disponible
});

/**
 * Adapt an array of ProjectDtos to Projects
 */
export const adaptProjects = (dtos: ProjectDto[]): Project[] =>
  dtos.map(adaptProjectDto);
