"use client";

import { clsx } from "clsx";
import type { MouseEvent } from "react";
import { deleteDeveloperAction } from "@/lib/actions/developer-actions";

export function DeleteDeveloperButton({
  id,
  name,
  variant = "icon",
}: {
  id: string;
  name: string;
  variant?: "icon" | "text";
}) {
  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    const confirmed = window.confirm(
      `Remover "${name}"? Isso apaga também todo o histórico de check-ins dele. Não dá pra desfazer.`,
    );
    if (!confirmed) {
      e.preventDefault();
    }
  }

  return (
    <form
      action={deleteDeveloperAction.bind(null, id)}
      className={variant === "icon" ? "absolute right-3 top-3" : undefined}
    >
      <button
        type="submit"
        onClick={handleClick}
        aria-label="Remover desenvolvedor"
        className={clsx(
          "cursor-pointer transition-colors hover:text-accent",
          variant === "icon"
            ? "rounded-lg p-1.5 text-foreground-muted hover:bg-accent/10"
            : "text-sm font-medium text-foreground-muted",
        )}
      >
        {variant === "icon" ? "✕" : "Remover desenvolvedor"}
      </button>
    </form>
  );
}
