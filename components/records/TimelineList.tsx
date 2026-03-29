import { useMemo, useState } from "react";
import { FlatList, LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import dayjs from "dayjs";
import { runOnJS } from "react-native-reanimated";

import {
  eventMeta,
  palette,
  poopAmountOptions,
  poopColorOptions,
  poopHardnessOptions,
  radii,
  spacing,
} from "@/constants/theme";
import { formatDuration, formatTime } from "@/lib/date";
import { RecordEvent, TimelineDensity } from "@/types/domain";

const densityMap: Record<
  TimelineDensity,
  {
    paddingVertical: number;
    timeWidth: number;
    timeSize: number;
    iconSize: number;
    iconWrap: number;
    iconRadius: number;
    rowGap: number;
    noteTopGap: number;
    cardRadius: number;
    horizontalPadding: number;
    cardGap: number;
  }
> = {
  comfortable: {
    paddingVertical: 18,
    timeWidth: 72,
    timeSize: 19,
    iconSize: 20,
    iconWrap: 42,
    iconRadius: 16,
    rowGap: spacing.md,
    noteTopGap: 7,
    cardRadius: 28,
    horizontalPadding: spacing.md,
    cardGap: 10,
  },
  standard: {
    paddingVertical: 11,
    timeWidth: 60,
    timeSize: 17,
    iconSize: 18,
    iconWrap: 36,
    iconRadius: 13,
    rowGap: 10,
    noteTopGap: 5,
    cardRadius: 24,
    horizontalPadding: 14,
    cardGap: 6,
  },
  compact: {
    paddingVertical: 6,
    timeWidth: 56,
    timeSize: 15,
    iconSize: 14,
    iconWrap: 28,
    iconRadius: 10,
    rowGap: 8,
    noteTopGap: 3,
    cardRadius: 18,
    horizontalPadding: 12,
    cardGap: 4,
  },
};

type TimelineListProps = {
  records: RecordEvent[];
  density: TimelineDensity;
  onPressRecord: (record: RecordEvent, relatedRecord?: RecordEvent) => void;
};

type DisplayItem =
  | {
      id: string;
      kind: "event";
      record: RecordEvent;
      label: string;
      detail?: string;
      detailTone?: {
        backgroundColor: string;
        borderColor: string;
        textColor: string;
      };
      note?: string;
      tint: string;
      icon: string;
    }
  | {
      id: string;
      kind: "sleep_session";
      start: RecordEvent;
      end: RecordEvent;
      label: string;
      detail: string;
      note?: string;
      tint: string;
      icon: string;
    };

const poopAmountMap = Object.fromEntries(poopAmountOptions.map((option) => [option.value, option.label]));
const poopHardnessMap = Object.fromEntries(poopHardnessOptions.map((option) => [option.value, option.label]));
const poopColorMap = Object.fromEntries(poopColorOptions.map((option) => [option.value, option.label]));
const poopColorToneMap = Object.fromEntries(
  poopColorOptions.map((option) => [
    option.value,
    {
      backgroundColor: option.backgroundColor,
      borderColor: option.borderColor,
      textColor: option.textColor,
    },
  ])
);

const buildRecordCopy = (record: RecordEvent) => {
  if (record.type === "milk") {
    return {
      primaryDetail: record.amountMl ? `${record.amountMl}ml` : undefined,
      detailTone: undefined,
      note: record.note?.trim() || undefined,
    };
  }

  if (record.type === "poop") {
    const detailParts = [
      record.poopAmount ? poopAmountMap[record.poopAmount] : undefined,
      record.poopHardness ? poopHardnessMap[record.poopHardness] : undefined,
      record.poopColor ? poopColorMap[record.poopColor] : undefined,
    ].filter(Boolean);

    return {
      primaryDetail: detailParts.length ? detailParts.join(" ・ ") : undefined,
      detailTone: record.poopColor ? poopColorToneMap[record.poopColor] : undefined,
      note: record.note?.trim() || undefined,
    };
  }

  return {
    primaryDetail: undefined,
    detailTone: undefined,
    note: record.note?.trim() || undefined,
  };
};

const buildSleepPairs = (records: RecordEvent[]) => {
  const usedEndIds = new Set<string>();
  const pairs: { start: RecordEvent; end: RecordEvent }[] = [];
  const endByStartId = new Map<string, RecordEvent>();

  records.forEach((record, startIndex) => {
    if (record.type !== "sleep_start") {
      return;
    }

    const end = records.find(
      (candidate, candidateIndex) =>
        candidateIndex > startIndex &&
        candidate.type === "sleep_end" &&
        !usedEndIds.has(candidate.id)
    );

    if (!end) {
      return;
    }

    usedEndIds.add(end.id);
    pairs.push({ start: record, end });
    endByStartId.set(record.id, end);
  });

  return {
    pairs,
    usedEndIds,
    endByStartId,
  };
};

const buildDisplayItems = (records: RecordEvent[]): DisplayItem[] => {
  const items: DisplayItem[] = [];
  const { usedEndIds, endByStartId } = buildSleepPairs(records);

  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];

    if (record.type === "sleep_start") {
      const end = endByStartId.get(record.id);

      if (!end) {
        const meta = eventMeta[record.type];
        const copy = buildRecordCopy(record);

        items.push({
          id: record.id,
          kind: "event",
          record,
          label: meta.label,
          detail: copy.primaryDetail,
          detailTone: copy.detailTone,
          note: copy.note,
          tint: meta.tint,
          icon: meta.icon,
        });
        continue;
      }

      const start = dayjs(record.timestamp);
      const endTime = dayjs(end.timestamp);
      const note = [record.note?.trim(), end.note?.trim()].filter(Boolean).join(" / ") || undefined;

      items.push({
        id: `${record.id}:${end.id}`,
        kind: "sleep_session",
        start: record,
        end,
        label: "寝る - 起きる",
        detail: formatDuration(Math.max(endTime.diff(start, "minute"), 0)),
        note,
        tint: eventMeta.sleep_start.tint,
        icon: eventMeta.sleep_start.icon,
      });
      continue;
    }

    if (record.type === "sleep_end" && usedEndIds.has(record.id)) {
      continue;
    }

    const meta = eventMeta[record.type];
    const copy = buildRecordCopy(record);

    items.push({
      id: record.id,
      kind: "event",
      record,
      label: meta.label,
      detail: copy.primaryDetail,
      detailTone: copy.detailTone,
      note: copy.note,
      tint: meta.tint,
      icon: meta.icon,
    });
  }

  return items;
};

