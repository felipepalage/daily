"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { WeekDayEntry } from "@/components/weekly/developer-week-summary";

type DeveloperWeekData = {
  name: string;
  role: string | null;
  days: WeekDayEntry[];
};

const PAGE_HEIGHT = 287;
const MARGIN = 15;
const CONTENT_WIDTH = 180;

const MOOD_LABEL: Record<string, string> = {
  otimo: "Ótimo",
  bem: "Bem",
  neutro: "Neutro",
  dificil: "Difícil",
  pessimo: "Péssimo",
};

export function ExportPdfButton({
  weekRangeLabel,
  developers,
  questionLabels,
}: {
  weekRangeLabel: string;
  developers: DeveloperWeekData[];
  questionLabels: { doing: string; blocked: string; improve: string };
}) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      let y = MARGIN;

      function ensureSpace(lines: number, lineHeight = 5) {
        if (y + lines * lineHeight > PAGE_HEIGHT) {
          doc.addPage();
          y = MARGIN;
        }
      }

      function writeParagraph(label: string, text: string) {
        const wrapped = doc.splitTextToSize(`${label} ${text}`, CONTENT_WIDTH);
        ensureSpace(wrapped.length);
        doc.text(wrapped, MARGIN, y);
        y += wrapped.length * 5 + 2;
      }

      doc.setFontSize(16);
      doc.text("Resumo semanal — Daily", MARGIN, y);
      y += 8;
      doc.setFontSize(11);
      doc.setTextColor(90);
      doc.text(weekRangeLabel, MARGIN, y);
      doc.setTextColor(0);
      y += 10;

      for (const developer of developers) {
        ensureSpace(2, 8);
        doc.setFontSize(13);
        doc.text(developer.name + (developer.role ? ` — ${developer.role}` : ""), MARGIN, y);
        y += 7;
        doc.setFontSize(10);

        for (const day of developer.days) {
          ensureSpace(1, 6);
          doc.setFont("helvetica", "bold");
          const moodSuffix = day.mood ? `  (${MOOD_LABEL[day.mood] ?? day.mood})` : "";
          doc.text(`${day.label} · ${day.shortDate}${moodSuffix}`, MARGIN, y);
          doc.setFont("helvetica", "normal");
          y += 5;

          if (!day.hasEntry) {
            ensureSpace(1);
            doc.setTextColor(140);
            doc.text("Sem check-in registrado", MARGIN, y);
            doc.setTextColor(0);
            y += 6;
            continue;
          }

          writeParagraph(questionLabels.doing, day.doing);
          if (day.blocked) writeParagraph(questionLabels.blocked, day.blocked);
          if (day.improve) writeParagraph(questionLabels.improve, day.improve);

          const issues = [
            day.featureNumber && `Feature #${day.featureNumber}`,
            day.blockerNumber && `Blocker #${day.blockerNumber}`,
            day.epicNumber && `Epic #${day.epicNumber}`,
            day.taskNumber && `Task #${day.taskNumber}`,
          ].filter(Boolean);
          if (issues.length > 0) writeParagraph("Redmine:", issues.join(", "));
          y += 2;
        }

        y += 4;
      }

      doc.save(`resumo-semanal-${weekRangeLabel.replace(/\s+/g, "-")}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <Button variant="secondary" onClick={handleExport} disabled={exporting}>
      {exporting ? "Gerando PDF..." : "Exportar PDF"}
    </Button>
  );
}
