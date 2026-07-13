import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { todayDateOnlyUTC, dateToInputValue, formatFullDate } from "@/lib/date";
import { DailyEntryForm } from "@/components/developer/daily-entry-form";
import { EntryHistory } from "@/components/developer/entry-history";
import { CopyCheckinLink } from "@/components/developer/copy-checkin-link";
import { DeleteDeveloperButton } from "@/components/dashboard/delete-developer-button";

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

type DeveloperDto = {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  teamId: string;
  publicToken: string | null;
  createdAt: string;
};

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

export default async function DeveloperPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();

  // Busca developer + scrum master data via API
  let developer: DeveloperDto | null = null;
  let scrumMaster: ScrumMasterDto | null = null;
  let entries: EntryDto[] = [];

  try {
    developer = await apiFetch<DeveloperDto>(`/developers/${id}`);
  } catch {
    notFound();
  }

  try {
    scrumMaster = await apiFetch<ScrumMasterDto>("/auth/me");
  } catch {
    notFound();
  }

  try {
    entries = await apiFetch<EntryDto[]>(`/developers/${id}/entries`);
  } catch {
    entries = [];
  }

  // A API retorna entries ordenadas por data descendente
  const questionLabels = {
    doing: scrumMaster.questionDoingLabel,
    blocked: scrumMaster.questionBlockedLabel,
    improve: scrumMaster.questionImproveLabel,
  };

  const today = todayDateOnlyUTC();
  const todayEntry = entries.find((entry) => new Date(entry.date).getTime() === today.getTime());
  const pastEntries = entries.filter((entry) => new Date(entry.date).getTime() !== today.getTime());

  return (
    <div>
      <Link href="/dashboard" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground-muted hover:text-foreground">
        ← Voltar
      </Link>

      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{developer.name}</h1>
          {developer.role && <p className="mt-1 text-sm text-foreground-muted">{developer.role}</p>}
        </div>
        <DeleteDeveloperButton id={developer.id} name={developer.name} variant="text" />
      </header>

      <div className="mb-8">
        <CopyCheckinLink token={developer.publicToken ?? ""} />
      </div>

      <div className="mb-10">
        <DailyEntryForm
          developerId={developer.id}
          dateValue={dateToInputValue(today)}
          dateLabel={formatFullDate(today)}
          questionLabels={questionLabels}
          defaultValues={{
            doing: todayEntry?.doing ?? "",
            blocked: todayEntry?.blocked ?? "",
            improve: todayEntry?.improve ?? "",
            mood: todayEntry?.mood ?? "",
            featureNumber: todayEntry?.featureNumber,
            blockerNumber: todayEntry?.blockerNumber,
            epicNumber: todayEntry?.epicNumber,
            taskNumber: todayEntry?.taskNumber,
          }}
        />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Histórico</h2>
        <EntryHistory
          entries={pastEntries.map((e) => ({
            ...e,
            date: new Date(e.date),
          }))}
          developerId={developer.id}
          questionLabels={questionLabels}
          redmineUrl={scrumMaster.redmineUrl}
        />
      </section>
    </div>
  );
}