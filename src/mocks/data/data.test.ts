import { describe, expect, it } from "vitest";
import {
  announcementSchema,
  adminActionSchema,
  columnSchema,
  commentSchema,
  conversationSchema,
  currentUserSchema,
  highfiveSchema,
  invitationSchema,
  joinRequestSchema,
  membershipSchema,
  messageSchema,
  notificationSchema,
  projectFileSchema,
  projectSchema,
  reportSchema,
  tagSchema,
  taskSchema,
  wallSchema,
} from "@/domain";
import { demoDataset } from "./index";

describe("jeu de demo v2", () => {
  it("charge un volume conforme au doc 23 (~25 projets, 12 comptes, 24 tags)", () => {
    expect(demoDataset.users.length).toBe(12);
    expect(demoDataset.tags.length).toBe(24);
    expect(demoDataset.projects.length).toBeGreaterThanOrEqual(25);
  });

  it("chaque personne respecte le schema CurrentUser", () => {
    for (const user of demoDataset.users) {
      expect(() => currentUserSchema.parse(user)).not.toThrow();
    }
  });

  it("chaque tag respecte le schema Tag", () => {
    for (const tag of demoDataset.tags) {
      expect(() => tagSchema.parse(tag)).not.toThrow();
    }
  });

  it("chaque projet respecte le schema Project (dont R-PR1)", () => {
    for (const project of demoDataset.projects) {
      expect(() => projectSchema.parse(project)).not.toThrow();
    }
  });

  it("les personnalisations de demo sont valides et leurs images ont un enregistrement", () => {
    const customized = demoDataset.projects.filter((p) => p.customization);
    expect(customized.length).toBeGreaterThanOrEqual(3);
    const records = new Set(
      demoDataset.customizationImages.map(
        (image) => `${image.projectId}:${image.id}`,
      ),
    );
    for (const project of customized) {
      const { banner, gallery } = project.customization!;
      for (const image of [...(banner ? [banner] : []), ...gallery]) {
        expect(records.has(`${project.id}:${image.id}`)).toBe(true);
      }
    }
  });

  it("chaque appartenance, demande et invitation respecte son schema", () => {
    for (const membership of demoDataset.memberships) {
      expect(() => membershipSchema.parse(membership)).not.toThrow();
    }
    for (const request of demoDataset.joinRequests) {
      expect(() => joinRequestSchema.parse(request)).not.toThrow();
    }
    for (const invitation of demoDataset.invitations) {
      expect(() => invitationSchema.parse(invitation)).not.toThrow();
    }
  });

  it("chaque highfive, annonce, commentaire respecte son schema", () => {
    for (const highfive of demoDataset.highfives) {
      expect(() => highfiveSchema.parse(highfive)).not.toThrow();
    }
    for (const announcement of demoDataset.announcements) {
      expect(() => announcementSchema.parse(announcement)).not.toThrow();
    }
    for (const comment of demoDataset.comments) {
      expect(() => commentSchema.parse(comment)).not.toThrow();
    }
  });

  it("chaque colonne, tache, mur et fichier respecte son schema", () => {
    for (const column of demoDataset.columns) {
      expect(() => columnSchema.parse(column)).not.toThrow();
    }
    for (const task of demoDataset.tasks) {
      expect(() => taskSchema.parse(task)).not.toThrow();
    }
    for (const wall of demoDataset.walls) {
      expect(() => wallSchema.parse(wall)).not.toThrow();
    }
    for (const file of demoDataset.files) {
      expect(() => projectFileSchema.parse(file)).not.toThrow();
    }
  });

  it("chaque conversation et message respecte son schema", () => {
    for (const conversation of demoDataset.conversations) {
      expect(() => conversationSchema.parse(conversation)).not.toThrow();
    }
    for (const message of demoDataset.messages) {
      expect(() => messageSchema.parse(message)).not.toThrow();
    }
  });

  it("chaque notification, signalement et action d'administration respecte son schema", () => {
    for (const notification of demoDataset.notifications) {
      expect(() => notificationSchema.parse(notification)).not.toThrow();
    }
    for (const report of demoDataset.reports) {
      expect(() => reportSchema.parse(report)).not.toThrow();
    }
    for (const action of demoDataset.adminActions) {
      expect(() => adminActionSchema.parse(action)).not.toThrow();
    }
  });

  describe("integrite referentielle", () => {
    const userIds = new Set(demoDataset.users.map((u) => u.id));
    const tagIds = new Set(demoDataset.tags.map((t) => t.id));
    const projectIds = new Set(demoDataset.projects.map((p) => p.id));
    const columnIds = new Set(demoDataset.columns.map((c) => c.id));

    it("chaque ownerId de projet existe parmi les utilisateurs", () => {
      for (const project of demoDataset.projects) {
        expect(userIds.has(project.ownerId)).toBe(true);
      }
    });

    it("chaque tagId de projet existe parmi les tags", () => {
      for (const project of demoDataset.projects) {
        for (const tagId of project.tags) {
          expect(tagIds.has(tagId)).toBe(true);
        }
        for (const needTag of project.needs) {
          if (needTag.tagId) expect(tagIds.has(needTag.tagId)).toBe(true);
        }
      }
    });

    it("R-M1 : exactement un owner par projet", () => {
      for (const project of demoDataset.projects) {
        const owners = demoDataset.memberships.filter(
          (m) => m.projectId === project.id && m.role === "owner",
        );
        expect(owners).toHaveLength(1);
        expect(owners[0]?.userId).toBe(project.ownerId);
      }
    });

    it("R-PR1 : un projet prive n'a que la participation on_invite", () => {
      for (const project of demoDataset.projects) {
        if (project.visibility === "private") {
          expect(project.participation).toBe("on_invite");
        }
      }
    });

    it("chaque columnId de tache existe et appartient a un projet reel", () => {
      for (const task of demoDataset.tasks) {
        expect(columnIds.has(task.columnId)).toBe(true);
      }
      for (const column of demoDataset.columns) {
        expect(projectIds.has(column.projectId)).toBe(true);
      }
    });

    it("chaque projectId reference par les collections liees a un projet existe", () => {
      const collectionsWithProjectId = [
        demoDataset.announcements,
        demoDataset.comments,
        demoDataset.walls,
        demoDataset.files,
        demoDataset.memberships,
        demoDataset.joinRequests,
        demoDataset.invitations,
        demoDataset.highfives,
      ];
      for (const collection of collectionsWithProjectId) {
        for (const row of collection) {
          expect(projectIds.has(row.projectId)).toBe(true);
        }
      }
    });

    it("chaque userId reference (auteurs, membres, participants) existe", () => {
      for (const membership of demoDataset.memberships) {
        expect(userIds.has(membership.userId)).toBe(true);
      }
      for (const announcement of demoDataset.announcements) {
        expect(userIds.has(announcement.authorId)).toBe(true);
      }
      for (const comment of demoDataset.comments) {
        expect(userIds.has(comment.authorId)).toBe(true);
      }
      for (const conversation of demoDataset.conversations) {
        for (const participantId of conversation.participantIds) {
          expect(userIds.has(participantId)).toBe(true);
        }
      }
      for (const message of demoDataset.messages) {
        expect(userIds.has(message.authorId)).toBe(true);
      }
      for (const notification of demoDataset.notifications) {
        expect(userIds.has(notification.recipientId)).toBe(true);
        for (const actorId of notification.actorIds) {
          expect(userIds.has(actorId)).toBe(true);
        }
      }
    });
  });
});
