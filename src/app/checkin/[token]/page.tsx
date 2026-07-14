import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { todayDateOnlyUTC, formatFullDate } from "@/lib/date";
import { AuthShell } from "@/components/auth/auth-shell";
import { PublicCheckinForm } from "@/components/checkin/public-checkin-form";

export const runtime = "edge";

type DeveloperWithTeamDto = {
  id: string;
  name: string;
  role: string | null;
  publicToken: string | null;
  team: {
    id: string;
    name: string;
    scrumMaster: {
      questionDoingLabel: string;
      questionBlockedLabel: string;
      questionImproveLabel: string;
    };
  };
};

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

export default async function PublicCheckinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Busca dados do desenvolvedor via API pública
  let developer: DeveloperWithTeamDto | null = null;
  let todayEntry: EntryDto | null = null;

  try {
    developer = await apiFetch<DeveloperWithTeamDto>(`/public/developer/${token}`, {
      anonymous: true,
    });
  } catch {
    notFound();
  }

  const today = todayDateOnlyUTC();
  const todayStr = today.toISOString().split("T")[0];

  try {
    todayEntry = await apiFetch<EntryDto>(`/public/entry/${token}?date=${todayStr}`, {
      anonymous: true,
    });
  } catch {
    todayEntry = null;
  }

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
          featureNumber: todayEntry?.featureNumber,
          blockerNumber: todayEntry?.blockerNumber,
          epicNumber: todayEntry?.epicNumber,
          taskNumber: todayEntry?.taskNumber,
        }}
      />
    </AuthShell>
  );
}