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

  if (!developerId || !dateValue || !doing) {
    return { error: "Conte pelo menos o que está sendo feito hoje." };
  }

  const developer = await prisma.developer.findFirst({
    where: { id: developerId, scrumMasterId: session.scrumMasterId },
  });
  if (!developer) {
    return { error: "Desenvolvedor não encontrado." };
  }

  const date = inputValueToDateOnlyUTC(dateValue);

  await prisma.dailyEntry.upsert({
    where: { developerId_date: { developerId, date } },
    update: { doing, blocked, improve },
    create: { developerId, date, doing, blocked, improve },
  });

  revalidatePath(`/dashboard/developers/${developerId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/weekly");
  return { success: true };
}
