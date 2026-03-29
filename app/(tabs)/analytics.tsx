import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { MetricChart } from "@/components/charts/MetricChart";
import { palette } from "@/constants/theme";
import { useAnalyticsQuery, useAppContextQuery } from "@/hooks/use-app-data";
import { formatHeaderDate } from "@/lib/date";

export default function AnalyticsScreen() {
  const { data: context } = useAppContextQuery();
  const { data } = useAnalyticsQuery(7);
  const accentColor = context?.settings?.themeColor ?? palette.text;
  const points = data?.points ?? [];

  return (
    <Screen>
      <SectionTitle
        eyebrow="Analytics"
        title="分析"
        description={`${formatHeaderDate(points[points.length - 1]?.date ?? new Date().toISOString())} を含む直近 7 日の推移です。`}
      />

      <MetricChart
        title="直近 7 日のミルク量"
        unit="ml"
        color={accentColor}
        values={points.map((point) => ({ label: point.label, value: point.milkMl }))}
      />
      <MetricChart
        title="直近 7 日のおしっこ回数"
        unit="count"
        color="#6F9CC8"
        values={points.map((point) => ({ label: point.label, value: point.peeCount }))}
      />
      <MetricChart
        title="直近 7 日のうんち回数"
        unit="count"
        color="#8C6C54"
        values={points.map((point) => ({ label: point.label, value: point.poopCount }))}
      />
      <MetricChart
        title="直近 7 日の睡眠時間"
        unit="min"
        color="#8574B6"
        values={points.map((point) => ({ label: point.label, value: point.sleepMinutes }))}
      />
    </Screen>
  );
}
