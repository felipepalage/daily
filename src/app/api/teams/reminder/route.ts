import { NextResponse } from "next/server";
import { apiFetch, ApiError } from "@/lib/api";

export const runtime = "edge";

const TIME_FORMAT = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const { teamId, reminderTimeUtc } = (body ?? {}) as Record<string, unknown>;
  const normalizedTeamId = String(teamId ?? "");
  const normalizedTime = reminderTimeUtc ? String(reminderTimeUtc).trim() : null;

  if (!normalizedTeamId) {
    return NextResponse.json({ error: "Time invalido." }, { status: 400 });
  }
  if (normalizedTime && !TIME_FORMAT.test(normalizedTime)) {
    return NextResponse.json({ error: "Horário inválido." }, { status: 400 });
  }

  try {
    await apiFetch(`/teams/${normalizedTeamId}/reminder`, {
      method: "PUT",
      body: { reminderTimeUtc: normalizedTime },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Erro ao salvar o lembrete." }, { status: 500 });
  }
}
