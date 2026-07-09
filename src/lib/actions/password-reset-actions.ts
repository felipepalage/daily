"use server";

import { randomBytes, createHash } from "crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

const TOKEN_TTL_MS = 60 * 60 * 1000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function getBaseUrl() {
  if (process.env.APP_URL) return process.env.APP_URL;
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export type PasswordResetRequestState = { success?: boolean; error?: string } | null;

export async function requestPasswordResetAction(
  _prevState: PasswordResetRequestState,
  formData: FormData,
): Promise<PasswordResetRequestState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) {
    return { error: "Informe seu e-mail." };
  }

  const scrumMaster = await prisma.scrumMaster.findUnique({ where: { email } });

  if (scrumMaster) {
    const token = randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        tokenHash: hashToken(token),
        scrumMasterId: scrumMaster.id,
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    });

    const baseUrl = await getBaseUrl();
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    await sendEmail({
      to: scrumMaster.email,
      subject: "Redefinir senha — Daily",
      text: `Oi, ${scrumMaster.name}!\n\nRecebemos um pedido para redefinir sua senha no Daily. Clique no link abaixo (válido por 1 hora):\n\n${resetUrl}\n\nSe não foi você, pode ignorar este e-mail.`,
    });
  }

  // Sempre retorna sucesso, mesmo se o e-mail não existir, para não revelar quais contas existem.
  return { success: true };
}

export type PasswordResetState = { error?: string } | null;

export async function resetPasswordAction(
  _prevState: PasswordResetState,
  formData: FormData,
): Promise<PasswordResetState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!token) {
    return { error: "Link inválido ou expirado." };
  }

  if (password.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return { error: "Link inválido ou expirado. Peça um novo." };
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.scrumMaster.update({
      where: { id: resetToken.scrumMasterId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { scrumMasterId: resetToken.scrumMasterId },
    }),
  ]);

  redirect("/login?reset=success");
}
