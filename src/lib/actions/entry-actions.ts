"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { inputValueToDateOnlyUTC } from "@/lib/date";

export type EntryActionState = {
  error?: string;
  success?: boolean;
} | null;

export async function upsertDailyEntryAction(
  _prevState: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  const session = await requireSession();

  const developerId = String(formData.get("developerId") ?? "");
  const dateValue = String(formData.get("date") ?? "");
  const doing = String(formData.get("doing") ?? "").trim();
  const blocked = String(formData.get("blocked") ?? "").trim();
  const improve = String(formData.get("improve") ?? "").trim();
  const mood = String(formData.get("mood") ?? "").trim();

  if (!developerId || !dateValue || !doing) {
    return { error: "Conte pelo menos o que está sendo feito hoje." };
  }

  const developer = await prisma.developer.findFirst({
    where: { id: developerId, team: { scrumMasterId: session.scrumMasterId } },
  });
  if (!developer) {
    return { error: "Desenvolvedor não encontrado." };
  }

  const date = inputValueToDateOnlyUTC(dateValue);

  await prisma.dailyEntry.upsert({
    where: { developerId_date: { developerId, date } },
    update: { doing, blocked, improve, mood: mood || null },
    create: { developerId, date, doing, blocked, improve, mood: mood || null },
  });

  revalidatePath(`/dashboard/developers/${developerId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/weekly");
  return { success: true };
}

export async function deleteEntryAction(entryId: string) {
  const session = await requireSession();

  const entry = await prisma.dailyEntry.findFirst({
    where: { id: entryId, developer: { team: { scrumMasterId: session.scrumMasterId } } },
  });
  if (!entry) return;

  await prisma.dailyEntry.delete({ where: { id: entryId } });

  revalidatePath(`/dashboard/developers/${entry.developerId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/weekly");
}

export type ScrumNoteActionState = { error?: string } | null;

export async function updateScrumNoteAction(
  _prevState: ScrumNoteActionState,
  formData: FormData,
): Promise<ScrumNoteActionState> {
  const session = await requireSession();

  const entryId = String(formData.get("entryId") ?? "");
  const scrumNote = String(formData.get("scrumNote") ?? "").trim();

  const entry = await prisma.dailyEntry.findFirst({
    where: { id: entryId, developer: { team: { scrumMasterId: session.scrumMasterId } } },
  });
  if (!entry) {
    return { error: "Check-in não encontrado." };
  }

  await prisma.dailyEntry.update({
    where: { id: entryId },
    data: { scrumNote: scrumNote || null },
  });

  revalidatePath(`/dashboard/developers/${entry.developerId}`);
  return null;
}
