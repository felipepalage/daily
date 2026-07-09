"use client";

import { useActionState, useState } from "react";
import { clsx } from "clsx";
import { upsertPublicCheckinAction } from "@/lib/actions/public-checkin-actions";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";

const MOODS = [
  { value: "otimo", emoji: "😄", label: "Ótimo" },
  { value: "bem", emoji: "🙂", label: "Bem" },
  { value: "neutro", emoji: "😐", label: "Neutro" },
  { value: "dificil", emoji: "😕", label: "Difícil" },
  { value: "pessimo", emoji: "😣", label: "Péssimo" },
];

export function PublicCheckinForm({
  token,
  questionLabels,
  defaultValues,
}: {
  token: string;
  questionLabels: { doing: string; blocked: string; improve: string };
  defaultValues: { doing: string; blocked: string; improve: string; mood: string };
}) {
  const [state, formAction, pending] = useActionState(upsertPublicCheckinAction, null);
  const [mood, setMood] = useState(defaultValues.mood);

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/10 p-5 text-center">
        <p className="font-medium text-success">Check-in salvo! Até amanhã. 👋</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="mood" value={mood} />

      <div>
        <Label>Como está o humor hoje?</Label>
        <div className="flex gap-2">
          {MOODS.map((option) => (
            <button
              key={option.value}
              type="button"
              title={option.label}
              onClick={() => setMood(mood === option.value ? "" : option.value)}
              className={clsx(
                "flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition-colors cursor-pointer",
                mood === option.value
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-surface-muted",
              )}
            >
              {option.emoji}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="doing">{questionLabels.doing}</Label>
        <Textarea id="doing" name="doing" rows={5} required defaultValue={defaultValues.doing} />
      </div>

      <div>
        <Label htmlFor="blocked">{questionLabels.blocked}</Label>
        <Textarea id="blocked" name="blocked" rows={5} defaultValue={defaultValues.blocked} />
      </div>

      <div>
        <Label htmlFor="improve">{questionLabels.improve}</Label>
        <Textarea id="improve" name="improve" rows={5} defaultValue={defaultValues.improve} />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">{state.error}</p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Salvando..." : "Salvar check-in"}
      </Button>
    </form>
  );
}
