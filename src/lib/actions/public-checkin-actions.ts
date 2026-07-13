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

  const developer = await prisma.developer.findUnique({ where: { publicToken: token } });
  if (!developer) {
    return { error: "Link inválido." };
  }

  // A data é sempre "hoje", calculada no servidor — o dev não escolhe a data
  // pelo link público, só edita o check-in do dia atual.
  const date = todayDateOnlyUTC();

  const issueData = {
    featureNumber: featureNumber || null,
    blockerNumber: blockerNumber || null,
    epicNumber: epicNumber || null,
    taskNumber: taskNumber || null,
  };

  await prisma.dailyEntry.upsert({
    where: { developerId_date: { developerId: developer.id, date } },
    update: { doing, blocked, improve, mood: mood || null, ...issueData },
    create: { developerId: developer.id, date, doing, blocked, improve, mood: mood || null, ...issueData },
  });

  revalidatePath(`/checkin/${token}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/weekly");
  return { success: true };
}
