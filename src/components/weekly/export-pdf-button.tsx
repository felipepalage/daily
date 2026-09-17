"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { WeekDayEntry } from "@/components/weekly/developer-week-summary";

type DeveloperWeekData = {
  name: string;
  role: string | null;
  days: WeekDayEntry[];
};

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 15;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FOOTER_Y = PAGE_HEIGHT - 10;

const BRAND = { r: 79, g: 70, b: 229 }; // indigo-600
const TEXT_DARK = { r: 30, g: 30, b: 40 };
const TEXT_MUTED = { r: 110, g: 110, b: 125 };
const BORDER = { r: 228, g: 228, b: 236 };
const SURFACE = { r: 248, g: 248, b: 252 };

const MOOD_LABEL: Record<string, string> = {
  otimo: "Ótimo",
  bem: "Bem",
  neutro: "Neutro",
  dificil: "Difícil",
  pessimo: "Péssimo",
};

const MOOD_COLOR: Record<string, { r: number; g: number; b: number }> = {
  otimo: { r: 22, g: 163, b: 74 },
  bem: { r: 101, g: 163, b: 13 },
  neutro: { r: 202, g: 138, b: 4 },
  dificil: { r: 234, g: 88, b: 12 },
  pessimo: { r: 220, g: 38, b: 38 },
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
      let page = 1;
      let y = MARGIN;

      function setColor(c: { r: number; g: number; b: number }, mode: "text" | "fill" | "draw" = "text") {
        if (mode === "text") doc.setTextColor(c.r, c.g, c.b);
        else if (mode === "fill") doc.setFillColor(c.r, c.g, c.b);
        else doc.setDrawColor(c.r, c.g, c.b);
      }

      function drawFooter() {
        setColor(TEXT_MUTED, "draw");
        doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
        doc.line(MARGIN, FOOTER_Y - 4, PAGE_WIDTH - MARGIN, FOOTER_Y - 4);
        doc.setFontSize(8);
        setColor(TEXT_MUTED);
        doc.setFont("helvetica", "normal");
        doc.text(`Daily · ${weekRangeLabel}`, MARGIN, FOOTER_Y);
        doc.text(`Página ${page}`, PAGE_WIDTH - MARGIN, FOOTER_Y, { align: "right" });
      }

      function newPage() {
        drawFooter();
        doc.addPage();
        page += 1;
        y = MARGIN;
      }

      function ensureSpace(height: number) {
        if (y + height > FOOTER_Y - 8) newPage();
      }

      function writeField(label: string, text: string, x: number, width: number) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        setColor(TEXT_DARK);
        ensureSpace(5);
        doc.text(label, x, y);
        y += 4.5;

        doc.setFont("helvetica", "normal");
        setColor(TEXT_MUTED);
        const wrapped = doc.splitTextToSize(text, width);
        ensureSpace(wrapped.length * 4.6);
        doc.text(wrapped, x, y);
        y += wrapped.length * 4.6 + 3;
      }

      // ---- Cover header ----
      setColor(BRAND, "fill");
      doc.rect(0, 0, PAGE_WIDTH, 38, "F");
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("Resumo semanal", MARGIN, 18);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(weekRangeLabel, MARGIN, 27);
      doc.setFontSize(9);
      doc.setTextColor(230, 230, 255);
      doc.text(`${developers.length} colaborador(es)`, PAGE_WIDTH - MARGIN, 27, { align: "right" });
      y = 48;

      for (const developer of developers) {
        const daysWithEntry = developer.days.filter((d) => d.hasEntry).length;
        const totalDays = developer.days.length;

        ensureSpace(20);

        // ---- Developer header card ----
        setColor(SURFACE, "fill");
        doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 16, 2, 2, "F");
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        setColor(TEXT_DARK);
        doc.text(developer.name, MARGIN + 4, y + 7);
        if (developer.role) {
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          setColor(TEXT_MUTED);
          doc.text(developer.role, MARGIN + 4, y + 12.5);
        }

        // progress pill
        const pillLabel = `${daysWithEntry}/${totalDays} check-ins`;
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        const pillWidth = doc.getTextWidth(pillLabel) + 8;
        const pillX = MARGIN + CONTENT_WIDTH - pillWidth - 4;
        const pillColor = daysWithEntry === totalDays ? MOOD_COLOR.otimo : daysWithEntry === 0 ? MOOD_COLOR.pessimo : BRAND;
        setColor(pillColor, "fill");
        doc.roundedRect(pillX, y + 4, pillWidth, 7, 3.5, 3.5, "F");
        doc.setTextColor(255, 255, 255);
        doc.text(pillLabel, pillX + pillWidth / 2, y + 8.7, { align: "center" });

        y += 22;

        for (const day of developer.days) {
          ensureSpace(day.hasEntry ? 14 : 10);

          const dayStartY = y;
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          setColor(TEXT_DARK);
          doc.text(`${day.label} · ${day.shortDate}`, MARGIN, y);

          if (day.mood) {
            const moodText = MOOD_LABEL[day.mood] ?? day.mood;
            const moodColor = MOOD_COLOR[day.mood] ?? TEXT_MUTED;
            doc.setFontSize(8);
            const badgeWidth = doc.getTextWidth(moodText) + 6;
            const badgeX = MARGIN + CONTENT_WIDTH - badgeWidth;
            setColor(moodColor, "fill");
            doc.roundedRect(badgeX, y - 4, badgeWidth, 5.5, 2.5, 2.5, "F");
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.text(moodText, badgeX + badgeWidth / 2, y - 0.3, { align: "center" });
          }
          y += 6;

          if (!day.hasEntry) {
            doc.setFontSize(9);
            doc.setFont("helvetica", "italic");
            setColor(TEXT_MUTED);
            doc.text("Sem check-in registrado", MARGIN, y);
            y += 6;
          } else {
            const indent = MARGIN + 4;
            const width = CONTENT_WIDTH - 4;
            writeField(questionLabels.doing, day.doing, indent, width);
            if (day.blocked) writeField(questionLabels.blocked, day.blocked, indent, width);
            if (day.improve) writeField(questionLabels.improve, day.improve, indent, width);

            const issues = [
              day.featureNumber && `Feature #${day.featureNumber}`,
              day.blockerNumber && `Blocker #${day.blockerNumber}`,
              day.epicNumber && `Epic #${day.epicNumber}`,
              day.taskNumber && `Task #${day.taskNumber}`,
            ].filter(Boolean);
            if (issues.length > 0) {
              doc.setFontSize(8.5);
              doc.setFont("helvetica", "bold");
              setColor(BRAND);
              ensureSpace(5);
              doc.text(`Redmine: ${issues.join(", ")}`, indent, y);
              y += 5;
            }
          }

          // subtle divider between days
          setColor(BORDER, "draw");
          doc.line(MARGIN, y, MARGIN + CONTENT_WIDTH, y);
          y += 4;
          void dayStartY;
        }

        y += 6;
      }

      drawFooter();
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
