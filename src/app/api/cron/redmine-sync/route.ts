import { NextRequest, NextResponse } from "next/server";
import { apiFetch, ApiError } from "@/lib/api";

export const runtime = "edge";

// Mesmo contrato de src/app/api/cron/reminder/route.ts: chamado por um
// agendador externo protegido pelo CRON_SECRET, repassa pro backend .NET
// que consulta o Redmine (via chave/URL de cada scrum master) e manda
// e-mail de "nova issue atribuída" pros devs.
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await apiFetch<{ issuesNotified: number }>("/admin/redmine/sync", {
      method: "POST",
      anonymous: true,
      token: secret,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 502;
    const message = error instanceof ApiError ? error.message : "failed to trigger redmine sync";
    return NextResponse.json({ error: message }, { status });
  }
}
