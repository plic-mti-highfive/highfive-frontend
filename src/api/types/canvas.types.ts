export type CanvasRole = "admin" | "editor" | "viewer";

/** Tout ce qu'il faut pour ouvrir la connexion temps reel : le core emet le token. */
export interface CanvasSession {
  canvasId: string;
  projectId: string;
  name: string;
  websocketUrl: string;
  token: string;
  role: CanvasRole;
}

export interface ProposedTask {
  title: string;
  description: string;
  /** Elements du canvas qui ont motive la tache : permet a l'utilisateur de juger. */
  sourceHints: string[];
}

export interface GenerateTasksResponse {
  tasks: ProposedTask[];
  /** Vrai quand le canvas est trop pauvre pour proposer quoi que ce soit. */
  empty: boolean;
}

/** Message de chat tel qu'il est persiste dans le document Yjs du canvas. */
export interface CanvasChatMessage {
  id: string;
  text: string;
  authorId: string;
  timestamp: number;
}
