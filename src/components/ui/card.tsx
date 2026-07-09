import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

export function Card(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={clsx(
        "rounded-2xl border border-border bg-surface shadow-sm shadow-black/[0.02]",
        props.className,
      )}
    />
  );
}
