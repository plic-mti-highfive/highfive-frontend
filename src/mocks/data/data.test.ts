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
  it("charge un volume conforme au doc 23 (~25 projets, 24 tags) et étoffé (comptes, équipes)", () => {
    // Doc 23 prévoit 12 comptes ; le jeu en compte davantage pour que les équipes soient crédibles.
    expect(demoDataset.users.length).toBeGreaterThanOrEqual(12);
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
  describe("plateforme vivante (contenu cohérent)", () => {
    const users = new Map(demoDataset.users.map((u) => [u.id, u]));
    const projects = new Map(demoDataset.projects.map((p) => [p.id, p]));
    const live = demoDataset.projects.filter((p) => p.state !== "draft");
    const membersOf = (projectId: string) =>
      demoDataset.memberships.filter((m) => m.projectId === projectId);
    const roleOf = (projectId: string, userId: string) =>
      membersOf(projectId).find((m) => m.userId === userId)?.role;
    const projectOfTask = new Map(
      demoDataset.columns.map((c) => [c.id, c.projectId]),
    );

    it("tout projet hors brouillon a un À propos et une vraie équipe", () => {
      for (const project of live) {
        expect(project.description?.length ?? 0).toBeGreaterThan(200);
        expect(membersOf(project.id).length).toBeGreaterThanOrEqual(3);
      }
    });

    it("aucune personne n'apparaît deux fois dans une équipe, ni avant son inscription ou la création du projet", () => {
      const seen = new Set<string>();
      for (const membership of demoDataset.memberships) {
        const key = `${membership.projectId}:${membership.userId}`;
        expect(seen.has(key)).toBe(false);
        seen.add(key);
        expect(
          membership.joinedAt >= projects.get(membership.projectId)!.createdAt,
        ).toBe(true);
        expect(
          membership.joinedAt >= users.get(membership.userId)!.createdAt,
        ).toBe(true);
      }
    });

    it("R-A1/R-A2 : annonces écrites par un porteur ou co-porteur, une seule épinglée", () => {
      const pinned = new Map<string, number>();
      for (const announcement of demoDataset.announcements) {
        expect(["owner", "co_owner"]).toContain(
          roleOf(announcement.projectId, announcement.authorId),
        );
        expect(
          announcement.publishedAt >=
            projects.get(announcement.projectId)!.createdAt,
        ).toBe(true);
        if (announcement.pinned)
          pinned.set(
            announcement.projectId,
            (pinned.get(announcement.projectId) ?? 0) + 1,
          );
      }
      for (const count of pinned.values()) expect(count).toBe(1);
      const withAnnouncement = new Set(
        demoDataset.announcements.map((a) => a.projectId),
      );
      for (const project of live.filter((p) => p.state === "active")) {
        expect(withAnnouncement.has(project.id)).toBe(true);
      }
    });

    it("R-C4 : réponses à un seul niveau, dans le même projet, après leur parent", () => {
      const byId = new Map(demoDataset.comments.map((c) => [c.id, c]));
      for (const comment of demoDataset.comments) {
        expect(
          comment.publishedAt >= projects.get(comment.projectId)!.createdAt,
        ).toBe(true);
        expect(
          comment.publishedAt >= users.get(comment.authorId)!.createdAt,
        ).toBe(true);
        if (!comment.parentId) continue;
        const parent = byId.get(comment.parentId)!;
        expect(parent).toBeDefined();
        expect(parent.parentId).toBeUndefined();
        expect(parent.projectId).toBe(comment.projectId);
        expect(comment.publishedAt >= parent.publishedAt).toBe(true);
      }
      const threads = demoDataset.comments.filter((c) => !c.parentId).length;
      expect(threads).toBeGreaterThanOrEqual(50);
      expect(demoDataset.comments.some((c) => c.hidden)).toBe(true);
    });

    it("R-K2 : 1 à 6 colonnes ; tâches créées et confiées à des membres du projet", () => {
      for (const project of demoDataset.projects) {
        const count = demoDataset.columns.filter(
          (c) => c.projectId === project.id,
        ).length;
        expect(count).toBeGreaterThanOrEqual(1);
        expect(count).toBeLessThanOrEqual(6);
      }
      for (const task of demoDataset.tasks) {
        const projectId = projectOfTask.get(task.columnId)!;
        expect(roleOf(projectId, task.createdBy)).toBeDefined();
        for (const assigneeId of task.assigneeIds) {
          expect(roleOf(projectId, assigneeId)).toBeDefined();
        }
      }
    });

    it("chaque projet hors brouillon a un canal qui miroite son équipe, et des messages de participants", () => {
      for (const project of live) {
        const channel = demoDataset.conversations.find(
          (c) => c.type === "channel" && c.projectId === project.id,
        );
        expect(channel).toBeDefined();
        expect([...channel!.participantIds].sort()).toEqual(
          membersOf(project.id)
            .map((m) => m.userId)
            .sort(),
        );
        expect(
          demoDataset.messages.some((m) => m.conversationId === channel!.id),
        ).toBe(true);
      }
      const conversations = new Map(
        demoDataset.conversations.map((c) => [c.id, c]),
      );
      for (const message of demoDataset.messages) {
        const conversation = conversations.get(message.conversationId)!;
        expect(conversation.participantIds).toContain(message.authorId);
        expect(message.sentAt >= conversation.createdAt).toBe(true);
      }
    });

    it("un fil de messages ne dépasse pas la première page du handler (20 messages)", () => {
      const counts = new Map<string, number>();
      for (const message of demoDataset.messages)
        counts.set(
          message.conversationId,
          (counts.get(message.conversationId) ?? 0) + 1,
        );
      for (const count of counts.values())
        expect(count).toBeLessThanOrEqual(20);
    });

    it("R-F1 : les fichiers sont déposés par des membres (pas des observateurs), sous les plafonds", () => {
      const totals = new Map<string, number>();
      for (const file of demoDataset.files) {
        expect(["owner", "co_owner", "member"]).toContain(
          roleOf(file.projectId, file.uploadedBy),
        );
        expect(file.size).toBeLessThanOrEqual(20 * 1024 * 1024);
        totals.set(
          file.projectId,
          (totals.get(file.projectId) ?? 0) + file.size,
        );
      }
      for (const total of totals.values())
        expect(total).toBeLessThanOrEqual(200 * 1024 * 1024);
    });

    it("demandes et invitations sont cohérentes avec les équipes", () => {
      for (const request of demoDataset.joinRequests) {
        const member = roleOf(request.projectId, request.userId) !== undefined;
        if (request.status === "accepted") expect(member).toBe(true);
        if (request.status === "pending") expect(member).toBe(false);
      }
      for (const invitation of demoDataset.invitations) {
        if (invitation.status === "accepted") {
          expect(
            roleOf(invitation.projectId, invitation.recipientId),
          ).toBeDefined();
        }
        if (invitation.status === "pending") {
          expect(
            roleOf(invitation.projectId, invitation.recipientId),
          ).toBeUndefined();
        }
      }
      const statuses = new Set(demoDataset.joinRequests.map((r) => r.status));
      expect(statuses).toEqual(new Set(["pending", "accepted", "rejected"]));
    });

    it("R-H2/R-H3 : highfives uniques, jamais sur son propre projet, sous le compteur", () => {
      const seen = new Set<string>();
      const perProject = new Map<string, number>();
      for (const highfive of demoDataset.highfives) {
        const key = `${highfive.projectId}:${highfive.userId}`;
        expect(seen.has(key)).toBe(false);
        seen.add(key);
        const project = projects.get(highfive.projectId)!;
        expect(highfive.userId).not.toBe(project.ownerId);
        perProject.set(project.id, (perProject.get(project.id) ?? 0) + 1);
      }
      for (const [projectId, count] of perProject) {
        expect(count).toBeLessThanOrEqual(
          projects.get(projectId)!.highfiveCount,
        );
      }
    });

    it("chaque cible de notification et de signalement existe", () => {
      const tasks = new Set(demoDataset.tasks.map((t) => t.id));
      const comments = new Set(demoDataset.comments.map((c) => c.id));
      const conversations = new Set(demoDataset.conversations.map((c) => c.id));
      const messages = new Set(demoDataset.messages.map((m) => m.id));
      for (const notification of demoDataset.notifications) {
        const found = {
          project: projects.has(notification.targetId),
          task: tasks.has(notification.targetId),
          comment: comments.has(notification.targetId),
          message: conversations.has(notification.targetId),
        }[notification.targetType];
        expect(found).toBe(true);
      }
      for (const report of demoDataset.reports) {
        const found = {
          project: projects.has(report.targetId),
          comment: comments.has(report.targetId),
          message: messages.has(report.targetId),
          user: users.has(report.targetId),
        }[report.targetType];
        expect(found).toBe(true);
      }
    });

    it("lastActivityAt n'est jamais antérieure à une annonce ou un commentaire du projet", () => {
      for (const item of [
        ...demoDataset.announcements,
        ...demoDataset.comments,
      ]) {
        const at = "publishedAt" in item ? item.publishedAt : "";
        expect(projects.get(item.projectId)!.lastActivityAt >= at).toBe(true);
      }
    });
  });
});
