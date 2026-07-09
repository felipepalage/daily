import Image from "next/image";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_var(--surface-muted),_var(--background))] px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 h-16 w-16 overflow-hidden rounded-full shadow-lg shadow-primary/30">
            <Image src="/avatar.png" alt="Daily" width={64} height={64} className="h-full w-full object-cover" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-foreground-muted">{subtitle}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xl shadow-black/[0.03]">
          {children}
        </div>
        <div className="mt-6 text-center text-sm text-foreground-muted">{footer}</div>
      </div>
    </main>
  );
}
