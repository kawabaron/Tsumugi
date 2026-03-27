import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { palette, spacing } from "@/constants/theme";

type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export const SectionTitle = ({
  eyebrow,
  title,
  description,
  action,
}: SectionTitleProps) => (
  <View style={styles.row}>
    <View style={styles.copy}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
    {action}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  eyebrow: {
    color: palette.textSoft,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: {
    color: palette.text,
    fontSize: 24,
    fontWeight: "700",
  },
  description: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