const RAIL_LABELS = Array.from({ length: 24 }, (_, index) => index);

const minuteOfDay = (timestamp: string) => {
  const time = dayjs(timestamp);
  return time.hour() * 60 + time.minute();
};

const railTopForMinute = (minute: number, railHeight: number) => {
  const innerHeight = railHeight - 8;
  return 4 + (minute / (24 * 60)) * innerHeight;
};

const DayTimelineRail = ({
  records,
  railHeight,
}: {
  records: RecordEvent[];
  railHeight: number;
}) => {
  const sleepSegments = useMemo(() => {
    const { pairs } = buildSleepPairs(records);
    const segments: { top: number; height: number }[] = [];

    pairs.forEach(({ start, end }) => {
      const startMinute = minuteOfDay(start.timestamp);
      const endMinute = minuteOfDay(end.timestamp);
      const top = railTopForMinute(startMinute, railHeight);
      const bottom = railTopForMinute(endMinute, railHeight);
      segments.push({
        top,
        height: Math.max(bottom - top, 8),
      });
    });

    return segments;
  }, [railHeight, records]);

  const markers = useMemo(
    () =>
      records.map((record) => ({
        id: record.id,
        top: railTopForMinute(minuteOfDay(record.timestamp), railHeight),
        tint: eventMeta[record.type].tint,
        icon: eventMeta[record.type].icon,
        type: record.type,
      })),
    [railHeight, records]
  );

  return (
    <View style={styles.railShell}>
      <Text style={styles.railHeading}>0-23</Text>
      <View style={[styles.railTrack, { height: railHeight }]}>
        <View style={styles.railLine} />
        {RAIL_LABELS.map((label) => (
          <Text
            key={label}
            style={[
              styles.railLabel,
              { top: railTopForMinute(label * 60, railHeight) - 5 },
            ]}
          >
            {label}
          </Text>
        ))}
        {sleepSegments.map((segment, index) => (
          <View
            key={`sleep-${index}`}
            style={[
              styles.sleepSegment,
              {
                top: segment.top,
                height: segment.height,
              },
            ]}
          />
        ))}
        {markers.map((marker) => {
          const isSleepMarker = marker.type === "sleep_start" || marker.type === "sleep_end";

          return (
            <View
              key={marker.id}
              style={[
                styles.eventMarker,
                {
                  top: marker.top - 7,
                  backgroundColor: isSleepMarker ? "rgba(133, 116, 182, 0.20)" : "transparent",
                },
              ]}
            >
              <MaterialCommunityIcons
                color={isSleepMarker ? "#7A68AB" : marker.tint}
                name={marker.icon as never}
                size={isSleepMarker ? 8 : 9}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

export const TimelineList = ({ records, density, onPressRecord }: TimelineListProps) => {
  const metric = densityMap[density];
  const displayItems = useMemo(() => buildDisplayItems(records), [records]);
  const [containerHeight, setContainerHeight] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerHeight(event.nativeEvent.layout.height);
  };

  return (
    <View onLayout={handleLayout} style={styles.wrapper}>
      <DayTimelineRail records={records} railHeight={Math.max(containerHeight - 12, 240)} />

      <FlatList
        style={styles.list}
        data={displayItems}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          records.length === 0 ? styles.emptyContent : styles.listContent,
          { gap: metric.cardGap },
        ]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons color={palette.textSoft} name="timeline-text-outline" size={24} />
            </View>
            <Text style={styles.emptyTitle}>まだ記録がありません</Text>
            <Text style={styles.emptyBody}>下のボタンから、最初の記録を追加できます。</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isSleepSession = item.kind === "sleep_session";
          const note = isSleepSession ? item.note : item.note;
          const tapGesture = Gesture.Tap()
            .maxDuration(220)
            .maxDeltaX(8)
            .maxDeltaY(8)
            .onEnd((_event, success) => {
              if (success) {
                runOnJS(onPressRecord)(
                  isSleepSession ? item.start : item.record,
                  isSleepSession ? item.end : undefined
                );
              }
            });

          return (
            <GestureDetector gesture={tapGesture}>
              <View
                style={[
                  styles.itemCard,
                  {
                    paddingVertical: metric.paddingVertical,
                    paddingHorizontal: metric.horizontalPadding,
                    borderRadius: metric.cardRadius,
                  },
                ]}
              >
                <View style={[styles.timeColumn, { width: metric.timeWidth }]}>
                  <Text style={[styles.time, { fontSize: metric.timeSize }]}>
                    {formatTime(isSleepSession ? item.start.timestamp : item.record.timestamp)}
                  </Text>
                  {isSleepSession ? (
                    <Text style={styles.timeRange}>{formatTime(item.end.timestamp)}</Text>
                  ) : null}
                </View>

                <View style={styles.cardBody}>
                  <View style={[styles.cardHeader, { gap: metric.rowGap }]}>
                    <View
                      style={[
                        styles.iconBadge,
                        {
                          width: metric.iconWrap,
                          height: metric.iconWrap,
                          borderRadius: metric.iconRadius,
                          backgroundColor: `${item.tint}16`,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        color={item.tint}
                        name={item.icon as never}
                        size={metric.iconSize}
                      />
                    </View>

                    <View style={styles.textBlock}>
                      <View style={styles.primaryRow}>
                        <Text style={styles.typeLabel}>{item.label}</Text>
                        {item.detail ? (
                          <View
                            style={[
                              styles.detailPill,
                              item.kind === "event" && item.detailTone
                                ? {
                                    backgroundColor: item.detailTone.backgroundColor,
                                    borderColor: item.detailTone.borderColor,
                                  }
                                : null,
                            ]}
                          >
                            <Text
                              style={[
                                styles.detailText,
                                item.kind === "event" && item.detailTone
                                  ? { color: item.detailTone.textColor }
                                  : null,
                              ]}
                            >
                              {item.detail}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      {note ? (
                        <View style={[styles.noteChip, { marginTop: metric.noteTopGap }]}>
                          <Text style={styles.noteText}>{note}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>
              </View>
            </GestureDetector>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
  },
  railShell: {
    width: 34,
    alignItems: "center",
    paddingTop: 0,
  },
  railHeading: {
    color: palette.textSoft,
    fontSize: 9,
    fontWeight: "700",
    marginBottom: 6,
  },
  railTrack: {
    width: 34,
    position: "relative",
    alignItems: "center",
    flexShrink: 0,
  },
  railLine: {
    position: "absolute",
    top: 4,
    bottom: 4,
    width: 1,
    backgroundColor: "rgba(139, 121, 92, 0.18)",
  },
  railLabel: {
    position: "absolute",
    left: 0,
    width: 14,
    color: palette.textSoft,
    fontSize: 7,
    textAlign: "left",
  },
  sleepSegment: {
    position: "absolute",
    width: 6,
    borderRadius: radii.pill,
    backgroundColor: "rgba(133, 116, 182, 0.32)",
  },
  eventMarker: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 2,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderRadius: 30,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: "rgba(139, 121, 92, 0.12)",
    gap: spacing.sm,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: radii.pill,
    backgroundColor: palette.background,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "700",
  },
  emptyBody: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: "rgba(139, 121, 92, 0.08)",
    shadowColor: "#7A6650",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  timeColumn: {
    justifyContent: "center",
    gap: 2,
  },
  time: {
    color: palette.text,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  timeRange: {
    color: palette.textSoft,
    fontSize: 11,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  cardBody: {
    flex: 1,
    justifyContent: "center",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBadge: {
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    flex: 1,
  },
  primaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  typeLabel: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "700",
  },
  detailPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: "transparent",
  },
  detailText: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  noteChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: palette.background,
  },
  noteText: {
    color: palette.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
});
