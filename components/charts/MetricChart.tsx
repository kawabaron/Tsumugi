import { useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";

import { palette, radii, spacing } from "@/constants/theme";

type MetricChartProps = {
  title: string;
  unit: string;
  color: string;
  values: { label: string; value: number }[];
};

export const MetricChart = ({ title, unit, color, values }: MetricChartProps) => {
  const [plotWidth, setPlotWidth] = useState(0);
  const chartHeight = 160;
  const maxValue = Math.max(...values.map((value) => value.value), 1);

  const points = values.map((entry, index) => ({
    ...entry,
    x: values.length > 1 ? (plotWidth / (values.length - 1)) * index : plotWidth / 2,
    y: chartHeight - (entry.value / maxValue) * (chartHeight - 24) - 12,
  }));

  const handlePlotLayout = (event: LayoutChangeEvent) => {
    setPlotWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>

      <View style={styles.chartWrap}>
        <View onLayout={handlePlotLayout} style={[styles.plotArea, { height: chartHeight }]}>
          <View style={styles.gridLine} />
          <View style={[styles.gridLine, styles.gridLineMiddle]} />
          <View style={[styles.gridLine, styles.gridLineBottom]} />

          {plotWidth > 0
            ? points.map((point, index) => {
                const next = points[index + 1];
                if (!next) {
                  return null;
                }

                const dx = next.x - point.x;
                const dy = next.y - point.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = `${Math.atan2(dy, dx)}rad`;

                return (
                  <View
                    key={`${point.label}-${next.label}`}
                    style={[
                      styles.segment,
                      {
                        left: (point.x + next.x) / 2 - length / 2,
                        top: (point.y + next.y) / 2 - 1.5,
                        width: length,
                        backgroundColor: color,
                        transform: [{ rotate: angle }],
                      },
                    ]}
                  />
                );
              })
            : null}

          {plotWidth > 0
            ? points.map((point) => (
                <View
                  key={point.label}
                  style={[
                    styles.pointWrap,
                    {
                      left: point.x - 28,
                      top: point.y - 30,
                    },
                  ]}
                >
                  <Text style={styles.pointValue}>{point.value}</Text>
                  <View style={[styles.point, { borderColor: color }]} />
                </View>
              ))
            : null}
        </View>

        <View style={styles.labelsRow}>
          {values.map((entry) => (
            <View key={entry.label} style={styles.labelCell}>
              <Text style={styles.label}>{entry.label}</Text>
            </View>
          ))}
        </View>
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
  chartWrap: {
    gap: spacing.sm,
  },
  plotArea: {
    position: "relative",
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    borderTopWidth: 1,
    borderTopColor: palette.line,
  },
  gridLineMiddle: {
    top: "50%",
  },
  gridLineBottom: {
    top: "100%",
  },
  segment: {
    position: "absolute",
    height: 3,
    borderRadius: radii.pill,
  },
  pointWrap: {
    position: "absolute",
    width: 56,
    alignItems: "center",
    gap: 6,
  },
  pointValue: {
    color: palette.text,
    fontSize: 12,
    fontWeight: "700",
  },
  point: {
    width: 12,
    height: 12,
    borderRadius: radii.pill,
    backgroundColor: palette.surface,
    borderWidth: 3,
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  labelCell: {
    flex: 1,
    alignItems: "center",
  },
  label: {
    color: palette.textSoft,
    fontSize: 11,
  },
});
