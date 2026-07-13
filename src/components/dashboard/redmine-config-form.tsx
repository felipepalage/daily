"use client";

import { useActionState } from "react";
import { updateRedmineConfigAction } from "@/lib/actions/settings-actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function RedmineConfigForm({
  initial,
}: {
  initial: { redmineUrl: string; redmineApiKey: string };
}) {
  const [state, formAction, pending] = useActionState(updateRedmineConfigAction, null);

  return (
    <form action={formAction} className="space-y-4">
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
      {state?.error && (
        <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">{state.error}</p>
      )}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar integração"}
        </Button>
        {state?.success && <span className="text-sm text-success">Salvo!</span>}
      </div>
    </form>
  );
}
