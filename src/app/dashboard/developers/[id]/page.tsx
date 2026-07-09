import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todayDateOnlyUTC, dateToInputValue, formatFullDate } from "@/lib/date";
import { DailyEntryForm } from "@/components/developer/daily-entry-form";
import { EntryHistory } from "@/components/developer/entry-history";
import { CopyCheckinLink } from "@/components/developer/copy-checkin-link";

export default async function DeveloperPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();

  const [developer, scrumMaster] = await Promise.all([
    prisma.developer.findFirst({
      where: { id, team: { scrumMasterId: session.scrumMasterId } },
      include: {
        entries: { orderBy: { date: "desc" } },
      },
    }),
    prisma.scrumMaster.findUnique({ where: { id: session.scrumMasterId } }),
  ]);

  if (!developer || !scrumMaster) {
    notFound();
  }

  const questionLabels = {
    doing: scrumMaster.questionDoingLabel,
    blocked: scrumMaster.questionBlockedLabel,
    improve: scrumMaster.questionImproveLabel,
  };

  const today = todayDateOnlyUTC();
  const todayEntry = developer.entries.find((entry) => entry.date.getTime() === today.getTime());
  const pastEntries = developer.entries.filter((entry) => entry.date.getTime() !== today.getTime());

  return (
    <div>
      <Link href="/dashboard" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground-muted hover:text-foreground">
        ← Voltar
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">{developer.name}</h1>
        {developer.role && <p className="mt-1 text-sm text-foreground-muted">{developer.role}</p>}
      </header>

      <div className="mb-8">
        <CopyCheckinLink token={developer.publicToken} />
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
          }}
        />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Histórico</h2>
        <EntryHistory
          entries={pastEntries}
          developerId={developer.id}
          questionLabels={questionLabels}
        />
      </section>
    </div>
  );
}
