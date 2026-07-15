"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function QuestionLabelsForm({
  initialLabels,
}: {
  initialLabels: { doing: string; blocked: string; improve: string };
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setPending(true);
    const formData = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/settings/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionDoingLabel: formData.get("questionDoingLabel"),
          questionBlockedLabel: formData.get("questionBlockedLabel"),
          questionImproveLabel: formData.get("questionImproveLabel"),
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Erro ao salvar perguntas.");
        return;
      }
      setSuccess(true);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      {error && (
        <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">{error}</p>
      )}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar perguntas"}
        </Button>
        {success && <span className="text-sm text-success">Salvo!</span>}
      </div>
    </form>
  );
}
