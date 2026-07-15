import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";

export const runtime = "edge";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const { developerId } = (body ?? {}) as { developerId?: unknown };
  const normalizedId = String(developerId ?? "");

  if (!normalizedId) {
    return NextResponse.json({ error: "Desenvolvedor invalido." }, { status: 400 });
  }

  try {
    await apiFetch(`/developers/${normalizedId}`, { method: "DELETE" });
  } catch {
    // se falhou, ignora
  }

  return NextResponse.json({ ok: true });
}
