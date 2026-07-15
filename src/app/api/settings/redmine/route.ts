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
  const redmineUrl = String(b.redmineUrl ?? "").trim().replace(/\/+$/, "");
  const redmineApiKey = String(b.redmineApiKey ?? "").trim();

  if (redmineUrl && !/^https?:\/\//i.test(redmineUrl)) {
    return NextResponse.json({ error: "A URL do Redmine deve comecar com http:// ou https://" }, { status: 400 });
  }

  try {
    await apiFetch("/settings/redmine", {
      method: "PUT",
      body: { redmineUrl: redmineUrl || null, redmineApiKey: redmineApiKey || null },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Erro ao salvar configuracao do Redmine." }, { status: 500 });
  }
}
