import { Card } from "@/components/ui/card";
import { clsx } from "clsx";

const MOOD_EMOJI: Record<string, string> = {
  otimo: "😄",
  bem: "🙂",
  neutro: "😐",
  dificil: "😕",
  pessimo: "😣",
};

export type WeekDayEntry = {
  label: string;
  shortDate: string;
  hasEntry: boolean;
  doing: string;
  blocked: string;
  improve: string;
  mood: string | null;
};

export function DeveloperWeekSummary({
  name,
  role,
  days,
}: {
  name: string;
  role: string | null;
  days: WeekDayEntry[];
}) {
  const daysWithEntry = days.filter((day) => day.hasEntry).length;

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{name}</h3>
          {role && <p className="text-sm text-foreground-muted">{role}</p>}
        </div>
        <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-foreground-muted">
          {daysWithEntry}/{days.length} dias com check-in
        </span>
      </div>

      <div className="space-y-4">
        {days.map((day) => (
          <div
            key={day.shortDate}
            className={clsx(
              "rounded-xl border border-border p-4",
              !day.hasEntry && "border-dashed",
            )}
          >
            <p className="mb-2 text-sm font-medium text-foreground">
              {day.mood && <span className="mr-1.5">{MOOD_EMOJI[day.mood]}</span>}
              {day.label} · {day.shortDate}
            </p>
            {day.hasEntry ? (
              <div className="space-y-1.5 text-sm text-foreground-muted">
                <p>
                  <span className="font-medium text-foreground">Fez: </span>
                  {day.doing}
                </p>
                {day.blocked && (
                  <p>
                    <span className="font-medium text-foreground">Travou: </span>
                    {day.blocked}
                  </p>
                )}
                {day.improve && (
                  <p>
                    <span className="font-medium text-foreground">Melhorar: </span>
                    {day.improve}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-foreground-muted/70">Sem check-in registrado</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
