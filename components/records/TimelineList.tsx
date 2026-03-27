import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { eventMeta, palette, radii, spacing } from "@/constants/theme";
import { formatTime } from "@/lib/date";
import { MemberSummary, RecordEvent, TimelineDensity } from "@/types/domain";

const densityMap: Record<TimelineDensity, number> = {
  comfortable: 18,
  standard: 12,
  compact: 8,
};

type TimelineListProps = {
  records: RecordEvent[];
  members: MemberSummary[];
  density: TimelineDensity;
  onPressRecord: (record: RecordEvent) => void;
};

const detailForRecord = (record: RecordEvent) => {
  if (record.type === "milk") {
    return `${record.amountMl ?? 0}ml`;
  }
  if (record.type === "memo") {
    return record.note ?? "";
  }
  return record.note ?? "";
};

export const TimelineList = ({
  records,
  members,
  density,
  onPressRecord,
}: TimelineListProps) => {
  if (records.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>まだ記録がありません</Text>
        <Text style={styles.emptyBody}>下のクイック操作から、最初の 1 件を追加しましょう。</Text>
      </View>
    );
  }

  return (
      <View style={styles.list}>
      {records.map((record, index) => {
        const author = members.find((member) => member.userId === record.createdByUserId);
        const meta = eventMeta[record.type];
        const detail = detailForRecord(record);
        return (
          <Pressable
            key={record.id}
            onPress={() => onPressRecord(record)}
            style={[
              styles.item,
              { paddingVertical: densityMap[density] },
              index === records.length - 1 && styles.lastItem,
            ]}
          >
            <Text style={styles.time}>{formatTime(record.timestamp)}</Text>
            <View style={styles.track}>
              <View style={[styles.iconBadge, { backgroundColor: `${meta.tint}18` }]}>
                <MaterialCommunityIcons color={meta.tint} name={meta.icon as never} size={20} />
              </View>
              <View style={styles.content}>
                <View style={styles.topRow}>
                  <Text style={styles.typeLabel}>{meta.label}</Text>
                  <Text style={styles.author}>{author?.displayName ?? "家族"}</Text>
                </View>
                {detail ? <Text style={styles.detail}>{detail}</Text> : null}
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    overflow: "hidden",
  },
  empty: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    gap: spacing.sm,
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
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.line,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  time: {
    width: 52,
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "600",
    paddingTop: 10,
  },
  track: {
    flex: 1,
    flexDirection: "row",
    gap: spacing.md,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  typeLabel: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "600",
  },
  author: {
    color: palette.textSoft,
    fontSize: 12,
  },
  detail: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
