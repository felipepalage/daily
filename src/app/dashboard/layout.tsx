import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getActiveTeam } from "@/lib/team";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const { teams, activeTeam } = await getActiveTeam();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar name={session.name} email={session.email} teams={teams} activeTeamId={activeTeam?.id ?? ""} />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8 md:px-10">{children}</div>
      </div>
    </div>
  );
}