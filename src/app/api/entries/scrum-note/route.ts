import { NextResponse } from "next/server";
import { apiFetch, ApiError } from "@/lib/api";

export const runtime = "edge";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const { entryId, scrumNote } = (body ?? {}) as { entryId?: unknown; scrumNote?: unknown };
  const normalizedId = String(entryId ?? "");
  const normalizedNote = String(scrumNote ?? "").trim();

  if (!normalizedId) {
    return NextResponse.json({ error: "Check-in nao encontrado." }, { status: 400 });
  }

  try {
    await apiFetch(`/entries/${normalizedId}/scrum-note`, {
      method: "PUT",
      body: { scrumNote: normalizedNote || null },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Erro ao salvar nota do scrum." }, { status: 500 });
  }
}
