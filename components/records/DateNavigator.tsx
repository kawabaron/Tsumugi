import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { palette, radii, spacing } from "@/constants/theme";
import { formatHeaderDate, todayKey } from "@/lib/date";

type DateNavigatorProps = {
  date: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  accentColor: string;
};

export const DateNavigator = ({
  date,
  onPrevious,
  onNext,
  onToday,
  accentColor,
}: DateNavigatorProps) => {
  const isToday = date === todayKey();

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.label}>Daily timeline</Text>
        <Text style={styles.date}>{formatHeaderDate(date)}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={onPrevious} style={styles.iconButton}>
          <MaterialCommunityIcons color={palette.text} name="chevron-left" size={22} />
        </Pressable>
        <Pressable onPress={onToday} style={[styles.todayButton, { borderColor: accentColor }]}>
          <Text style={[styles.todayText, isToday && { color: accentColor }]}>今日</Text>
        </Pressable>
        <Pressable onPress={onNext} style={styles.iconButton}>
          <MaterialCommunityIcons color={palette.text} name="chevron-right" size={22} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  label: {
    color: palette.textSoft,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  date: {
    color: palette.text,
    fontSize: 26,
    fontWeight: "700",
    marginTop: 6,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: palette.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.line,
  },
  todayButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.pill,
    backgroundColor: palette.surface,
    borderWidth: 1,
  },
  todayText: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
});
