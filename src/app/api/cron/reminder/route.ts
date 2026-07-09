import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { todayDateOnlyUTC } from "@/lib/date";

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const today = todayDateOnlyUTC();

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

  let emailsSent = 0;

  for (const scrumMaster of scrumMasters) {
    const missing: string[] = [];

    for (const team of scrumMaster.teams) {
      for (const developer of team.developers) {
        if (developer.entries.length === 0) {
          missing.push(`${developer.name} (${team.name})`);
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
    emailsSent += 1;
  }

  return NextResponse.json({ ok: true, emailsSent });
}
