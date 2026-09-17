export type RedmineIssue = {
  number: string;
  subject: string;
  tracker: string;
  status: string;
  url: string | null;
};

// Issues atualmente abertas atribuídas ao dev no Redmine — busca ao vivo,
// não fica preso ao que ele digitou no check-in do dia.
export function RedmineIssuesWidget({ issues }: { issues: RedmineIssue[] }) {
  if (issues.length === 0) return null;

  return (
    <div className="mb-8 rounded-xl border border-border p-4">
      <h2 className="mb-2 text-sm font-semibold text-foreground">Issues abertas no Redmine</h2>
      <ul className="space-y-1.5">
        {issues.map((issue) => (
          <li key={issue.number} className="flex items-center gap-2 text-sm">
            {issue.url ? (
              <a
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                #{issue.number}
              </a>
            ) : (
              <span className="font-medium text-foreground">#{issue.number}</span>
            )}
            <span className="text-foreground">{issue.subject}</span>
            <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-foreground-muted">
              {issue.tracker}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
