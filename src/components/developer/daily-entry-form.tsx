"use client";

import { useActionState, useEffect, useState } from "react";
import { upsertDailyEntryAction } from "@/lib/actions/entry-actions";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export function DailyEntryForm({
  developerId,
  dateValue,
  dateLabel,
  defaultValues,
}: {
  developerId: string;
  dateValue: string;
  dateLabel: string;
  defaultValues: { doing: string; blocked: string; improve: string };
}) {
  const [state, formAction, pending] = useActionState(upsertDailyEntryAction, null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (state?.success) {
      setSavedAt(Date.now());
      const timeout = setTimeout(() => setSavedAt(null), 3000);
      return () => clearTimeout(timeout);
    }
  }, [state]);

  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Check-in de hoje</h2>
        <span className="text-sm text-foreground-muted">{dateLabel}</span>
      </div>

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="developerId" value={developerId} />
        <input type="hidden" name="date" value={dateValue} />

        <div>
          <Label htmlFor="doing">O que está fazendo?</Label>
          <Textarea
            id="doing"
            name="doing"
            rows={3}
            required
            defaultValue={defaultValues.doing}
            placeholder="Ex: Finalizando a integração com o serviço de pagamentos"
          />
        </div>

        <div>
          <Label htmlFor="blocked">O que está travado?</Label>
          <Textarea
            id="blocked"
            name="blocked"
            rows={3}
            defaultValue={defaultValues.blocked}
            placeholder="Ex: Aguardando acesso ao ambiente de homologação"
          />
        </div>

        <div>
          <Label htmlFor="improve">O que pode melhorar?</Label>
          <Textarea
            id="improve"
            name="improve"
            rows={3}
            defaultValue={defaultValues.improve}
            placeholder="Ex: Melhorar a comunicação sobre dependências entre tarefas"
          />
        </div>

        {state?.error && (
          <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">{state.error}</p>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar check-in"}
          </Button>
          {savedAt && <span className="text-sm text-success">Check-in salvo!</span>}
        </div>
      </form>
    </Card>
  );
}
