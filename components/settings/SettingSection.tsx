import { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";

import { palette, radii, spacing } from "@/constants/theme";

type SettingSectionProps = PropsWithChildren<{
  title: string;
  description?: string;
}>;

export const SettingSection = ({
  title,
  description,
  children,
}: SettingSectionProps) => (
  <View style={styles.section}>
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
    <View style={styles.body}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.line,
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: 4,
  },
  title: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "700",
  },
  description: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
});
