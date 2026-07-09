"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";

export type AuthActionState = {
  error?: string;
} | null;

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "Preencha todos os campos." };
  }

  if (password.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }

  const existing = await prisma.scrumMaster.findUnique({ where: { email } });
  if (existing) {
    return { error: "Já existe uma conta com esse e-mail." };
  }

  const passwordHash = await hashPassword(password);
  const scrumMaster = await prisma.scrumMaster.create({
    data: { name, email, passwordHash },
  });

  await createSession({
    scrumMasterId: scrumMaster.id,
    name: scrumMaster.name,
    email: scrumMaster.email,
  });

  redirect("/dashboard");
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Preencha e-mail e senha." };
  }

  const scrumMaster = await prisma.scrumMaster.findUnique({ where: { email } });
  if (!scrumMaster) {
    return { error: "E-mail ou senha inválidos." };
  }

  const passwordMatches = await verifyPassword(password, scrumMaster.passwordHash);
  if (!passwordMatches) {
    return { error: "E-mail ou senha inválidos." };
  }

  await createSession({
    scrumMasterId: scrumMaster.id,
    name: scrumMaster.name,
    email: scrumMaster.email,
  });

  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
