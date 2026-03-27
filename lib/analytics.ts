import dayjs from "dayjs";

import { AnalyticsPayload, MetricPoint, RecordEvent, TodaySummary } from "@/types/domain";

const sleepMinutesBetween = (start: dayjs.Dayjs, end: dayjs.Dayjs) =>
  Math.max(end.diff(start, "minute"), 0);

export const summarizeDay = (
  events: RecordEvent[],
  date: string,
  nowIsoValue = new Date().toISOString()
): TodaySummary => {
  const sorted = [...events]
    .filter((event) => !event.deletedAt)
    .sort((a, b) => dayjs(a.timestamp).valueOf() - dayjs(b.timestamp).valueOf());

  let totalMilkMl = 0;
  let peeCount = 0;
  let poopCount = 0;
  let sleepMinutes = 0;
  let pendingSleepStart: dayjs.Dayjs | null = null;

  sorted.forEach((event) => {
    if (event.type === "milk") {
      totalMilkMl += event.amountMl ?? 0;
    }
    if (event.type === "pee") {
      peeCount += 1;
    }
    if (event.type === "poop") {
      poopCount += 1;
    }
    if (event.type === "sleep_start") {
      pendingSleepStart = dayjs(event.timestamp);
    }
    if (event.type === "sleep_end" && pendingSleepStart) {
      sleepMinutes += sleepMinutesBetween(pendingSleepStart, dayjs(event.timestamp));
      pendingSleepStart = null;
    }
  });

  if (pendingSleepStart) {
    const fallbackEnd = dayjs(date).isSame(dayjs(nowIsoValue), "day")
      ? dayjs(nowIsoValue)
      : dayjs(date).endOf("day");
    sleepMinutes += sleepMinutesBetween(pendingSleepStart, fallbackEnd);
  }

  return {
    totalMilkMl,
    peeCount,
    poopCount,
    sleepMinutes,
  };
};

export const buildAnalytics = (
  allEvents: RecordEvent[],
  anchorDate: string,
  days: number
): AnalyticsPayload => {
  const points: MetricPoint[] = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const targetDay = dayjs(anchorDate).subtract(index, "day").format("YYYY-MM-DD");
    const dayEvents = allEvents.filter((event) =>
      dayjs(event.timestamp).format("YYYY-MM-DD") === targetDay
    );
    const summary = summarizeDay(dayEvents, targetDay);
    points.push({
      date: targetDay,
      label: dayjs(targetDay).format("M/D"),
      milkMl: summary.totalMilkMl,
      peeCount: summary.peeCount,
      poopCount: summary.poopCount,
      sleepMinutes: summary.sleepMinutes,
    });
  }

  const latest = points[points.length - 1];

  return {
    summary: latest
      ? {
          totalMilkMl: latest.milkMl,
          peeCount: latest.peeCount,
          poopCount: latest.poopCount,
          sleepMinutes: latest.sleepMinutes,
        }
      : {
          totalMilkMl: 0,
          peeCount: 0,
          poopCount: 0,
          sleepMinutes: 0,
        },
    points,
  };
};
