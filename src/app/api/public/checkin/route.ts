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

  const {
    token,
    doing,
    blocked,
    improve,
    mood,
    featureNumber,
    blockerNumber,
    epicNumber,
    taskNumber,
  } = (body ?? {}) as Record<string, unknown>;

  const normalizedToken = String(token ?? "");
  const normalizedDoing = String(doing ?? "").trim();

  if (!normalizedToken) {
    return NextResponse.json({ error: "Link invalido." }, { status: 400 });
  }

  if (!normalizedDoing) {
    return NextResponse.json({ error: "Conte pelo menos o que esta sendo feito hoje." }, { status: 400 });
  }

  const clean = (v: unknown) => {
    const s = String(v ?? "").trim();
    return s || null;
  };

  try {
    await apiFetch("/public/checkin", {
      method: "POST",
      body: {
        token: normalizedToken,
        doing: normalizedDoing,
        blocked: String(blocked ?? "").trim(),
        improve: String(improve ?? "").trim(),
        mood: clean(mood),
        featureNumber: clean(featureNumber),
        blockerNumber: clean(blockerNumber),
        epicNumber: clean(epicNumber),
        taskNumber: clean(taskNumber),
      },
      anonymous: true,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Erro ao salvar check-in." }, { status: 500 });
  }
}
