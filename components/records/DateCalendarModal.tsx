import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import dayjs from "dayjs";

import { palette, radii, spacing } from "@/constants/theme";
import { todayKey } from "@/lib/date";

type DateCalendarModalProps = {
  visible: boolean;
  date: string;
  accentColor: string;
  onClose: () => void;
  onSelectDate: (date: string) => void;
};

const weekdayLabels = ["日", "月", "火", "水", "木", "金", "土"];

export const DateCalendarModal = ({
  visible,
  date,
  accentColor,
  onClose,
  onSelectDate,
}: DateCalendarModalProps) => {
  const [displayMonth, setDisplayMonth] = useState(() => dayjs(date).startOf("month"));

  useEffect(() => {
    if (visible) {
      setDisplayMonth(dayjs(date).startOf("month"));
    }
  }, [date, visible]);

  const days = useMemo(() => {
    const start = displayMonth.startOf("month").startOf("week");
    return Array.from({ length: 42 }, (_, index) => start.add(index, "day"));
  }, [displayMonth]);

  const selectedDate = dayjs(date).format("YYYY-MM-DD");
  const today = todayKey();
  const isCurrentDisplayMonth = displayMonth.isSame(dayjs(today), "month");

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.card}>
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setDisplayMonth((current) => current.subtract(1, "month"))}
              style={styles.iconButton}
            >
              <MaterialCommunityIcons color={palette.text} name="chevron-left" size={22} />
            </Pressable>
            <Text style={styles.title}>{displayMonth.format("YYYY年M月")}</Text>
            <Pressable
              accessibilityRole="button"
              disabled={isCurrentDisplayMonth}
              onPress={() => setDisplayMonth((current) => current.add(1, "month"))}
              style={[styles.iconButton, isCurrentDisplayMonth && styles.iconButtonDisabled]}
            >
              <MaterialCommunityIcons
                color={isCurrentDisplayMonth ? palette.textSoft : palette.text}
                name="chevron-right"
                size={22}
              />
            </Pressable>
          </View>

          <View style={styles.weekdays}>
            {weekdayLabels.map((weekday) => (
              <Text key={weekday} style={styles.weekday}>
                {weekday}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {days.map((day) => {
              const dayKey = day.format("YYYY-MM-DD");
              const isCurrentMonth = day.month() === displayMonth.month();
              const isSelected = dayKey === selectedDate;
              const isToday = dayKey === today;
              const isFuture = day.isAfter(dayjs(today), "day");

              return (
                <Pressable
                  key={dayKey}
                  disabled={isFuture}
                  onPress={() => onSelectDate(dayKey)}
                  style={[
                    styles.dayButton,
                    isSelected && { backgroundColor: accentColor, borderColor: accentColor },
                    isToday && !isSelected && { borderColor: accentColor },
                    isFuture && styles.dayButtonDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayLabel,
                      !isCurrentMonth && styles.dayLabelMuted,
                      isSelected && styles.dayLabelSelected,
                      isToday && !isSelected && { color: accentColor },
                      isFuture && styles.dayLabelMuted,
                    ]}
                  >
                    {day.date()}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.footer}>
            <Pressable
              onPress={() => onSelectDate(today)}
              style={[styles.todayButton, { borderColor: accentColor }]}
            >
              <Text style={[styles.todayText, { color: accentColor }]}>今日へ</Text>
            </Pressable>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>閉じる</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    backgroundColor: "rgba(27, 21, 12, 0.22)",
  },
  card: {
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.line,
  },
  iconButtonDisabled: {
    opacity: 0.45,
  },
  title: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "700",
  },
  weekdays: {
    flexDirection: "row",
  },
  weekday: {
    flex: 1,
    textAlign: "center",
    color: palette.textSoft,
    fontSize: 12,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dayButton: {
    width: "12.45%",
    aspectRatio: 1,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: palette.background,
  },
  dayButtonDisabled: {
    opacity: 0.45,
  },
  dayLabel: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "600",
  },
  dayLabelMuted: {
    color: palette.textSoft,
  },
  dayLabelSelected: {
    color: "#FFFFFF",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  todayText: {
    fontSize: 14,
    fontWeight: "700",
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radii.pill,
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.line,
  },
  closeText: {
    color: palette.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
});
