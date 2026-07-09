import Link from "next/link";
import { addDays, dateToInputValue, formatWeekRangeLabel, getMondayOfWeek } from "@/lib/date";

export function WeekNav({ monday }: { monday: Date }) {
  const previousWeek = addDays(monday, -7);
  const nextWeek = addDays(monday, 7);
  const currentWeek = getMondayOfWeek(new Date());
  const isCurrentWeek = monday.getTime() === currentWeek.getTime();

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/dashboard/weekly?week=${dateToInputValue(previousWeek)}`}
        className="rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground-muted hover:bg-surface-muted"
      >
        ← Semana anterior
      </Link>
      <span className="min-w-[220px] text-center text-sm font-medium text-foreground">
        {formatWeekRangeLabel(monday)}
      </span>
      <Link
        href={`/dashboard/weekly?week=${dateToInputValue(nextWeek)}`}
        className="rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground-muted hover:bg-surface-muted"
      >
        Próxima semana →
      </Link>
      {!isCurrentWeek && (
        <Link
          href={`/dashboard/weekly?week=${dateToInputValue(currentWeek)}`}
          className="rounded-xl px-3 py-2 text-sm font-medium text-primary hover:underline"
        >
          Semana atual
        </Link>
      )}
    </div>
  );
}
