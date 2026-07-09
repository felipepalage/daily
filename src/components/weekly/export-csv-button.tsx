"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { WeekDayEntry } from "@/components/weekly/developer-week-summary";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

type DeveloperWeekData = {
  name: string;
  role: string | null;
  days: WeekDayEntry[];
};

export function ExportCsvButton({
  weekRangeLabel,
  developers,
}: {
  weekRangeLabel: string;
  developers: DeveloperWeekData[];
}) {
  const [exporting, setExporting] = useState(false);

  function handleExport() {
    setExporting(true);
    try {
      const rows = [["Desenvolvedor", "Função", "Dia", "Data", "Humor", "Fez", "Travou", "Melhorar"]];
      for (const developer of developers) {
        for (const day of developer.days) {
          rows.push([
            developer.name,
            developer.role ?? "",
            day.label,
            day.shortDate,
            day.hasEntry ? (day.mood ?? "") : "",
            day.hasEntry ? day.doing : "Sem check-in",
            day.hasEntry ? day.blocked : "",
            day.hasEntry ? day.improve : "",
          ]);
        }
      }
      const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
      const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resumo-semanal-${weekRangeLabel.replace(/\s+/g, "-")}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <Button variant="secondary" onClick={handleExport} disabled={exporting}>
      {exporting ? "Gerando CSV..." : "Exportar CSV"}
    </Button>
  );
}
