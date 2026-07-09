import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const ACTIVE_TEAM_COOKIE = "daily_active_team";

export const getActiveTeam = cache(async (scrumMasterId: string) => {
  let teams = await prisma.team.findMany({
    where: { scrumMasterId },
    orderBy: { createdAt: "asc" },
  });

  if (teams.length === 0) {
    const defaultTeam = await prisma.team.create({
      data: { name: "Time principal", scrumMasterId },
    });
    teams = [defaultTeam];
  }

  const cookieStore = await cookies();
  const activeTeamId = cookieStore.get(ACTIVE_TEAM_COOKIE)?.value;
  const activeTeam = teams.find((team) => team.id === activeTeamId) ?? teams[0];

  return { teams, activeTeam };
});
