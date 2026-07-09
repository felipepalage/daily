import Link from "next/link";
import { clsx } from "clsx";
import { deleteDeveloperAction } from "@/lib/actions/developer-actions";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function DeveloperCard({
  id,
  name,
  role,
  checkedInToday,
  blockedStreak,
}: {
  id: string;
  name: string;
  role: string | null;
  checkedInToday: boolean;
  blockedStreak: number;
}) {
  return (
    <div className="group relative rounded-2xl border border-border bg-surface p-5 shadow-sm shadow-black/[0.02] transition-shadow hover:shadow-md">
      <form action={deleteDeveloperAction.bind(null, id)} className="absolute right-3 top-3">
        <button
          type="submit"
          aria-label="Remover desenvolvedor"
          className="cursor-pointer rounded-lg p-1.5 text-foreground-muted opacity-0 transition-opacity hover:bg-accent/10 hover:text-accent group-hover:opacity-100"
        >
          ✕
        </button>
      </form>

      <Link href={`/dashboard/developers/${id}`} className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {initials(name)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{name}</p>
            {role && <p className="truncate text-sm text-foreground-muted">{role}</p>}
          </div>
        </div>

        <span
          className={clsx(
            "inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-xs font-medium",
            checkedInToday
              ? "bg-success/10 text-success"
              : "bg-warning/10 text-warning",
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {checkedInToday ? "Check-in feito hoje" : "Sem check-in hoje"}
        </span>

        {blockedStreak >= 2 && (
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
            ⚠ Travado há {blockedStreak} check-ins seguidos
          </span>
        )}
      </Link>
    </div>
  );
}
