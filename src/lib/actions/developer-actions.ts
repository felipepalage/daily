"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export type DeveloperActionState = {
  error?: string;
} | null;

export async function createDeveloperAction(
  _prevState: DeveloperActionState,
  formData: FormData,
): Promise<DeveloperActionState> {
  const session = await requireSession();
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();

  if (!name) {
    return { error: "Informe o nome do desenvolvedor." };
  }

  await prisma.developer.create({
    data: {
      name,
      role: role || null,
      scrumMasterId: session.scrumMasterId,
    },
  });

  revalidatePath("/dashboard");
  return null;
}

export async function deleteDeveloperAction(developerId: string) {
  const session = await requireSession();

  await prisma.developer.deleteMany({
    where: { id: developerId, scrumMasterId: session.scrumMasterId },
  });

  revalidatePath("/dashboard");
}
