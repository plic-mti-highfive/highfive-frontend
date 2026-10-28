import { describe, expect, it } from "vitest";
import type { NotificationTarget } from "@/domain";
import { actionPhrase, targetLabel } from "./notificationText";

describe("actionPhrase", () => {
  it("admin_decision se lit avec sa cible, un projet et non un compte", () => {
    const target: NotificationTarget = {
      type: "project",
      projectSlug: "fresque-murale",
      projectTitle: "Fresque murale",
    };
    expect(
      `${actionPhrase("admin_decision", false)} ${targetLabel(target)}`,
    ).toBe("a pris une décision de modération sur Fresque murale");
    expect(actionPhrase("admin_decision", false)).not.toMatch(/compte/);
  });

  it("s'accorde au pluriel", () => {
    expect(actionPhrase("admin_decision", true)).toBe(
      "ont pris une décision de modération sur",
    );
  });
});
