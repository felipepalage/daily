"use client";

import { FormEvent, useState } from "react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";
import { IssueNumberFields } from "@/components/developer/issue-number-fields";
import type { IssueNumbers } from "@/lib/redmine";

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
  defaultValues: { doing: string; blocked: string; improve: string; mood: string } & IssueNumbers;
}) {
  const [mood, setMood] = useState(defaultValues.mood);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);

    try {
      const res = await fetch("/api/public/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          mood,
          doing: formData.get("doing"),
          blocked: formData.get("blocked"),
          improve: formData.get("improve"),
          featureNumber: formData.get("featureNumber"),
          blockerNumber: formData.get("blockerNumber"),
          epicNumber: formData.get("epicNumber"),
          taskNumber: formData.get("taskNumber"),
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Erro ao salvar check-in.");
        return;
      }

      setSuccess(true);
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/10 p-5 text-center">
        <p className="font-medium text-success">Check-in salvo! Até amanhã. 👋</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

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

      <IssueNumberFields defaultValues={defaultValues} />

      {error && (
        <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Salvando..." : "Salvar check-in"}
      </Button>
    </form>
  );
}
