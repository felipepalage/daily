import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { todayDateOnlyUTC, formatFullDate } from "@/lib/date";
import { AuthShell } from "@/components/auth/auth-shell";
import { PublicCheckinForm } from "@/components/checkin/public-checkin-form";

export default async function PublicCheckinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const developer = await prisma.developer.findUnique({
    where: { publicToken: token },
    include: { team: { include: { scrumMaster: true } } },
  });

  if (!developer) {
    notFound();
  }

  const today = todayDateOnlyUTC();
  const todayEntry = await prisma.dailyEntry.findUnique({
    where: { developerId_date: { developerId: developer.id, date: today } },
  });

  const questionLabels = {
    doing: developer.team.scrumMaster.questionDoingLabel,
    blocked: developer.team.scrumMaster.questionBlockedLabel,
    improve: developer.team.scrumMaster.questionImproveLabel,
  };

  return (
    <AuthShell
      title={`Oi, ${developer.name.split(" ")[0]}!`}
      subtitle={`Check-in de hoje · ${formatFullDate(today)}`}
      footer={<span className="text-foreground-muted/70">{developer.team.name}</span>}
    >
      <PublicCheckinForm
        token={token}
        questionLabels={questionLabels}
        defaultValues={{
          doing: todayEntry?.doing ?? "",
          blocked: todayEntry?.blocked ?? "",
          improve: todayEntry?.improve ?? "",
          mood: todayEntry?.mood ?? "",
        }}
      />
    </AuthShell>
  );
}
