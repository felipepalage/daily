"use client";

import { useActionState } from "react";
import { sendWeeklySummaryToSlackAction } from "@/lib/actions/slack-actions";
import { Button } from "@/components/ui/button";

export function SendToSlackButton({ teamId, weekValue }: { teamId: string; weekValue: string }) {
  const [state, formAction, pending] = useActionState(sendWeeklySummaryToSlackAction, null);

  return (
    <form action={formAction} className="inline-flex items-center gap-2">
      <input type="hidden" name="teamId" value={teamId} />
      <input type="hidden" name="week" value={weekValue} />
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Enviando..." : "Enviar pro Slack"}
      </Button>
      {state?.error && <span className="text-xs text-accent">{state.error}</span>}
      {state?.success && <span className="text-xs text-success">Enviado!</span>}
    </form>
  );
}
