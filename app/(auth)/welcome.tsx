import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { Screen } from "@/components/Screen";
import { palette, radii, spacing } from "@/constants/theme";

export default function WelcomeScreen() {
  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Tsumugi</Text>
        <Text style={styles.title}>夫婦でつながる、育児のタイムライン。</Text>
        <Text style={styles.body}>
          片手で素早く記録し、その日の流れを美しく整理。Siri ショートカットからの記録にも対応した、共有前提の育児記録アプリです。
        </Text>
      </View>

      <View style={styles.featureList}>
        {[
          "1日単位の見やすいタイムライン",
          "ミルク・排泄・睡眠・メモをすばやく記録",
          "招待コードで夫婦共有",
          "テーマカラーや表示密度のカスタム",
          "Siri / ショートカット導線を用意",
        ].map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <View style={styles.dot} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <Pressable onPress={() => router.push("/(auth)/sign-in")} style={styles.primaryButton}>
        <Text style={styles.primaryText}>はじめる</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingTop: 56,
  },
  hero: {
    gap: spacing.md,
  },
  eyebrow: {
    color: palette.textSoft,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  title: {
    color: palette.text,
    fontSize: 38,
    lineHeight: 48,
    fontWeight: "700",
  },
  body: {
    color: palette.textMuted,
    fontSize: 16,
    lineHeight: 26,
  },
  featureList: {
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: palette.textSoft,
  },
  featureText: {
    color: palette.text,
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: palette.text,
    borderRadius: radii.pill,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
