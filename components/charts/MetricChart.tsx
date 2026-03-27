import { StyleSheet, Text, View } from "react-native";

import { palette, radii, spacing } from "@/constants/theme";

type MetricChartProps = {
  title: string;
  unit: string;
  color: string;
  values: { label: string; value: number }[];
};

export const MetricChart = ({
  title,
  unit,
  color,
  values,
}: MetricChartProps) => {
  const maxValue = Math.max(...values.map((value) => value.value), 1);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
      <View style={styles.bars}>
        {values.map((entry) => (
          <View key={entry.label} style={styles.barColumn}>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barValue,
                  {
                    backgroundColor: color,
                    height: `${Math.max((entry.value / maxValue) * 100, entry.value > 0 ? 12 : 4)}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.barNumber}>{entry.value}</Text>
            <Text style={styles.barLabel}>{entry.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "700",
  },
  unit: {
    color: palette.textSoft,
    fontSize: 12,
  },
  bars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.sm,
    minHeight: 170,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  barTrack: {
    width: "100%",
    flex: 1,
    minHeight: 110,
    justifyContent: "flex-end",
    borderRadius: radii.md,
    backgroundColor: palette.surfaceMuted,
    padding: 4,
  },
  barValue: {
    width: "100%",
    borderRadius: radii.sm,
  },
  barNumber: {
    color: palette.text,
    fontSize: 12,
    fontWeight: "600",
  },
  barLabel: {
    color: palette.textSoft,
    fontSize: 11,
  },
});
