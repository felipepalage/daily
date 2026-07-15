import Image from "next/image";
import { apiFetch } from "@/lib/api";
import { todayDateOnlyUTC, formatFullDate } from "@/lib/date";
import { MyCheckinForm } from "@/components/checkin/my-checkin-form";
import { ChangePasswordForm } from "@/components/dashboard/change-password-form";
import { LogoutButton } from "@/components/auth/logout-button";

export const runtime = "edge";

type MeDto = {
  id: string;
  name: string;
  role: string | null;
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
  date: string;
  doing: string;
  blocked: string;
  improve: string;
  mood: string | null;
  featureNumber: string | null;
  blockerNumber: string | null;
  epicNumber: string | null;
  taskNumber: string | null;
};

export default async function MyCheckinPage() {
  const me = await apiFetch<MeDto>("/me");

  const today = todayDateOnlyUTC();
  const todayStr = today.toISOString().split("T")[0];

  let todayEntry: EntryDto | null = null;
  try {
    todayEntry = await apiFetch<EntryDto>(`/me/entry?date=${todayStr}`);
  } catch {
    todayEntry = null;
  }

  const questionLabels = {
    doing: me.team.scrumMaster.questionDoingLabel,
    blocked: me.team.scrumMaster.questionBlockedLabel,
    improve: me.team.scrumMaster.questionImproveLabel,
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_var(--surface-muted),_var(--background))] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 h-16 w-16 overflow-hidden rounded-full shadow-lg shadow-primary/30">
            <Image src="/avatar.png" alt="Daily" width={64} height={64} className="h-full w-full object-cover" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Oi, {me.name.split(" ")[0]}!</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Check-in de hoje · {formatFullDate(today)}
          </p>
          <p className="mt-0.5 text-xs text-foreground-muted/70">{me.team.name}</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xl shadow-black/[0.03]">
          <MyCheckinForm
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

        <details className="mt-4 rounded-2xl border border-border bg-surface p-4">
          <summary className="cursor-pointer text-sm font-medium text-foreground-muted hover:text-foreground">
            Trocar minha senha
          </summary>
          <div className="mt-4">
            <ChangePasswordForm endpoint="/api/me/password" />
          </div>
        </details>

        <div className="mt-6 text-center">
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
