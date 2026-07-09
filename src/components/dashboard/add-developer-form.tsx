"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createDeveloperAction } from "@/lib/actions/developer-actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export function AddDeveloperForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createDeveloperAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      formRef.current?.reset();
      setOpen(false);
    }
    wasPending.current = pending;
  }, [pending, state]);

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        + Adicionar desenvolvedor
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-md p-5">
      <form ref={formRef} action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" placeholder="Ex: Ana Souza" required autoFocus />
        </div>
        <div>
          <Label htmlFor="role">Função (opcional)</Label>
          <Input id="role" name="role" placeholder="Ex: Backend, Frontend, QA" />
        </div>
        {state?.error && (
          <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">{state.error}</p>
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
