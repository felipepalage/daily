export function computeBlockedStreak(entries: { date: Date; blocked: string }[]): number {
  const sorted = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());

  let streak = 0;
  for (const entry of sorted) {
    if (entry.blocked.trim().length > 0) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}
