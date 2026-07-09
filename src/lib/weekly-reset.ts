import { prisma } from "@/lib/prisma";
import { dateToInputValue, getMondayOfWeek } from "@/lib/date";

const LAST_RESET_KEY = "lastResetWeek";

export async function ensureWeeklyReset() {
  const currentWeek = dateToInputValue(getMondayOfWeek(new Date()));

  const setting = await prisma.appSetting.findUnique({
    where: { key: LAST_RESET_KEY },
  });

  if (setting?.value === currentWeek) {
    return;
  }

  await prisma.dailyEntry.deleteMany({});
  await prisma.appSetting.upsert({
    where: { key: LAST_RESET_KEY },
    update: { value: currentWeek },
    create: { key: LAST_RESET_KEY, value: currentWeek },
  });
}
