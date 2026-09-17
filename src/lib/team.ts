import { cache } from "react";
import { cookies } from "next/headers";
import { apiFetch } from "@/lib/api";

export const ACTIVE_TEAM_COOKIE = "daily_active_team";

export type TeamData = {
  id: string;
  name: string;
  createdAt: string;
};

export const getActiveTeam = cache(async () => {
  let teams: TeamData[];
  try {
    teams = await apiFetch<TeamData[]>("/teams");
  } catch {
    teams = [];
  }

  if (teams.length === 0) {
    return { teams: [] as TeamData[], activeTeam: null as TeamData | null };
  }

  const cookieStore = await cookies();
  const activeTeamId = cookieStore.get(ACTIVE_TEAM_COOKIE)?.value;
  const activeTeam = teams.find((team) => team.id === activeTeamId) ?? teams[0];

  return { teams, activeTeam };
});