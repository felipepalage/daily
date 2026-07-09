"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { todayDateOnlyUTC } from "@/lib/date";

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

  if (!token) {
    return { error: "Link inválido." };
  }

  if (!doing) {
    return { error: "Conte pelo menos o que está sendo feito hoje." };
  }

  const developer = await prisma.developer.findUnique({ where: { publicToken: token } });
  if (!developer) {
    return { error: "Link inválido." };
  }

  // A data é sempre "hoje", calculada no servidor — o dev não escolhe a data
  // pelo link público, só edita o check-in do dia atual.
  const date = todayDateOnlyUTC();

  await prisma.dailyEntry.upsert({
    where: { developerId_date: { developerId: developer.id, date } },
    update: { doing, blocked, improve, mood: mood || null },
    create: { developerId: developer.id, date, doing, blocked, improve, mood: mood || null },
  });

  revalidatePath(`/checkin/${token}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/weekly");
  return { success: true };
}
