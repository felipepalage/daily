import { NextRequest, NextResponse } from "next/server";
import { apiFetch, ApiError } from "@/lib/api";

export const runtime = "edge";

// Esta rota só existe para ser chamada por um agendador externo (ex.: cron
// job) protegido pelo CRON_SECRET. Toda a lógica (consultar quem falta
// check-in hoje e enviar os e-mails) roda no backend .NET — que tem acesso
// direto ao banco e a SMTP — porque o Edge Runtime do Cloudflare não suporta
// socket TCP bruto (nem para SQL Server nem para SMTP).
//
// Contrato esperado no lado .NET: POST /api/admin/reminders/send, autenticado
// com o mesmo CRON_SECRET como Bearer token, retornando
// { skipped?: string; developerEmailsSent: number; scrumMasterEmailsSent: number }.
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await apiFetch<{
      skipped?: string;
      developerEmailsSent: number;
      scrumMasterEmailsSent: number;
    }>("/admin/reminders/send", {
      method: "POST",
      anonymous: true,
      token: secret,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 502;
    const message = error instanceof ApiError ? error.message : "failed to trigger reminders";
    return NextResponse.json({ error: message }, { status });
  }
}
