import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todayDateOnlyUTC, dateToInputValue, formatFullDate } from "@/lib/date";
import { DailyEntryForm } from "@/components/developer/daily-entry-form";
import { EntryHistory } from "@/components/developer/entry-history";

export default async function DeveloperPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();

  const developer = await prisma.developer.findFirst({
    where: { id, scrumMasterId: session.scrumMasterId },
    include: {
      entries: { orderBy: { date: "desc" } },
    },
  });

  if (!developer) {
    notFound();
  }

  const today = todayDateOnlyUTC();
  const todayEntry = developer.entries.find((entry) => entry.date.getTime() === today.getTime());
  const pastEntries = developer.entries.filter((entry) => entry.date.getTime() !== today.getTime());

  return (
    <div>
      <Link href="/dashboard" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground-muted hover:text-foreground">
        ← Voltar
      </Link>

      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">{developer.name}</h1>
        {developer.role && <p className="mt-1 text-sm text-foreground-muted">{developer.role}</p>}
      </header>

      <div className="mb-10">
        <DailyEntryForm
          developerId={developer.id}
          dateValue={dateToInputValue(today)}
          dateLabel={formatFullDate(today)}
          defaultValues={{
            doing: todayEntry?.doing ?? "",
            blocked: todayEntry?.blocked ?? "",
            improve: todayEntry?.improve ?? "",
          }}
        />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Histórico</h2>
        <EntryHistory entries={pastEntries} />
      </section>
    </div>
  );
}
