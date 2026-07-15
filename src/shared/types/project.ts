export interface Project {
  id: number | string;
  name: string;
  description: string;
  tags?: string[];
  author: string;
  authorId?: string;
  authorAvatar?: string;
  contributorsCount: number;
  highfiveCount?: number;
  successRate: number;
  daysLeft: number | null;
  thumbnailUrl?: string;
}
