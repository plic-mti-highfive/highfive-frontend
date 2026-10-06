import { adminHandlers } from "./admin";
import { announcementHandlers } from "./announcements";
import { authHandlers } from "./auth";
import { commentHandlers } from "./comments";
import { conversationHandlers } from "./conversations";
import { customizationHandlers } from "./customization";
import { fileHandlers } from "./files";
import { highfiveHandlers } from "./highfives";
import { membershipHandlers } from "./memberships";
import { notificationHandlers } from "./notifications";
import { projectHandlers } from "./projects";
import { reportHandlers } from "./reports";
import { searchHandlers } from "./search";
import { tagHandlers } from "./tags";
import { taskHandlers } from "./tasks";
import { userHandlers } from "./users";
import { wallHandlers } from "./wall";

/** Union de tous les handlers MSW (V2-6) : chaque route ici a un miroir dans `src/api/*.ts`. */
export const handlers = [
  ...authHandlers,
  ...tagHandlers,
  ...userHandlers,
  ...projectHandlers,
  ...customizationHandlers,
  ...highfiveHandlers,
  ...membershipHandlers,
  ...announcementHandlers,
  ...commentHandlers,
  ...taskHandlers,
  ...wallHandlers,
  ...fileHandlers,
  ...conversationHandlers,
  ...notificationHandlers,
  ...searchHandlers,
  ...reportHandlers,
  ...adminHandlers,
];
