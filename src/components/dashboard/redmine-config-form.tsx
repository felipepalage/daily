"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function RedmineConfigForm({
  initial,
}: {
  initial: { redmineUrl: string; redmineApiKey: string };
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
      const res = await fetch("/api/settings/redmine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redmineUrl: formData.get("redmineUrl"),
          redmineApiKey: formData.get("redmineApiKey"),
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Erro ao salvar configuração do Redmine.");
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
        <Label htmlFor="redmineUrl">URL do Redmine</Label>
        <Input
          id="redmineUrl"
          name="redmineUrl"
          type="url"
          placeholder="Ex: https://redmine.suaempresa.com"
          defaultValue={initial.redmineUrl}
        />
        <p className="mt-1 text-xs text-foreground-muted">
          Usada para transformar os números de Feature/Blocker/Epic/Task do check-in em links.
        </p>
      </div>
      <div>
        <Label htmlFor="redmineApiKey">Chave de API (opcional)</Label>
        <Input
          id="redmineApiKey"
          name="redmineApiKey"
          type="password"
          placeholder="Sua API key do Redmine"
          defaultValue={initial.redmineApiKey}
        />
      </div>
      {error && (
        <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">{error}</p>
      )}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar integração"}
        </Button>
        {success && <span className="text-sm text-success">Salvo!</span>}
      </div>
    </form>
  );
}
