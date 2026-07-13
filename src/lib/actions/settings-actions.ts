"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";

export type SettingsActionState = { error?: string; success?: boolean } | null;

export async function updateQuestionLabelsAction(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  await requireSession();

  const questionDoingLabel = String(formData.get("questionDoingLabel") ?? "").trim();
  const questionBlockedLabel = String(formData.get("questionBlockedLabel") ?? "").trim();
  const questionImproveLabel = String(formData.get("questionImproveLabel") ?? "").trim();

  if (!questionDoingLabel || !questionBlockedLabel || !questionImproveLabel) {
    return { error: "Preencha as três perguntas." };
  }

  try {
    await apiFetch("/settings/questions", {
      method: "PUT",
      body: {
        questionDoingLabel,
        questionBlockedLabel,
        questionImproveLabel,
      },
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: "Erro ao salvar perguntas." };
  }
}

export async function changePasswordAction(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  await requireSession();

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Preencha todos os campos." };
  }

  if (newPassword.length < 6) {
    return { error: "A nova senha precisa ter pelo menos 6 caracteres." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "As senhas não conferem." };
  }

  try {
    await apiFetch("/settings/password", {
      method: "PUT",
      body: { currentPassword, newPassword },
    });

    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: "Erro ao alterar senha." };
  }
}

export async function updateRedmineConfigAction(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  await requireSession();

  const redmineUrlRaw = String(formData.get("redmineUrl") ?? "").trim();
  const redmineApiKey = String(formData.get("redmineApiKey") ?? "").trim();

  // Normaliza a URL removendo a barra final para montar links depois.
  const redmineUrl = redmineUrlRaw.replace(/\/+$/, "");

  if (redmineUrl && !/^https?:\/\//i.test(redmineUrl)) {
    return { error: "A URL do Redmine deve começar com http:// ou https://" };
  }

  try {
    await apiFetch("/settings/redmine", {
      method: "PUT",
      body: {
        redmineUrl: redmineUrl || null,
        redmineApiKey: redmineApiKey || null,
      },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: "Erro ao salvar configuração do Redmine." };
  }
}