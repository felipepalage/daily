"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

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
