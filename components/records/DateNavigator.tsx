import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import dayjs from "dayjs";

import { palette, radii, spacing } from "@/constants/theme";
import { todayKey } from "@/lib/date";

type DateNavigatorProps = {
  date: string;
  onPrevious: () => void;
  onNext: () => void;
  onOpenCalendar: () => void;
  accentColor: string;
};

export const DateNavigator = ({
  date,
  onPrevious,
  onNext,
  onOpenCalendar,
  accentColor,
}: DateNavigatorProps) => {
  const isToday = date === todayKey();

  return (
    <View style={styles.shell}>
      <Pressable onPress={onOpenCalendar} style={styles.dateButton}>
        <MaterialCommunityIcons
          color={isToday ? accentColor : palette.textMuted}
          name="calendar-month-outline"
          size={15}
        />
        <Text style={styles.dateText}>{dayjs(date).format("YYYY年M月D日")}</Text>
      </Pressable>

      <View style={styles.actions}>
        <Pressable accessibilityRole="button" onPress={onPrevious} style={styles.iconButton}>
          <MaterialCommunityIcons color={palette.text} name="chevron-left" size={18} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={isToday}
          onPress={onNext}
          style={[styles.iconButton, isToday && styles.iconButtonDisabled]}
        >
          <MaterialCommunityIcons
            color={isToday ? palette.textSoft : palette.text}
            name="chevron-right"
            size={18}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 38,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: "rgba(139, 121, 92, 0.12)",
  },
  dateText: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    backgroundColor: palette.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(139, 121, 92, 0.12)",
  },
  iconButtonDisabled: {
    opacity: 0.45,
  },
});
