import type { ProjectDto } from "@/api/types";
import type { Project } from "@shared/types";

/**
 * Passage du DTO d'API au modele affiche par les cartes projet.
 *
 * Chaque feature (home, recherche, profil, projets similaires) avait sa propre
 * copie de cette conversion, avec des valeurs par defaut divergentes : le meme
 * projet affichait 100 % de reussite sur l'accueil et 0 % ailleurs, et le
 * nombre de contributeurs etait fige a 0 partout. Une seule implementation
 * garantit que tout le site raconte la meme chose.
 */
export const adaptProjectDto = (dto: ProjectDto): Project => ({
  id: dto.id,
  name: dto.name,
  description: dto.description || "",
  tags: dto.tags || [],
  author: dto.owner?.username || dto.owner?.displayName || "Membre",
  authorId: dto.owner?.userId,
  authorAvatar: dto.owner?.avatar || undefined,
  contributorsCount: dto.membersCount ?? 0,
  highfiveCount: dto.highfiveCount || 0,
});

export const adaptProjects = (dtos: ProjectDto[]): Project[] =>
  dtos.map(adaptProjectDto);
