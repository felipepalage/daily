import { clsx } from "clsx";
import type { InputHTMLAttributes, LabelHTMLAttributes, Ref, TextareaHTMLAttributes } from "react";

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className={clsx(
        "text-sm font-medium text-foreground-muted mb-1.5 block",
        props.className,
      )}
    />
  );
}

export function Input({
  ref,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> }) {
  return (
    <input
      ref={ref}
      {...props}
      className={clsx(
        "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted/60 outline-none transition-shadow focus:ring-2 focus:ring-primary/40 focus:border-primary",
        props.className,
      )}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={clsx(
        "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted/60 outline-none transition-shadow focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none",
        props.className,
      )}
    />
  );
}
