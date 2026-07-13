import { requireSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import {
  addDays,
  formatShortDate,
  formatWeekRangeLabel,
  formatWeekdayLabel,
  getMondayOfWeek,
  getWeekDays,
  inputValueToDateOnlyUTC,
} from "@/lib/date";
import { getActiveTeam } from "@/lib/team";
import { WeekNav } from "@/components/weekly/week-nav";
import { DeveloperWeekSummary, type WeekDayEntry } from "@/components/weekly/developer-week-summary";
import { ExportPdfButton } from "@/components/weekly/export-pdf-button";
import { ExportCsvButton } from "@/components/weekly/export-csv-button";

type ScrumMasterDto = {
  id: string;
  name: string;
  email: string;
  questionDoingLabel: string;
  questionBlockedLabel: string;
  questionImproveLabel: string;
  redmineUrl: string | null;
  redmineApiKey: string | null;
};

type DeveloperDto = {
  id: string;
  name: string;
  role: string | null;
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

export default async function WeeklyPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const session = await requireSession();
  const { activeTeam } = await getActiveTeam();

  let scrumMaster: ScrumMasterDto | null = null;
  let developers: DeveloperDto[] = [];
  let entries: EntryDto[] = [];

  try {
    scrumMaster = await apiFetch<ScrumMasterDto>("/auth/me");
  } catch {
    scrumMaster = null;
  }

  const questionLabels = {
    doing: scrumMaster?.questionDoingLabel ?? "O que está sendo feito?",
    blocked: scrumMaster?.questionBlockedLabel ?? "Tem algum impedimento?",
    improve: scrumMaster?.questionImproveLabel ?? "O que pode melhorar?",
  };

  const monday = week ? getMondayOfWeek(inputValueToDateOnlyUTC(week)) : getMondayOfWeek(new Date());
  const friday = addDays(monday, 4);
  const weekDays = getWeekDays(monday);

  const mondayStr = monday.toISOString().split("T")[0];
  const fridayStr = friday.toISOString().split("T")[0];

  if (activeTeam) {
    try {
      developers = await apiFetch<DeveloperDto[]>(`/teams/${activeTeam.id}/developers`);
    } catch {
      developers = [];
    }

    try {
      entries = await apiFetch<EntryDto[]>(
        `/teams/${activeTeam.id}/entries/range?from=${mondayStr}&to=${fridayStr}`,
      );
    } catch {
      entries = [];
    }
  }

  // Agrupa entries por developerId
  const entriesByDeveloper = new Map<string, EntryDto[]>();
  for (const entry of entries) {
    const list = entriesByDeveloper.get(entry.developerId) ?? [];
    list.push(entry);
    entriesByDeveloper.set(entry.developerId, list);
  }

  const developerData = developers.map((developer) => {
    const devEntries = entriesByDeveloper.get(developer.id) ?? [];

    const days: WeekDayEntry[] = weekDays.map((day) => {
      const entry = devEntries.find((e) => new Date(e.date).getTime() === day.getTime());
      return {
        label: formatWeekdayLabel(day),
        shortDate: formatShortDate(day),
        hasEntry: Boolean(entry),
        doing: entry?.doing ?? "",
        blocked: entry?.blocked ?? "",
        improve: entry?.improve ?? "",
        mood: entry?.mood ?? null,
        featureNumber: entry?.featureNumber ?? null,
        blockerNumber: entry?.blockerNumber ?? null,
        epicNumber: entry?.epicNumber ?? null,
        taskNumber: entry?.taskNumber ?? null,
      };
    });

    return { id: developer.id, name: developer.name, role: developer.role, days };
  });

  const weekRangeLabel = formatWeekRangeLabel(monday);

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Resumo semanal</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Consolidado dos check-ins do time &ldquo;{activeTeam?.name ?? ""}&rdquo;.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportCsvButton
            weekRangeLabel={weekRangeLabel}
            developers={developerData}
            questionLabels={questionLabels}
          />
          <ExportPdfButton
            weekRangeLabel={weekRangeLabel}
            developers={developerData}
            questionLabels={questionLabels}
          />
        </div>
      </header>

      <div className="mb-8">
        <WeekNav monday={monday} />
      </div>

      {developerData.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-foreground-muted">
            Nenhum desenvolvedor cadastrado ainda. Adicione o time na visão geral para começar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {developerData.map((developer) => (
            <DeveloperWeekSummary
              key={developer.id}
              name={developer.name}
              role={developer.role}
              days={developer.days}
              questionLabels={questionLabels}
              redmineUrl={scrumMaster?.redmineUrl ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}