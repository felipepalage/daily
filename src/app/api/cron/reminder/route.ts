import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { todayDateOnlyUTC } from "@/lib/date";

function getBaseUrl(request: NextRequest) {
  return process.env.APP_URL || new URL(request.url).origin;
}

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const today = todayDateOnlyUTC();
  const weekday = today.getUTCDay();

  if (weekday === 0 || weekday === 6) {
    return NextResponse.json({ ok: true, skipped: "fim de semana" });
  }

  const baseUrl = getBaseUrl(request);

  const scrumMasters = await prisma.scrumMaster.findMany({
    include: {
      teams: {
        include: {
          developers: {
            include: {
              entries: { where: { date: today }, select: { id: true } },
            },
          },
        },
      },
    },
  });

  let developerEmailsSent = 0;
  let scrumMasterEmailsSent = 0;

  for (const scrumMaster of scrumMasters) {
    const missing: string[] = [];

    for (const team of scrumMaster.teams) {
      for (const developer of team.developers) {
        if (developer.entries.length > 0) continue;

        missing.push(`${developer.name} (${team.name})`);

        if (developer.email) {
          await sendEmail({
            to: developer.email,
            subject: "Lembrete: check-in de hoje no Daily",
            text: `Oi, ${developer.name}!\n\nNão esquece de preencher seu check-in de hoje:\n\n${baseUrl}/checkin/${developer.publicToken}`,
          });
          developerEmailsSent += 1;
        }
      }
    }

    if (missing.length === 0) continue;

    await sendEmail({
      to: scrumMaster.email,
      subject: `Daily — ${missing.length} dev(s) sem check-in hoje`,
      text: `Oi, ${scrumMaster.name}!\n\nAinda não fizeram o check-in de hoje:\n\n${missing
        .map((name) => `- ${name}`)
        .join("\n")}`,
    });
    scrumMasterEmailsSent += 1;
  }

  return NextResponse.json({ ok: true, developerEmailsSent, scrumMasterEmailsSent });
}
