import { BackButton } from "./BackButton";
import { PrimaryButton } from "./PrimaryButton";
import { ProgressDots } from "./ProgressDots";
import { TagSearchDropdown } from "./TagSearchDropdown";

export function StepManualTags({
  onBack,
  onSubmit,
  value,
  onChange,
}: {
  onBack: () => void;
  onSubmit: () => void;
  value: string[];
  onChange: (t: string[]) => void;
}) {
  return (
    <div className="space-y-6">
      <BackButton onClick={onBack} />
      <ProgressDots step="manual-tags" />
      <div className="mb-8">
        <h2 className="text-4xl font-black text-ink leading-tight">
          Ajoute des tags
          <br />à ton projet
        </h2>
        <p className="mt-2 text-sm text-ink">
          Jusqu'à 5 tags pour aider la communauté à trouver ton projet.
        </p>
      </div>
      <TagSearchDropdown selected={value} onChange={onChange} maxTags={5} />
      <PrimaryButton onClick={onSubmit}>Créer le projet →</PrimaryButton>
    </div>
  );
}
