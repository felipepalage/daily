"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";

export type PublicCheckinState = {
  error?: string;
  success?: boolean;
} | null;

export async function upsertPublicCheckinAction(
  _prevState: PublicCheckinState,
  formData: FormData,
): Promise<PublicCheckinState> {
  const token = String(formData.get("token") ?? "");
  const doing = String(formData.get("doing") ?? "").trim();
  const blocked = String(formData.get("blocked") ?? "").trim();
  const improve = String(formData.get("improve") ?? "").trim();
  const mood = String(formData.get("mood") ?? "").trim();
  const featureNumber = String(formData.get("featureNumber") ?? "").trim();
  const blockerNumber = String(formData.get("blockerNumber") ?? "").trim();
  const epicNumber = String(formData.get("epicNumber") ?? "").trim();
  const taskNumber = String(formData.get("taskNumber") ?? "").trim();

  if (!token) {
    return { error: "Link inválido." };
  }

  if (!doing) {
    return { error: "Conte pelo menos o que está sendo feito hoje." };
  }

  try {
    await apiFetch("/public/checkin", {
      method: "POST",
      body: {
        token,
        doing,
        blocked,
        improve,
        mood: mood || null,
        featureNumber: featureNumber || null,
        blockerNumber: blockerNumber || null,
        epicNumber: epicNumber || null,
        taskNumber: taskNumber || null,
      },
      anonymous: true,
    });

    revalidatePath(`/checkin/${token}`);
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: "Erro ao salvar check-in." };
  }
}