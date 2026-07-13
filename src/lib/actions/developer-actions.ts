"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";

export type DeveloperActionState = {
  error?: string;
} | null;

export async function createDeveloperAction(
  _prevState: DeveloperActionState,
  formData: FormData,
): Promise<DeveloperActionState> {
  await requireSession();
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const teamId = String(formData.get("teamId") ?? "");

  if (!name) {
    return { error: "Informe o nome do desenvolvedor." };
  }

  try {
    await apiFetch("/developers", {
      method: "POST",
      body: { name, role: role || null, email: email || null, teamId },
    });

    revalidatePath("/dashboard");
    return null;
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: "Erro ao criar desenvolvedor." };
  }
}

export async function deleteDeveloperAction(developerId: string) {
  await requireSession();

  try {
    await apiFetch(`/developers/${developerId}`, { method: "DELETE" });
  } catch {
    // se falhou, ignora
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}