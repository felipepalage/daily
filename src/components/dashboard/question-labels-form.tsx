"use client";

import { useActionState } from "react";
import { updateQuestionLabelsAction } from "@/lib/actions/settings-actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function QuestionLabelsForm({
  initialLabels,
}: {
  initialLabels: { doing: string; blocked: string; improve: string };
}) {
  const [state, formAction, pending] = useActionState(updateQuestionLabelsAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="questionDoingLabel">Pergunta 1</Label>
        <Input
          id="questionDoingLabel"
          name="questionDoingLabel"
          defaultValue={initialLabels.doing}
          required
        />
      </div>
      <div>
        <Label htmlFor="questionBlockedLabel">Pergunta 2</Label>
        <Input
          id="questionBlockedLabel"
          name="questionBlockedLabel"
          defaultValue={initialLabels.blocked}
          required
        />
      </div>
      <div>
        <Label htmlFor="questionImproveLabel">Pergunta 3</Label>
        <Input
          id="questionImproveLabel"
          name="questionImproveLabel"
          defaultValue={initialLabels.improve}
          required
        />
      </div>
      {state?.error && (
        <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">{state.error}</p>
      )}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar perguntas"}
        </Button>
        {state?.success && <span className="text-sm text-success">Salvo!</span>}
      </div>
    </form>
  );
}
