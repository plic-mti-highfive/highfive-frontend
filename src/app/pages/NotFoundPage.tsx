import { Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button, EmptyState } from "@shared/ui";
import { useDocumentTitle } from "@shared/lib/useDocumentTitle";

/**
 * Page introuvable (route `*`), migree depuis src/pages/NotFoundPage.tsx —
 * primitives seules, vocabulaire doc 17 (pas de « Oups », tutoiement, casse
 * de phrase). Montee hors coquille site : elle sert autant sous `/lab` que
 * sous une route classique.
 */
export default function NotFoundPage() {
  const navigate = useNavigate();
  useDocumentTitle("Page introuvable");

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <EmptyState
        icon={Compass}
        title="Cette page n'existe pas"
        description="Elle a peut-être été déplacée ou supprimée."
        action={
          <Button onClick={() => navigate("/")}>Retour à Découvrir</Button>
        }
      />
    </main>
  );
}
