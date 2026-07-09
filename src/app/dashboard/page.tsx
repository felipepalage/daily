import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todayDateOnlyUTC, formatFullDate } from "@/lib/date";
import { AddDeveloperForm } from "@/components/dashboard/add-developer-form";
import { DeveloperCard } from "@/components/dashboard/developer-card";

export default async function DashboardPage() {
  const session = await requireSession();
  const today = todayDateOnlyUTC();

  const developers = await prisma.developer.findMany({
    where: { scrumMasterId: session.scrumMasterId },
    orderBy: { createdAt: "asc" },
    include: {
      entries: {
        where: { date: today },
        select: { id: true },
      },
    },
  });

  return (
    <div>
      <header className="mb-8">
        <p className="text-sm text-foreground-muted">{formatFullDate(new Date())}</p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">
          Olá, {session.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Acompanhe o check-in diário do seu time.
        </p>
      </header>

      <div className="mb-6">
        <AddDeveloperForm />
      </div>

      {developers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-foreground-muted">
            Nenhum desenvolvedor cadastrado ainda. Adicione o primeiro do seu time para começar
            os check-ins diários.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {developers.map((developer) => (
            <DeveloperCard
              key={developer.id}
              id={developer.id}
              name={developer.name}
              role={developer.role}
              checkedInToday={developer.entries.length > 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
