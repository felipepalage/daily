"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export function AddDeveloperForm({ teamId }: { teamId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const formData = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/developers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          name: formData.get("name"),
          role: formData.get("role"),
          email: formData.get("email"),
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Erro ao criar desenvolvedor.");
        return;
      }
      setOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        + Adicionar desenvolvedor
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-md p-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" placeholder="Ex: Ana Souza" required autoFocus />
        </div>
        <div>
          <Label htmlFor="role">Função (opcional)</Label>
          <Input id="role" name="role" placeholder="Ex: Backend, Frontend, QA" />
        </div>
        <div>
          <Label htmlFor="email">E-mail do dev (opcional)</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Para receber o link e lembretes por e-mail"
          />
        </div>
        {error && (
          <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">{error}</p>
        )}
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Adicionando..." : "Adicionar"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}
