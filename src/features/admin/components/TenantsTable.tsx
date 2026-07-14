import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import type { AdminTenant } from "../types";

interface TenantsTableProps {
  tenants: AdminTenant[];
  onDelete: (tenantId: string) => void;
}

export function TenantsTable({ tenants, onDelete }: TenantsTableProps) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-sidebar">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-left">
              <th className="px-4 py-3 font-semibold text-muted-foreground">
                Organisation
              </th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">
                Domaine
              </th>
              <th className="px-4 py-3 font-semibold text-muted-foreground text-right">
                Utilisateurs
              </th>
              <th className="px-4 py-3 font-semibold text-muted-foreground text-right">
                Projets
              </th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">
                Créé le
              </th>
              <th className="px-4 py-3 font-semibold text-muted-foreground text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tenants.map((tenant) => (
              <tr
                key={tenant.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  {tenant.name}
                </td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                  {tenant.domain}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {tenant.usersCount}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {tenant.projectsCount}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {format(new Date(tenant.createdAt), "d MMM yyyy", {
                    locale: fr,
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => onDelete(tenant.id)}
                      title="Supprimer"
                      className="p-1.5 rounded-lg hover:bg-red-100 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2.5 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground">
          {tenants.length} organisation{tenants.length > 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
