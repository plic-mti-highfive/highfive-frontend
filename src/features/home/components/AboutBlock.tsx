import { Section } from "@shared/ui";

/**
 * Remplace "Depuis ta dernière visite" pour un visiteur non connecté (doc 12
 * E-01) : trois phrases, pas de bouton d'inscription géant.
 */
export function AboutBlock() {
  return (
    <Section title="Ce qu'est HighFive!">
      <p className="text-body-sm text-muted-foreground">
        HighFive! rassemble des idées de projets non professionnels et les gens
        qui peuvent les faire avancer. Chacun pose son idée, trouve une équipe
        et avance avec elle, sans jargon de gestion de projet.
      </p>
    </Section>
  );
}
