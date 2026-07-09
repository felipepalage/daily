"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { logoutAction } from "@/lib/actions/auth-actions";
import { TeamSwitcher } from "@/components/dashboard/team-switcher";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Visão geral", icon: "▦" },
  { href: "/dashboard/weekly", label: "Resumo semanal", icon: "▤" },
  { href: "/dashboard/settings", label: "Configurações", icon: "⚙" },
];

type Team = { id: string; name: string };

export function Sidebar({
  name,
  email,
  teams,
  activeTeamId,
}: {
  name: string;
  email: string;
  teams: Team[];
  activeTeamId: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-surface px-4 py-6">
      <div className="mb-4 flex items-center gap-2 px-2">
        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full shadow-sm shadow-primary/30">
          <Image src="/avatar.png" alt="Daily" width={36} height={36} className="h-full w-full object-cover" />
        </div>
        <span className="text-lg font-semibold text-foreground">Daily</span>
      </div>

      <TeamSwitcher teams={teams} activeTeamId={activeTeamId} />

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-foreground-muted hover:bg-surface-muted hover:text-foreground",
              )}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border pt-4">
        <div className="mb-3 px-2">
          <p className="truncate text-sm font-medium text-foreground">{name}</p>
          <p className="truncate text-xs text-foreground-muted">{email}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-foreground-muted transition-colors hover:bg-surface-muted hover:text-accent cursor-pointer"
          >
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
