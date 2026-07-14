import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { todayDateOnlyUTC, formatFullDate } from "@/lib/date";
import { getActiveTeam } from "@/lib/team";
import { computeBlockedStreak } from "@/lib/blocked-streak";
import { DeveloperCard } from "@/components/dashboard/developer-card";

export const runtime = "edge";

type DeveloperDto = {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  teamId: string;
  publicToken: string | null;
  createdAt: string;
};

type EntryDto = {
  id: string;
  developerId: string;
  date: string;
  doing: string;
  blocked: string;
  improve: string;
  mood: string | null;
  scrumNote: string | null;
  featureNumber: string | null;
  blockerNumber: string | null;
  epicNumber: string | null;
  taskNumber: string | null;
};

export default async function DashboardPage() {
  const session = await requireSession();
  const today = todayDateOnlyUTC();
  const { activeTeam } = await getActiveTeam();

  if (!activeTeam) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <p className="text-foreground-muted">
          Nenhum time encontrado. Crie um time nas{" "}
          <Link href="/dashboard/settings" className="font-medium text-primary hover:underline">
            Configurações
          </Link>{" "}
          para começar.
        </p>
      </div>
    );
  }

  // Busca developers e entries do time ativo via API
  let developers: DeveloperDto[] = [];
  let entries: EntryDto[] = [];

  try {
    developers = await apiFetch<DeveloperDto[]>(`/teams/${activeTeam.id}/developers`);
  } catch {
    developers = [];
  }

  try {
    entries = await apiFetch<EntryDto[]>(`/teams/${activeTeam.id}/entries/recent`);
  } catch {
    entries = [];
  }

  // Agrupa entries por developerId
  const entriesByDeveloper = new Map<string, EntryDto[]>();
  for (const entry of entries) {
    const list = entriesByDeveloper.get(entry.developerId) ?? [];
    list.push(entry);
    entriesByDeveloper.set(entry.developerId, list);
  }

  return (
    <div>
      <header className="mb-8">
        <p className="text-sm text-foreground-muted">{formatFullDate(new Date())}</p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">
          Olá, {session.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Acompanhe o check-in diário do time &ldquo;{activeTeam.name}&rdquo;.
        </p>
      </header>

      {developers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-foreground-muted">
            Nenhum desenvolvedor cadastrado ainda. Adicione o primeiro do time em{" "}
            <Link href="/dashboard/settings" className="font-medium text-primary hover:underline">
              Configurações
            </Link>{" "}
            para começar os check-ins diários.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {developers.map((developer) => {
            const devEntries = entriesByDeveloper.get(developer.id) ?? [];
            const checkedInToday = devEntries.some(
              (entry) => new Date(entry.date).getTime() === today.getTime(),
            );
            const recentEntries = devEntries.slice(0, 7).map((e) => ({
              date: new Date(e.date),
              blocked: e.blocked,
            }));

            return (
              <DeveloperCard
                key={developer.id}
                id={developer.id}
                name={developer.name}
                role={developer.role}
                checkedInToday={checkedInToday}
                blockedStreak={computeBlockedStreak(recentEntries)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}