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

  const { entryId } = (body ?? {}) as { entryId?: unknown };
  const normalizedId = String(entryId ?? "");

  if (!normalizedId) {
    return NextResponse.json({ error: "Check-in invalido." }, { status: 400 });
  }

  try {
    await apiFetch(`/entries/${normalizedId}`, { method: "DELETE" });
  } catch {
    // se falhou, ignora
  }

  return NextResponse.json({ ok: true });
}
