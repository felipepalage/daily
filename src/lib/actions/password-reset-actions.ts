"use server";

import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";

export type PasswordResetRequestState = { success?: boolean; error?: string } | null;

export async function requestPasswordResetAction(
  _prevState: PasswordResetRequestState,
  formData: FormData,
): Promise<PasswordResetRequestState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) {
    return { error: "Informe seu e-mail." };
  }

  try {
    await apiFetch("/auth/forgot-password", {
      method: "POST",
      body: { email },
      anonymous: true,
    });

    // Sempre retorna sucesso, mesmo se o e-mail não existir, para não revelar quais contas existem.
    return { success: true };
  } catch {
    // Se a API falhar (ex: problema de rede), ainda retorna sucesso para não revelar nada.
    return { success: true };
  }
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

  try {
    await apiFetch("/auth/reset-password", {
      method: "POST",
      body: { token, password },
      anonymous: true,
    });

    redirect("/login?reset=success");
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: "Link inválido ou expirado. Peça um novo." };
  }
}