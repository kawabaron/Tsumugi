import { StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { MetricChart } from "@/components/charts/MetricChart";
import { palette, radii, spacing } from "@/constants/theme";
import { useAnalyticsQuery, useAppContextQuery } from "@/hooks/use-app-data";
import { formatDuration, formatHeaderDate } from "@/lib/date";

export default function AnalyticsScreen() {
  const { data: context } = useAppContextQuery();
  const { data } = useAnalyticsQuery(7);
  const accentColor = context?.settings?.themeColor ?? palette.text;
  const summary = data?.summary;
  const points = data?.points ?? [];

  return (
    <Screen>
      <SectionTitle
        eyebrow="Analytics"
        title="振り返り"
        description={`${formatHeaderDate(points[points.length - 1]?.date ?? new Date().toISOString())} 時点の集計です。`}
      />

      <View style={styles.summaryGrid}>
        <View style={[styles.summaryCard, { borderColor: `${accentColor}33` }]}>
          <Text style={styles.summaryLabel}>今日のミルク</Text>
          <Text style={styles.summaryValue}>{summary?.totalMilkMl ?? 0}ml</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>おしっこ</Text>
          <Text style={styles.summaryValue}>{summary?.peeCount ?? 0}回</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>うんち</Text>
          <Text style={styles.summaryValue}>{summary?.poopCount ?? 0}回</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>睡眠時間</Text>
          <Text style={styles.summaryValue}>{formatDuration(summary?.sleepMinutes ?? 0)}</Text>
        </View>
      </View>

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

const styles = StyleSheet.create({
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  summaryCard: {
    width: "47%",
    minHeight: 102,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.md,
    justifyContent: "space-between",
  },
  summaryLabel: {
    color: palette.textMuted,
    fontSize: 13,
  },
  summaryValue: {
    color: palette.text,
    fontSize: 22,
    fontWeight: "700",
  },
});
