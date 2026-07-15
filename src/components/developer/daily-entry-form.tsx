"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { IssueNumberFields } from "@/components/developer/issue-number-fields";
import type { IssueNumbers } from "@/lib/redmine";

const MOODS = [
  { value: "otimo", emoji: "😄", label: "Ótimo" },
  { value: "bem", emoji: "🙂", label: "Bem" },
  { value: "neutro", emoji: "😐", label: "Neutro" },
  { value: "dificil", emoji: "😕", label: "Difícil" },
  { value: "pessimo", emoji: "😣", label: "Péssimo" },
];

export type QuestionLabels = {
  doing: string;
  blocked: string;
  improve: string;
};

export function DailyEntryForm({
  developerId,
  dateValue,
  dateLabel,
  title = "Check-in de hoje",
  questionLabels,
  defaultValues,
  onSuccess,
}: {
  developerId: string;
  dateValue: string;
  dateLabel: string;
  title?: string;
  questionLabels: QuestionLabels;
  defaultValues: { doing: string; blocked: string; improve: string; mood: string } & IssueNumbers;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [mood, setMood] = useState(defaultValues.mood);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const formData = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          developerId,
          date: dateValue,
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
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onSuccess?.();
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <span className="text-sm text-foreground-muted">{dateLabel}</span>
      </div>

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
          <Label htmlFor={`doing-${dateValue}`}>{questionLabels.doing}</Label>
          <Textarea
            id={`doing-${dateValue}`}
            name="doing"
            rows={5}
            required
            defaultValue={defaultValues.doing}
            placeholder="Ex: Finalizando a integração com o serviço de pagamentos"
          />
        </div>

        <div>
          <Label htmlFor={`blocked-${dateValue}`}>{questionLabels.blocked}</Label>
          <Textarea
            id={`blocked-${dateValue}`}
            name="blocked"
            rows={5}
            defaultValue={defaultValues.blocked}
            placeholder="Ex: Aguardando acesso ao ambiente de homologação"
          />
        </div>

        <div>
          <Label htmlFor={`improve-${dateValue}`}>{questionLabels.improve}</Label>
          <Textarea
            id={`improve-${dateValue}`}
            name="improve"
            rows={5}
            defaultValue={defaultValues.improve}
            placeholder="Ex: Melhorar a comunicação sobre dependências entre tarefas"
          />
        </div>

        <IssueNumberFields defaultValues={defaultValues} />

        {error && (
          <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">{error}</p>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar check-in"}
          </Button>
          {saved && <span className="text-sm text-success">Check-in salvo!</span>}
        </div>
      </form>
    </Card>
  );
}
