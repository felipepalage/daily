"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";

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
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!name || !email || !password || !confirmPassword) {
    return { error: "Preencha todos os campos." };
  }

  if (password.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }

  if (password !== confirmPassword) {
    return { error: "As senhas não conferem." };
  }

  let token: string;
  try {
    const data = await apiFetch<{ token: string }>("/auth/register", {
      method: "POST",
      body: { name, email, password, confirmPassword },
      anonymous: true,
    });
    token = data.token;
  } catch (err) {
    if (err instanceof ApiError) {
      return { error: err.message };
    }
    return { error: "Erro ao criar conta. Tente novamente." };
  }

  // redirect() lança uma exceção especial do Next; por isso fica FORA do try.
  await createSession(token);
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

  let token: string;
  try {
    const data = await apiFetch<{ token: string }>("/auth/login", {
      method: "POST",
      body: { email, password },
      anonymous: true,
    });
    token = data.token;
  } catch (err) {
    if (err instanceof ApiError) {
      return { error: err.message };
    }
    return { error: "E-mail ou senha inválidos." };
  }

  await createSession(token);
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}