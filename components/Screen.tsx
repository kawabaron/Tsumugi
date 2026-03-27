import { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { palette, spacing } from "@/constants/theme";

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
}>;

export const Screen = ({
  children,
  scroll = true,
  contentContainerStyle,
  style,
}: ScreenProps) => {
  if (!scroll) {
    return (
      <SafeAreaView style={[styles.safeArea, style]}>
        <View style={[styles.inner, contentContainerStyle]}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <ScrollView
        contentContainerStyle={[styles.inner, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  inner: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
});
