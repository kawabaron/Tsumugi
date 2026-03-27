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

export default function ChildSetupScreen() {
  const session = useAppStore((state) => state.session);
  const { createChild } = useSessionActions();
  const [name, setName] = useState("つむぎ");
  const [birthDate, setBirthDate] = useState("2025-10-01");
  const [sex, setSex] = useState<"male" | "female" | "other">("female");

  const submit = async () => {
    if (!session.currentFamilyGroupId) {
      return;
    }
    try {
      await createChild.mutateAsync({
        familyGroupId: session.currentFamilyGroupId,
        name,
        birthDate,
        sex,
      });
      router.replace("/(tabs)/records");
    } catch (error) {
      Alert.alert(
        "Tsumugi",
        error instanceof Error ? error.message : "プロフィール作成に失敗しました。"
      );
    }
  };

  return (
    <Screen>
      <SectionTitle
        eyebrow="Child"
        title="子どものプロフィールを登録"
        description="MVP では 1 グループ 1 人前提ですが、すべての記録に childId を保持する構造にしてあります。"
      />

      <View style={styles.field}>
        <Text style={styles.label}>名前</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="つむぎ"
          placeholderTextColor={palette.textSoft}
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>生年月日</Text>
        <TextInput
          value={birthDate}
          onChangeText={setBirthDate}
          placeholder="2025-10-01"
          placeholderTextColor={palette.textSoft}
          style={styles.input}
        />
      </View>

      <View style={styles.segment}>
        {(["female", "male", "other"] as const).map((value) => (
          <Pressable
            key={value}
            onPress={() => setSex(value)}
            style={[styles.segmentButton, sex === value && styles.segmentButtonActive]}
          >
            <Text style={[styles.segmentText, sex === value && styles.segmentTextActive]}>
              {value === "female" ? "女の子" : value === "male" ? "男の子" : "その他"}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.note}>
        <Text style={styles.noteTitle}>Siri 対応</Text>
        <Text style={styles.noteBody}>
          セットアップ完了後、設定タブから「ミルクを記録」「おしっこを記録」などのショートカット導線を確認できます。
        </Text>
      </View>

      <Pressable onPress={submit} style={styles.primaryButton}>
        <Text style={styles.primaryText}>アプリを始める</Text>
      </Pressable>
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
  segment: {
    flexDirection: "row",
    gap: 8,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surface,
    alignItems: "center",
  },
  segmentButtonActive: {
    backgroundColor: palette.surfaceMuted,
  },
  segmentText: {
    color: palette.textMuted,
    fontWeight: "600",
  },
  segmentTextActive: {
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
