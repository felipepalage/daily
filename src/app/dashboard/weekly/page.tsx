import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

export default async function WeeklyPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const session = await requireSession();
  const { activeTeam } = await getActiveTeam(session.scrumMasterId);

  const monday = week ? getMondayOfWeek(inputValueToDateOnlyUTC(week)) : getMondayOfWeek(new Date());
  const friday = addDays(monday, 4);
  const weekDays = getWeekDays(monday);

  const developers = await prisma.developer.findMany({
    where: { teamId: activeTeam.id },
    orderBy: { createdAt: "asc" },
    include: {
      entries: {
        where: { date: { gte: monday, lte: friday } },
      },
    },
  });

  const developerData = developers.map((developer) => {
    const days: WeekDayEntry[] = weekDays.map((day) => {
      const entry = developer.entries.find((e) => e.date.getTime() === day.getTime());
      return {
        label: formatWeekdayLabel(day),
        shortDate: formatShortDate(day),
        hasEntry: Boolean(entry),
        doing: entry?.doing ?? "",
        blocked: entry?.blocked ?? "",
        improve: entry?.improve ?? "",
        mood: entry?.mood ?? null,
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
            Consolidado dos check-ins do time &ldquo;{activeTeam.name}&rdquo;.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportCsvButton weekRangeLabel={weekRangeLabel} developers={developerData} />
          <ExportPdfButton weekRangeLabel={weekRangeLabel} developers={developerData} />
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
