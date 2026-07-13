// Campos de referência do Redmine que um check-in pode ter.
export const ISSUE_FIELDS = [
  { name: "featureNumber", label: "Feature" },
  { name: "blockerNumber", label: "Blocker" },
  { name: "epicNumber", label: "Epic" },
  { name: "taskNumber", label: "Task" },
] as const;

export type IssueFieldName = (typeof ISSUE_FIELDS)[number]["name"];

export type IssueNumbers = {
  featureNumber?: string | null;
  blockerNumber?: string | null;
  epicNumber?: string | null;
  taskNumber?: string | null;
};

// Monta o link para a issue no Redmine. Redmine expõe features, epics e tasks
// todos como "issues" (com trackers diferentes), então o caminho é sempre o mesmo.
export function redmineIssueUrl(baseUrl: string | null | undefined, number: string): string | null {
  if (!baseUrl) return null;
  const trimmed = baseUrl.replace(/\/+$/, "");
  const digits = number.replace(/[^0-9]/g, "");
  if (!digits) return null;
  return `${trimmed}/issues/${digits}`;
}

export type IssueRef = { label: string; value: string; url: string | null };

// Retorna só os campos preenchidos, na ordem canônica, com o link (se houver URL).
export function listIssueRefs(entry: IssueNumbers, baseUrl: string | null | undefined): IssueRef[] {
  const refs: IssueRef[] = [];
  for (const field of ISSUE_FIELDS) {
    const value = entry[field.name];
    if (!value) continue;
    refs.push({ label: field.label, value, url: redmineIssueUrl(baseUrl, value) });
  }
  return refs;
}
