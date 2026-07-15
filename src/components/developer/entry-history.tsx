"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatFullDate, dateToInputValue } from "@/lib/date";
import { Card } from "@/components/ui/card";
import { DailyEntryForm, type QuestionLabels } from "@/components/developer/daily-entry-form";
import { ScrumNote } from "@/components/developer/scrum-note";
import { IssueLinks } from "@/components/developer/issue-links";
import type { IssueNumbers } from "@/lib/redmine";

const MOOD_EMOJI: Record<string, string> = {
  otimo: "😄",
  bem: "🙂",
  neutro: "😐",
  dificil: "😕",
  pessimo: "😣",
};

type Entry = {
  id: string;
  date: Date;
  doing: string;
  blocked: string;
  improve: string;
  mood: string | null;
  scrumNote: string | null;
} & IssueNumbers;

function EntryItem({
  entry,
  developerId,
  questionLabels,
  redmineUrl,
}: {
  entry: Entry;
  developerId: string;
  questionLabels: QuestionLabels;
  redmineUrl: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    await fetch("/api/entries/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryId: entry.id }),
    });
    router.refresh();
  }

  if (editing) {
    return (
      <DailyEntryForm
        developerId={developerId}
        dateValue={dateToInputValue(entry.date)}
        dateLabel={formatFullDate(entry.date)}
        title="Editar check-in"
        questionLabels={questionLabels}
        defaultValues={{
          doing: entry.doing,
          blocked: entry.blocked,
          improve: entry.improve,
          mood: entry.mood ?? "",
          featureNumber: entry.featureNumber,
          blockerNumber: entry.blockerNumber,
          epicNumber: entry.epicNumber,
          taskNumber: entry.taskNumber,
        }}
        onSuccess={() => setEditing(false)}
      />
    );
  }

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-foreground-muted">
          {entry.mood && <span className="mr-1.5">{MOOD_EMOJI[entry.mood]}</span>}
          {formatFullDate(entry.date)}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs font-medium text-primary hover:underline cursor-pointer"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="text-xs font-medium text-foreground-muted hover:text-accent cursor-pointer"
          >
            Excluir
          </button>
        </div>
      </div>
      <dl className="space-y-2.5 text-sm">
        <div>
          <dt className="font-medium text-foreground">{questionLabels.doing}</dt>
          <dd className="text-foreground-muted whitespace-pre-wrap">{entry.doing}</dd>
        </div>
        {entry.blocked && (
          <div>
            <dt className="font-medium text-foreground">{questionLabels.blocked}</dt>
            <dd className="text-foreground-muted whitespace-pre-wrap">{entry.blocked}</dd>
          </div>
        )}
        {entry.improve && (
          <div>
            <dt className="font-medium text-foreground">{questionLabels.improve}</dt>
            <dd className="text-foreground-muted whitespace-pre-wrap">{entry.improve}</dd>
          </div>
        )}
      </dl>
      <div className="mt-3">
        <IssueLinks entry={entry} redmineUrl={redmineUrl} />
      </div>
      <ScrumNote entryId={entry.id} initialNote={entry.scrumNote ?? ""} />
    </Card>
  );
}

export function EntryHistory({
  entries,
  developerId,
  questionLabels,
  redmineUrl,
}: {
  entries: Entry[];
  developerId: string;
  questionLabels: QuestionLabels;
  redmineUrl: string | null;
}) {
  if (entries.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-foreground-muted">
        Nenhum check-in registrado ainda.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <EntryItem
          key={entry.id}
          entry={entry}
          developerId={developerId}
          questionLabels={questionLabels}
          redmineUrl={redmineUrl}
        />
      ))}
    </div>
  );
}
