"use client";

import { clsx } from "clsx";
import { useRouter } from "next/navigation";

export function DeleteDeveloperButton({
  id,
  name,
  variant = "icon",
}: {
  id: string;
  name: string;
  variant?: "icon" | "text";
}) {
  const router = useRouter();

  async function handleClick() {
    const confirmed = window.confirm(
      `Remover "${name}"? Isso apaga também todo o histórico de check-ins dele. Não dá pra desfazer.`,
    );
    if (!confirmed) return;

    await fetch("/api/developers/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ developerId: id }),
    });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className={variant === "icon" ? "absolute right-3 top-3" : undefined}>
      <button
        type="button"
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
    </div>
  );
}
