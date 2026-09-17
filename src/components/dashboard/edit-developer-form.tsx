"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

type Developer = {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  redmineUserId: string | null;
};

export function EditDeveloperForm({ developer }: { developer: Developer }) {
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
      const res = await fetch("/api/developers/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: developer.id,
          name: formData.get("name"),
          role: formData.get("role"),
          email: formData.get("email"),
          redmineUserId: formData.get("redmineUserId"),
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Erro ao atualizar desenvolvedor.");
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
      <Button type="button" variant="ghost" onClick={() => setOpen(true)}>
        Editar
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded-lg bg-surface-muted p-3">
      <div>
        <Label htmlFor={`name-${developer.id}`}>Nome</Label>
        <Input id={`name-${developer.id}`} name="name" defaultValue={developer.name} required />
      </div>
      <div>
        <Label htmlFor={`role-${developer.id}`}>Função</Label>
        <Input id={`role-${developer.id}`} name="role" defaultValue={developer.role ?? ""} />
      </div>
      <div>
        <Label htmlFor={`email-${developer.id}`}>E-mail</Label>
        <Input id={`email-${developer.id}`} name="email" type="email" defaultValue={developer.email ?? ""} />
      </div>
      <div>
        <Label htmlFor={`redmineUserId-${developer.id}`}>ID do usuário no Redmine</Label>
        <Input
          id={`redmineUserId-${developer.id}`}
          name="redmineUserId"
          defaultValue={developer.redmineUserId ?? ""}
          placeholder="Ex: 42"
        />
        <p className="mt-1 text-xs text-foreground-muted">
          Veja na URL do perfil dele no Redmine, ex: .../users/42.
        </p>
      </div>
      {error && <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
