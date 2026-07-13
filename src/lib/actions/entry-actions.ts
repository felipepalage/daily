"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";

export type EntryActionState = {
  error?: string;
  success?: boolean;
} | null;

export async function upsertDailyEntryAction(
  _prevState: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  await requireSession();

  const developerId = String(formData.get("developerId") ?? "");
  const dateValue = String(formData.get("date") ?? "");
  const doing = String(formData.get("doing") ?? "").trim();
  const blocked = String(formData.get("blocked") ?? "").trim();
  const improve = String(formData.get("improve") ?? "").trim();
  const mood = String(formData.get("mood") ?? "").trim();
  const featureNumber = String(formData.get("featureNumber") ?? "").trim();
  const blockerNumber = String(formData.get("blockerNumber") ?? "").trim();
  const epicNumber = String(formData.get("epicNumber") ?? "").trim();
  const taskNumber = String(formData.get("taskNumber") ?? "").trim();

  if (!developerId || !dateValue || !doing) {
    return { error: "Conte pelo menos o que está sendo feito hoje." };
  }

  try {
    await apiFetch("/entries", {
      method: "POST",
      body: {
        developerId,
        date: dateValue,
        doing,
        blocked,
        improve,
        mood: mood || null,
        featureNumber: featureNumber || null,
        blockerNumber: blockerNumber || null,
        epicNumber: epicNumber || null,
        taskNumber: taskNumber || null,
      },
    });

    revalidatePath(`/dashboard/developers/${developerId}`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/weekly");
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: "Erro ao salvar check-in." };
  }
}

export async function deleteEntryAction(entryId: string) {
  await requireSession();

  try {
    await apiFetch(`/entries/${entryId}`, { method: "DELETE" });
  } catch {
    // se falhou, ignora
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/weekly");
}

export type ScrumNoteActionState = { error?: string } | null;

export async function updateScrumNoteAction(
  _prevState: ScrumNoteActionState,
  formData: FormData,
): Promise<ScrumNoteActionState> {
  await requireSession();

  const entryId = String(formData.get("entryId") ?? "");
  const scrumNote = String(formData.get("scrumNote") ?? "").trim();

  if (!entryId) {
    return { error: "Check-in não encontrado." };
  }

  try {
    await apiFetch(`/entries/${entryId}/scrum-note`, {
      method: "PUT",
      body: { scrumNote: scrumNote || null },
    });

    revalidatePath("/dashboard");
    return null;
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: "Erro ao salvar nota do scrum." };
  }
}