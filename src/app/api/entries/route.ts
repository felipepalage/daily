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
  const developerId = String(b.developerId ?? "");
  const date = String(b.date ?? "");
  const doing = String(b.doing ?? "").trim();

  if (!developerId || !date || !doing) {
    return NextResponse.json({ error: "Conte pelo menos o que esta sendo feito hoje." }, { status: 400 });
  }

  const clean = (v: unknown) => {
    const s = String(v ?? "").trim();
    return s || null;
  };

  try {
    await apiFetch("/entries", {
      method: "POST",
      body: {
        developerId,
        date,
        doing,
        blocked: String(b.blocked ?? "").trim(),
        improve: String(b.improve ?? "").trim(),
        mood: clean(b.mood),
        featureNumber: clean(b.featureNumber),
        blockerNumber: clean(b.blockerNumber),
        epicNumber: clean(b.epicNumber),
        taskNumber: clean(b.taskNumber),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Erro ao salvar check-in." }, { status: 500 });
  }
}
