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

  const b = (body ?? {}) as Record<string, unknown>;
  const questionDoingLabel = String(b.questionDoingLabel ?? "").trim();
  const questionBlockedLabel = String(b.questionBlockedLabel ?? "").trim();
  const questionImproveLabel = String(b.questionImproveLabel ?? "").trim();

  if (!questionDoingLabel || !questionBlockedLabel || !questionImproveLabel) {
    return NextResponse.json({ error: "Preencha as tres perguntas." }, { status: 400 });
  }

  try {
    await apiFetch("/settings/questions", {
      method: "PUT",
      body: { questionDoingLabel, questionBlockedLabel, questionImproveLabel },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Erro ao salvar perguntas." }, { status: 500 });
  }
}
