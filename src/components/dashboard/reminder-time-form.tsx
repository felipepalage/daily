"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

// O backend guarda o horário em UTC ("HH:mm"); aqui convertemos pra/do
// horário local do navegador do gestor, que é quem configura o lembrete.
function utcToLocalInputValue(utcTime: string | null): string {
  if (!utcTime) return "";
  const [h, m] = utcTime.split(":").map(Number);
  const d = new Date();
  d.setUTCHours(h, m, 0, 0);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function localInputValueToUtc(localTime: string): string {
  const [h, m] = localTime.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

export function ReminderTimeForm({
  teamId,
  initialReminderTimeUtc,
}: {
  teamId: string;
  initialReminderTimeUtc: string | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [enabled, setEnabled] = useState(Boolean(initialReminderTimeUtc));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setPending(true);
    const formData = new FormData(event.currentTarget);
    const localTime = String(formData.get("reminderTime") ?? "");

    try {
      const res = await fetch("/api/teams/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          reminderTimeUtc: enabled && localTime ? localInputValueToUtc(localTime) : null,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Erro ao salvar o lembrete.");
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
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 rounded border-border"
        />
        Enviar lembrete diário por e-mail pros devs sem check-in
      </label>

      {enabled && (
        <div>
          <Label htmlFor="reminderTime">Horário (seu fuso local)</Label>
          <Input
            id="reminderTime"
            name="reminderTime"
            type="time"
            defaultValue={utcToLocalInputValue(initialReminderTimeUtc)}
            required
          />
          <p className="mt-1 text-xs text-foreground-muted">
            Todo dia nesse horário, quem ainda não fez o check-in recebe um e-mail — e você recebe um resumo de quem falta.
          </p>
        </div>
      )}

      {error && <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">{error}</p>}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar lembrete"}
        </Button>
        {success && <span className="text-sm text-success">Salvo!</span>}
      </div>
    </form>
  );
}
