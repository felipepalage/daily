"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { ACTIVE_TEAM_COOKIE } from "@/lib/team";
import { isSecureCookieContext } from "@/lib/cookie-options";

export type TeamActionState = {
  error?: string;
} | null;

function setActiveTeamCookie(teamId: string) {
  return cookies().then((cookieStore) => {
    cookieStore.set(ACTIVE_TEAM_COOKIE, teamId, {
      httpOnly: true,
      secure: isSecureCookieContext(),
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  });
}

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

  await setActiveTeamCookie(team.id);

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

  await setActiveTeamCookie(team.id);

  revalidatePath("/dashboard");
}

export async function deleteTeamAction(teamId: string) {
  const session = await requireSession();

  const cookieStore = await cookies();
  const activeTeamId = cookieStore.get(ACTIVE_TEAM_COOKIE)?.value;

  await prisma.team.deleteMany({
    where: { id: teamId, scrumMasterId: session.scrumMasterId },
  });

  if (activeTeamId === teamId) {
    cookieStore.delete(ACTIVE_TEAM_COOKIE);
  }

  revalidatePath("/dashboard");
}
