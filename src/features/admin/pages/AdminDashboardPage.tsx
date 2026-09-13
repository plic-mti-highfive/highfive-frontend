import { Header, Footer } from "@features/layout";
import { PageHeader, Tabs, TabsList, TabsPanel, TabsTab } from "@shared/ui";
import { AccountsSection } from "../components/AccountsSection";
import { ModerationSection } from "../components/ModerationSection";
import { ProjectsSection } from "../components/ProjectsSection";
import { StatisticsSection } from "../components/StatisticsSection";

/**
 * Administration (doc 03 : jamais "dashboard"). Onglets locaux plutôt que
 * des routes : la liste des routes v2 figées (CONVENTIONS.md V2-9) ne
 * retient qu'une seule entrée, `/admin` — pas de sous-routes par section.
 */
export function AdminDashboardPage() {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-3.5rem)] bg-background">
        <div className="mx-auto max-w-6xl px-8 py-8">
          <PageHeader title="Administration" />
          <Tabs defaultValue="moderation" className="mt-6">
            <TabsList>
              <TabsTab value="moderation">Modération</TabsTab>
              <TabsTab value="comptes">Comptes</TabsTab>
              <TabsTab value="projets">Projets</TabsTab>
              <TabsTab value="statistiques">Statistiques</TabsTab>
            </TabsList>
            <TabsPanel value="moderation" className="mt-6">
              <ModerationSection />
            </TabsPanel>
            <TabsPanel value="comptes" className="mt-6">
              <AccountsSection />
            </TabsPanel>
            <TabsPanel value="projets" className="mt-6">
              <ProjectsSection />
            </TabsPanel>
            <TabsPanel value="statistiques" className="mt-6">
              <StatisticsSection />
            </TabsPanel>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
}
