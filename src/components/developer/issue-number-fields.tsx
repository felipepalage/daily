"use client";

import { ISSUE_FIELDS, type IssueNumbers } from "@/lib/redmine";
import { Input, Label } from "@/components/ui/input";

// Campos opcionais para vincular o check-in a itens do Redmine (por número).
export function IssueNumberFields({ defaultValues }: { defaultValues?: IssueNumbers }) {
  return (
    <div>
      <Label>Itens do Redmine (opcional)</Label>
      <div className="grid grid-cols-2 gap-3">
        {ISSUE_FIELDS.map((field) => (
          <div key={field.name}>
            <Input
              name={field.name}
              inputMode="numeric"
              placeholder={`${field.label} nº`}
              defaultValue={defaultValues?.[field.name] ?? ""}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
