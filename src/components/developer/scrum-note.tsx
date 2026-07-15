"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

export function ScrumNote({ entryId, initialNote }: { entryId: string; initialNote: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const scrumNote = String(new FormData(event.currentTarget).get("scrumNote") ?? "");
    try {
      const res = await fetch("/api/entries/scrum-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId, scrumNote }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Erro ao salvar nota do scrum.");
        return;
      }
      setEditing(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (!editing) {
    return initialNote ? (
      <div className="mt-3 rounded-lg bg-surface-muted p-3">
        <p className="text-xs font-medium text-foreground-muted">Nota do scrum master</p>
        <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{initialNote}</p>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-1.5 text-xs font-medium text-primary hover:underline cursor-pointer"
        >
          Editar nota
        </button>
      </div>
    ) : (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="mt-3 text-xs font-medium text-primary hover:underline cursor-pointer"
      >
        + Adicionar nota
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <Textarea
        name="scrumNote"
        rows={2}
        defaultValue={initialNote}
        placeholder="Ex: Combinei de destravar o acesso até amanhã"
        autoFocus
      />
      {error && <p className="text-xs text-accent">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending} className="px-3 py-1.5 text-xs">
          {pending ? "Salvando..." : "Salvar nota"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="px-3 py-1.5 text-xs"
          onClick={() => setEditing(false)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
