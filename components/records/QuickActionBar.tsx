import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { eventMeta, palette, radii, spacing } from "@/constants/theme";
import { RecordEventType } from "@/types/domain";

type QuickActionBarProps = {
  actions: RecordEventType[];
  accentColor: string;
  onPress: (type: RecordEventType) => void;
};

export const QuickActionBar = ({ actions, accentColor, onPress }: QuickActionBarProps) => (
  <View style={styles.wrapper}>
    <Text style={styles.heading}>記録</Text>

    <View style={styles.row}>
      {actions.map((type) => (
        <Pressable
          key={type}
          onPress={() => onPress(type)}
          style={[styles.action, { borderColor: `${accentColor}1A` }]}
        >
          <View style={[styles.iconWrap, { backgroundColor: `${eventMeta[type].tint}18` }]}>
            <MaterialCommunityIcons
              color={eventMeta[type].tint}
              name={eventMeta[type].icon as never}
              size={16}
            />
          </View>
          <Text style={styles.label}>{eventMeta[type].shortLabel}</Text>
        </Pressable>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    gap: 4,
  },
  heading: {
    color: palette.textSoft,
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 6,
  },
  action: {
    flex: 1,
    paddingHorizontal: 7,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: palette.surface,
    borderWidth: 1,
    gap: 5,
    alignItems: "center",
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: palette.text,
    fontSize: 9,
    fontWeight: "700",
    textAlign: "center",
  },
});
