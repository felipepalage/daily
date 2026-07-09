"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { updateScrumNoteAction } from "@/lib/actions/entry-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

export function ScrumNote({ entryId, initialNote }: { entryId: string; initialNote: string }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateScrumNoteAction, null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      setEditing(false);
    }
    wasPending.current = pending;
  }, [pending, state]);

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
    <form action={formAction} className="mt-3 space-y-2">
      <input type="hidden" name="entryId" value={entryId} />
      <Textarea
        name="scrumNote"
        rows={2}
        defaultValue={initialNote}
        placeholder="Ex: Combinei de destravar o acesso até amanhã"
        autoFocus
      />
      {state?.error && <p className="text-xs text-accent">{state.error}</p>}
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
