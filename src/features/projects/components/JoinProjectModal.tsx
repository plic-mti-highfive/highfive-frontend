import { useEffect } from "react";
import { CheckCircle } from "lucide-react";

// ─── Modale de confirmation ────────────────────────────────────────────────────

interface ConfirmJoinModalProps {
  projectName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmJoinModal({
  projectName,
  onConfirm,
  onCancel,
}: ConfirmJoinModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onCancel}
        aria-hidden="true"
      />
      {/* Carte centrée sur tous les écrans */}
      <div className="relative bg-background rounded-2xl w-full max-w-sm sm:max-w-md p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-foreground mb-2">
          Rejoindre ce projet
        </h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Vous êtes sur le point de rejoindre{" "}
          <span className="font-semibold text-foreground">
            « {projectName} »
          </span>
          . Voulez-vous continuer ?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-border text-foreground font-semibold rounded-lg hover:bg-muted transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-foreground text-background font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Rejoindre
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modale de succès ─────────────────────────────────────────────────────────

interface JoinSuccessModalProps {
  projectName: string;
  onClose: () => void;
}

export function JoinSuccessModal({
  projectName,
  onClose,
}: JoinSuccessModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Carte centrée sur tous les écrans */}
      <div className="relative bg-background rounded-2xl w-full max-w-sm sm:max-w-md p-6 shadow-2xl text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle size={36} className="text-green-500" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Vous avez rejoint le projet !
        </h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Bienvenue dans{" "}
          <span className="font-semibold text-foreground">
            « {projectName} »
          </span>
          . Vous pouvez maintenant collaborer avec les membres de l'équipe.
        </p>
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-foreground text-background font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
