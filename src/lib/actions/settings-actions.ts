"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession, hashPassword, verifyPassword } from "@/lib/auth";

export type SettingsActionState = { error?: string; success?: boolean } | null;

export async function updateQuestionLabelsAction(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const session = await requireSession();

  const questionDoingLabel = String(formData.get("questionDoingLabel") ?? "").trim();
  const questionBlockedLabel = String(formData.get("questionBlockedLabel") ?? "").trim();
  const questionImproveLabel = String(formData.get("questionImproveLabel") ?? "").trim();

  if (!questionDoingLabel || !questionBlockedLabel || !questionImproveLabel) {
    return { error: "Preencha as três perguntas." };
  }

  await prisma.scrumMaster.update({
    where: { id: session.scrumMasterId },
    data: { questionDoingLabel, questionBlockedLabel, questionImproveLabel },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function changePasswordAction(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const session = await requireSession();

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

  const scrumMaster = await prisma.scrumMaster.findUniqueOrThrow({
    where: { id: session.scrumMasterId },
  });

  const matches = await verifyPassword(currentPassword, scrumMaster.passwordHash);
  if (!matches) {
    return { error: "Senha atual incorreta." };
  }

  await prisma.scrumMaster.update({
    where: { id: session.scrumMasterId },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  return { success: true };
}

export async function updateRedmineConfigAction(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const session = await requireSession();

  const redmineUrlRaw = String(formData.get("redmineUrl") ?? "").trim();
  const redmineApiKey = String(formData.get("redmineApiKey") ?? "").trim();

  // Normaliza a URL removendo a barra final para montar links depois.
  const redmineUrl = redmineUrlRaw.replace(/\/+$/, "");

  if (redmineUrl && !/^https?:\/\//i.test(redmineUrl)) {
    return { error: "A URL do Redmine deve começar com http:// ou https://" };
  }

  await prisma.scrumMaster.update({
    where: { id: session.scrumMasterId },
    data: {
      redmineUrl: redmineUrl || null,
      redmineApiKey: redmineApiKey || null,
    },
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}
