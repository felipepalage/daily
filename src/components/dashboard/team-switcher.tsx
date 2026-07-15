"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeTeam = teams.find((team) => team.id === activeTeamId);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const name = String(new FormData(event.currentTarget).get("name") ?? "");
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Erro ao criar time.");
        return;
      }
      setCreating(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleSwitch(teamId: string) {
    await fetch("/api/teams/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId }),
    });
    router.refresh();
  }

  async function handleDeleteTeam() {
    const confirmed = window.confirm(
      `Excluir o time "${activeTeam?.name}"? Isso apaga também todos os desenvolvedores e o histórico de check-ins desse time. Não dá pra desfazer.`,
    );
    if (!confirmed) return;
    await fetch("/api/teams/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId: activeTeamId }),
    });
    router.refresh();
  }

  return (
    <div className="mb-4 px-2">
      {teams.length > 1 && (
        <select
          key={activeTeamId}
          defaultValue={activeTeamId}
          onChange={(e) => handleSwitch(e.currentTarget.value)}
          className="mb-2 w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
        >
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      )}

      {!creating ? (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="text-xs font-medium text-foreground-muted hover:text-primary cursor-pointer"
          >
            + Novo time
          </button>
          <button
            type="button"
            onClick={handleDeleteTeam}
            className="text-xs font-medium text-foreground-muted hover:text-accent cursor-pointer"
          >
            Excluir time atual
          </button>
        </div>
      ) : (
        <form onSubmit={handleCreate} className="space-y-2">
          <Input
            name="name"
            placeholder="Nome do time"
            autoFocus
            required
            className="text-sm"
          />
          {error && <p className="text-xs text-accent">{error}</p>}
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
