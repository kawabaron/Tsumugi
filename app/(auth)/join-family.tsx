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

export default function JoinFamilyScreen() {
  const [inviteCode, setInviteCode] = useState("");
  const session = useAppStore((state) => state.session);
  const { joinFamily } = useSessionActions();

  const submit = async () => {
    if (!session.currentUserId) {
      return;
    }
    try {
      await joinFamily.mutateAsync({
        userId: session.currentUserId,
        inviteCode,
      });
      router.replace("/");
    } catch (error) {
      Alert.alert("Tsumugi", error instanceof Error ? error.message : "参加に失敗しました。");
    }
  };

  return (
    <Screen>
      <SectionTitle
        eyebrow="Invite"
        title="招待コードで家族グループに参加"
        description="6 桁のコードを入力すると、同じタイムラインに接続されます。"
      />

      <View style={styles.field}>
        <Text style={styles.label}>招待コード</Text>
        <TextInput
          value={inviteCode}
          onChangeText={(value) => setInviteCode(value.toUpperCase())}
          autoCapitalize="characters"
          placeholder="ABC123"
          placeholderTextColor={palette.textSoft}
          style={styles.input}
        />
      </View>

      <Pressable onPress={submit} style={styles.primaryButton}>
        <Text style={styles.primaryText}>参加する</Text>
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
    fontSize: 18,
    letterSpacing: 3,
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
