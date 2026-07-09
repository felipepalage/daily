"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import {
  addDays,
  formatShortDate,
  formatWeekRangeLabel,
  formatWeekdayLabel,
  getMondayOfWeek,
  getWeekDays,
  inputValueToDateOnlyUTC,
} from "@/lib/date";

export type SlackActionState = { error?: string; success?: boolean } | null;

export async function sendWeeklySummaryToSlackAction(
  _prevState: SlackActionState,
  formData: FormData,
): Promise<SlackActionState> {
  const session = await requireSession();
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    return { error: "Integração com Slack não configurada (defina SLACK_WEBHOOK_URL)." };
  }

  const teamId = String(formData.get("teamId") ?? "");
  const weekValue = String(formData.get("week") ?? "");

  const team = await prisma.team.findFirst({
    where: { id: teamId, scrumMasterId: session.scrumMasterId },
  });
  if (!team) {
    return { error: "Time não encontrado." };
  }

  const monday = weekValue
    ? getMondayOfWeek(inputValueToDateOnlyUTC(weekValue))
    : getMondayOfWeek(new Date());
  const friday = addDays(monday, 4);
  const weekDays = getWeekDays(monday);

  const developers = await prisma.developer.findMany({
    where: { teamId },
    orderBy: { createdAt: "asc" },
    include: { entries: { where: { date: { gte: monday, lte: friday } } } },
  });

  const lines = [`*Resumo semanal — ${team.name}* (${formatWeekRangeLabel(monday)})`, ""];

  for (const developer of developers) {
    lines.push(`*${developer.name}*${developer.role ? ` — ${developer.role}` : ""}`);
    for (const day of weekDays) {
      const entry = developer.entries.find((e) => e.date.getTime() === day.getTime());
      if (!entry) {
        lines.push(`• ${formatWeekdayLabel(day)} ${formatShortDate(day)}: sem check-in`);
        continue;
      }
      const blockedSuffix = entry.blocked ? ` _(travado: ${entry.blocked})_` : "";
      lines.push(`• ${formatWeekdayLabel(day)} ${formatShortDate(day)}: ${entry.doing}${blockedSuffix}`);
    }
    lines.push("");
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: lines.join("\n") }),
  });

  if (!response.ok) {
    return { error: "Falha ao enviar para o Slack." };
  }

  return { success: true };
}
