"use client";

import { useState } from "react";
import type { ProjectForm } from "../types";
import { useStepTransition } from "../hooks/useStepTransition";
import { StepWrapper } from "../components/StepWrapper";
import { StepChoose } from "../components/StepChoose";
import { StepAIPitch } from "../components/StepAIPitch";
import { StepGenerating } from "../components/StepGenerating";
import { StepManualName } from "../components/StepManualName";
import { StepManualDesc } from "../components/StepManualDesc";
import { StepManualTags } from "../components/StepManualTags";
import { StepDone } from "../components/StepDone";
import { projectService } from "@/api/services";

export default function CreateProject() {
  const { step, visible, goTo } = useStepTransition("choose");
  const [form, setForm] = useState<ProjectForm>({
    name: "",
    description: "",
    tags: [],
  });
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  function handleChooseAI() {
    goTo("ai-pitch");
  }

  function handleAIPitch(pitch: string) {
    goTo("ai-generating");
    setTimeout(() => {
      setForm((f) => ({ ...f, name: "Projet généré", description: pitch }));
      goTo("done");
    }, 3200);
  }

  function handleChooseManual() {
    goTo("manual-name");
  }
  function handleManualName() {
    goTo("manual-desc");
  }
  function handleManualDesc() {
    goTo("manual-tags");
  }

  async function handleManualSubmit() {
    try {
      const newProject = await projectService.createProject(form);
      setCreatedProjectId(newProject.id);
      goTo("done");
    } catch (error) {
      console.error("Erreur lors de la création du projet :", error);
    }
  }

  const backs: Partial<Record<typeof step, typeof step>> = {
    "ai-pitch": "choose",
    "manual-name": "choose",
    "manual-desc": "manual-name",
    "manual-tags": "manual-desc",
  };
  function handleBack() {
    const prev = backs[step];
    if (prev) goTo(prev);
  }

  return (
    <>
      <main className="min-h-screen bg-background flex items-start justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          <StepWrapper visible={visible}>
            {step === "choose" && (
              <StepChoose
                onChoose={(m) =>
                  m === "ai" ? handleChooseAI() : handleChooseManual()
                }
              />
            )}
            {step === "ai-pitch" && (
              <StepAIPitch onBack={handleBack} onGenerate={handleAIPitch} />
            )}
            {step === "ai-generating" && <StepGenerating />}
            {step === "manual-name" && (
              <StepManualName
                onBack={handleBack}
                onNext={handleManualName}
                value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
              />
            )}
            {step === "manual-desc" && (
              <StepManualDesc
                onBack={handleBack}
                onNext={handleManualDesc}
                value={form.description}
                onChange={(v) => setForm((f) => ({ ...f, description: v }))}
              />
            )}
            {step === "manual-tags" && (
              <StepManualTags
                onBack={handleBack}
                onSubmit={handleManualSubmit}
                value={form.tags}
                onChange={(t) => setForm((f) => ({ ...f, tags: t }))}
              />
            )}
            {step === "done" && (
              <StepDone projectName={form.name} projectId={createdProjectId} />
            )}
          </StepWrapper>
        </div>
      </main>

      <style>{`
        @keyframes check-draw {
          from { stroke-dasharray: 30; stroke-dashoffset: 30; }
          to   { stroke-dasharray: 30; stroke-dashoffset: 0;  }
        }
        .animate-check-draw {
          animation: check-draw 0.4s ease-out 0.2s both;
        }
      `}</style>
    </>
  );
}
