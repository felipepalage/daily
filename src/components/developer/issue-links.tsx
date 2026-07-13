import { listIssueRefs, type IssueNumbers } from "@/lib/redmine";

// Mostra os itens do Redmine vinculados a um check-in. Vira link clicável
// quando a URL do Redmine está configurada; senão, mostra só o número.
export function IssueLinks({
  entry,
  redmineUrl,
}: {
  entry: IssueNumbers;
  redmineUrl: string | null | undefined;
}) {
  const refs = listIssueRefs(entry, redmineUrl);
  if (refs.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {refs.map((ref) => {
        const content = (
          <>
            <span className="font-medium">{ref.label}</span> #{ref.value}
          </>
        );
        return ref.url ? (
          <a
            key={ref.label}
            href={ref.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary transition-colors hover:bg-primary/20"
          >
            {content}
          </a>
        ) : (
          <span
            key={ref.label}
            className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs text-foreground-muted"
          >
            {content}
          </span>
        );
      })}
    </div>
  );
}
