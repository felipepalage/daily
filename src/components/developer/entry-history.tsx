import { formatFullDate } from "@/lib/date";
import { Card } from "@/components/ui/card";

type Entry = {
  id: string;
  date: Date;
  doing: string;
  blocked: string;
  improve: string;
};

export function EntryHistory({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-foreground-muted">
        Nenhum check-in registrado ainda.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <Card key={entry.id} className="p-5">
          <p className="mb-3 text-sm font-medium text-foreground-muted">
            {formatFullDate(entry.date)}
          </p>
          <dl className="space-y-2.5 text-sm">
            <div>
              <dt className="font-medium text-foreground">O que estava fazendo</dt>
              <dd className="text-foreground-muted whitespace-pre-wrap">{entry.doing}</dd>
            </div>
            {entry.blocked && (
              <div>
                <dt className="font-medium text-foreground">O que estava travado</dt>
                <dd className="text-foreground-muted whitespace-pre-wrap">{entry.blocked}</dd>
              </div>
            )}
            {entry.improve && (
              <div>
                <dt className="font-medium text-foreground">O que podia melhorar</dt>
                <dd className="text-foreground-muted whitespace-pre-wrap">{entry.improve}</dd>
              </div>
            )}
          </dl>
        </Card>
      ))}
    </div>
  );
}
