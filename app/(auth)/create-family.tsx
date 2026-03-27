import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";

import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { palette, radii, spacing } from "@/constants/theme";
import { useSessionActions } from "@/hooks/use-app-data";
import { useAppStore } from "@/store/app-store";

export default function CreateFamilyScreen() {
  const [familyName, setFamilyName] = useState("Tsumugi Family");
  const session = useAppStore((state) => state.session);
  const { createFamily } = useSessionActions();

  const submit = async () => {
    if (!session.currentUserId) {
      return;
    }
    try {
      await createFamily.mutateAsync({
        userId: session.currentUserId,
        familyName,
      });
      router.replace("/(auth)/child-setup");
    } catch (error) {
      Alert.alert("Tsumugi", error instanceof Error ? error.message : "家族作成に失敗しました。");
    }
  };

  return (
    <Screen>
      <SectionTitle
        eyebrow="Family"
        title="共有する家族グループを作成"
        description="1 家庭 = 1 グループの MVP 仕様です。後から招待コードでパートナーを追加できます。"
      />

      <View style={styles.field}>
        <Text style={styles.label}>グループ名</Text>
        <TextInput
          value={familyName}
          onChangeText={setFamilyName}
          placeholder="例: つむぎの家"
          placeholderTextColor={palette.textSoft}
          style={styles.input}
        />
      </View>

      <View style={styles.note}>
        <Text style={styles.noteTitle}>共有の考え方</Text>
        <Text style={styles.noteBody}>
          招待コードを使えば、同じタイムラインをパートナーと確認できます。記録者名も自動で表示されます。
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={submit} style={styles.primaryButton}>
          <Text style={styles.primaryText}>グループを作成</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/(auth)/join-family")} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>招待コードで参加する</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  label: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    color: palette.text,
  },
  note: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: 6,
  },
  noteTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "700",
  },
  noteBody: {
    color: palette.textMuted,
    lineHeight: 20,
  },
  actions: {
    gap: spacing.md,
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
  secondaryButton: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.line,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: palette.surface,
  },
  secondaryText: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "600",
  },
});
