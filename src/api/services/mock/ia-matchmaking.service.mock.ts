import type { IIAMatchmakingService } from "../interfaces/ia-matchmaking.service.interface";
import type { RecommendationResultItem } from "@/api/types/ia-matchmaking.types";
import { getAllProjects, getAllUsers } from "./data";
import { delay } from "./utils";

/**
 * Mock du matchmaking IA.
 *
 * Les identifiants renvoyes etaient inventes (« 550e8400-… ») et ne
 * correspondaient a aucun projet mock : la home resolvait ces ids en rien du
 * tout, et les sections « Recommandes » et « Projets tendance » restaient
 * systematiquement vides. On pioche desormais dans les vraies donnees mock.
 *
 * Les selections sont derivees des index (et de l'utilisateur pour les
 * recommandations), donc stables entre deux rendus.
 */
export class IAMatchmakingServiceMock implements IIAMatchmakingService {
  /** Somme des codes de caracteres : graine stable propre a un identifiant. */
  private seedFrom(value: string): number {
    let seed = 0;
    for (let i = 0; i < value.length; i++) seed += value.charCodeAt(i);
    return seed;
  }

  private rank(
    ids: string[],
    offset: number,
    limit: number,
    tags: string[],
  ): RecommendationResultItem[] {
    if (ids.length === 0) return [];
    // Rotation a partir de l'offset : chaque appelant obtient une selection
    // differente, mais toujours la meme pour une meme graine.
    const rotated = Array.from(
      { length: Math.min(limit, ids.length) },
      (_, i) => ids[(offset + i) % ids.length],
    );

    return rotated.map((id, index) => ({
      id,
      position: index,
      metadata: {
        likes: (this.seedFrom(id) + index * 7) % 100,
        tags,
      },
    }));
  }

  async getTrending(limit = 10): Promise<RecommendationResultItem[]> {
    await delay(100);
    // Les plus « highfives » d'abord : c'est ce que « tendance » veut dire.
    const ids = [...getAllProjects()]
      .sort((a, b) => (b.highfiveCount ?? 0) - (a.highfiveCount ?? 0))
      .map((p) => p.id);
    return this.rank(ids, 0, limit, ["Trending"]);
  }

  async getRecommendedProjects(
    userId: string,
    limit = 10,
  ): Promise<RecommendationResultItem[]> {
    await delay(100);
    const ids = getAllProjects().map((p) => p.id);
    return this.rank(ids, this.seedFrom(userId), limit, ["Recommended"]);
  }

  async getRecommendedUsers(
    projectId: string,
    limit = 10,
  ): Promise<RecommendationResultItem[]> {
    await delay(100);
    const ids = getAllUsers().map((u) => u.id);
    return this.rank(ids, this.seedFrom(projectId), limit, ["Recommended"]);
  }
}
