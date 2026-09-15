import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import {
  Card,
  CardBody,
  CardHeader,
  ErrorState,
  Skeleton,
  Stat,
} from "@shared/ui";
import { ApiError } from "@/api/client";
import { useAdminStats } from "@/api/queries/admin";

const tooltipStyle = {
  borderRadius: "8px",
  border: "1px solid var(--border)",
  background: "var(--card)",
};

function ChartCard({
  title,
  question,
  children,
}: {
  title: string;
  question: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-heading-md font-semibold text-foreground">
          {title}
        </h3>
        <p className="text-body-sm text-muted-foreground">{question}</p>
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  );
}

function NoDataYet() {
  return (
    <p className="py-16 text-center text-body-sm text-muted-foreground">
      Pas encore assez de données.
    </p>
  );
}

export function StatisticsSection() {
  const statsQuery = useAdminStats();

  if (statsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (statsQuery.isError) {
    const message =
      statsQuery.error instanceof ApiError && statsQuery.error.status === 403
        ? "Tu n'as pas le droit de voir les statistiques."
        : "Les statistiques n'ont pas pu être chargées.";
    return (
      <ErrorState message={message} onRetry={() => statsQuery.refetch()} />
    );
  }

  const stats = statsQuery.data;
  if (!stats) return null;

  const signups = stats.signupsLast30Days.map((d) => ({
    ...d,
    label: format(new Date(d.date), "d MMM", { locale: fr }),
  }));
  const hasSignups = signups.some((d) => d.count > 0);

  const projectStates = [
    {
      name: "Actifs",
      count: stats.activeProjectsCount,
      color: "var(--color-apple)",
    },
    {
      name: "Terminés",
      count: stats.doneProjectsCount,
      color: "var(--color-sky)",
    },
    {
      name: "Archivés",
      count: stats.archivedProjectsCount,
      color: "var(--muted-foreground)",
    },
  ];
  const hasProjects = projectStates.some((p) => p.count > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <Stat value={stats.usersCount} label="Personnes inscrites" />
        <Stat value={stats.onlineCount} label="En ligne" />
        <Stat value={stats.activeProjectsCount} label="Projets actifs" />
        <Stat value={stats.doneProjectsCount} label="Projets terminés" />
        <Stat value={stats.archivedProjectsCount} label="Projets archivés" />
        <Stat
          value={stats.pendingReportsCount}
          label="Signalements en attente"
        />
      </div>

      <ChartCard
        title="Inscriptions, 30 derniers jours"
        question="Est-ce que de nouvelles personnes arrivent ?"
      >
        {hasSignups ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={signups}>
              <defs>
                <linearGradient id="admin-signups" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-chart-1)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-chart-1)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value) => [value, "Inscriptions"]}
                contentStyle={tooltipStyle}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                fill="url(#admin-signups)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <NoDataYet />
        )}
      </ChartCard>

      <ChartCard
        title="État des projets"
        question="Est-ce que les projets vivent ?"
      >
        {hasProjects ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={projectStates} barSize={56}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value) => [value, "Projets"]}
                contentStyle={tooltipStyle}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {projectStates.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <NoDataYet />
        )}
      </ChartCard>
    </div>
  );
}
