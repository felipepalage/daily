"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
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
  await requireSession();
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { error: "Informe o nome do time." };
  }

  try {
    const team = await apiFetch<{ id: string }>("/teams", {
      method: "POST",
      body: { name },
    });

    await setActiveTeamCookie(team.id);
    revalidatePath("/dashboard");
    return null;
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: "Erro ao criar time." };
  }
}

export async function switchTeamAction(formData: FormData) {
  await requireSession();
  const teamId = String(formData.get("teamId") ?? "");

  try {
    // Verifica se o time existe e pertence ao scrum master
    await apiFetch(`/teams/${teamId}`, { method: "GET" });
    await setActiveTeamCookie(teamId);
    revalidatePath("/dashboard");
  } catch {
    // time não encontrado ou não pertence ao scrum master; ignora
  }
}

export async function deleteTeamAction(teamId: string) {
  await requireSession();

  const cookieStore = await cookies();
  const activeTeamId = cookieStore.get(ACTIVE_TEAM_COOKIE)?.value;

  try {
    await apiFetch(`/teams/${teamId}`, { method: "DELETE" });
  } catch {
    // se falhou (ex: não encontrado), ignora
  }

  if (activeTeamId === teamId) {
    cookieStore.delete(ACTIVE_TEAM_COOKIE);
  }

  revalidatePath("/dashboard");
}