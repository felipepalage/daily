"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createTeamAction, switchTeamAction } from "@/lib/actions/team-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Team = { id: string; name: string };

export function TeamSwitcher({
  teams,
  activeTeamId,
}: {
  teams: Team[];
  activeTeamId: string;
}) {
  const [creating, setCreating] = useState(false);
  const [state, formAction, pending] = useActionState(createTeamAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      formRef.current?.reset();
      setCreating(false);
    }
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <div className="mb-4 px-2">
      {teams.length > 1 && (
        <form action={switchTeamAction}>
          <select
            name="teamId"
            defaultValue={activeTeamId}
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
            className="mb-2 w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </form>
      )}

      {!creating ? (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="text-xs font-medium text-foreground-muted hover:text-primary cursor-pointer"
        >
          + Novo time
        </button>
      ) : (
        <form ref={formRef} action={formAction} className="space-y-2">
          <Input
            name="name"
            placeholder="Nome do time"
            autoFocus
            required
            className="text-sm"
          />
          {state?.error && <p className="text-xs text-accent">{state.error}</p>}
          <div className="flex gap-1.5">
            <Button type="submit" disabled={pending} className="px-2.5 py-1 text-xs">
              {pending ? "Criando..." : "Criar"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="px-2.5 py-1 text-xs"
              onClick={() => setCreating(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
