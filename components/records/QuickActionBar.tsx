import { ScrollView, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { eventMeta, palette, radii, spacing } from "@/constants/theme";
import { RecordEventType } from "@/types/domain";

type QuickActionBarProps = {
  actions: RecordEventType[];
  accentColor: string;
  onPress: (type: RecordEventType) => void;
};

export const QuickActionBar = ({
  actions,
  accentColor,
  onPress,
}: QuickActionBarProps) => (
  <View style={styles.wrapper}>
    <Text style={styles.heading}>Quick record</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.row}>
        {actions.map((type) => (
          <Pressable
            key={type}
            onPress={() => onPress(type)}
            style={[styles.action, { borderColor: `${accentColor}33` }]}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${eventMeta[type].tint}18` }]}>
              <MaterialCommunityIcons
                color={eventMeta[type].tint}
                name={eventMeta[type].icon as never}
                size={22}
              />
            </View>
            <Text style={styles.label}>{eventMeta[type].shortLabel}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  heading: {
    color: palette.textSoft,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  action: {
    minWidth: 92,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    borderWidth: 1,
    gap: 10,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "600",
  },
});
