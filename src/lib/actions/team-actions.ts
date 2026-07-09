"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { ACTIVE_TEAM_COOKIE } from "@/lib/team";

export type TeamActionState = {
  error?: string;
} | null;

export async function createTeamAction(
  _prevState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const session = await requireSession();
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { error: "Informe o nome do time." };
  }

  const team = await prisma.team.create({
    data: { name, scrumMasterId: session.scrumMasterId },
  });

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_TEAM_COOKIE, team.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/dashboard");
  return null;
}

export async function switchTeamAction(formData: FormData) {
  const session = await requireSession();
  const teamId = String(formData.get("teamId") ?? "");

  const team = await prisma.team.findFirst({
    where: { id: teamId, scrumMasterId: session.scrumMasterId },
  });
  if (!team) return;

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_TEAM_COOKIE, team.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/dashboard");
}
