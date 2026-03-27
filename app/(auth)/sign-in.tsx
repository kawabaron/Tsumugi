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
import { AuthProvider } from "@/types/domain";

export default function SignInScreen() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [provider, setProvider] = useState<AuthProvider>("email");
  const { signIn } = useSessionActions();

  const submit = async () => {
    if (!displayName.trim()) {
      Alert.alert("Tsumugi", "表示名を入力してください。");
      return;
    }
    try {
      await signIn.mutateAsync({
        displayName,
        email: email.trim() || undefined,
        provider,
      });
      router.replace("/(auth)/create-family");
    } catch (error) {
      Alert.alert("Tsumugi", error instanceof Error ? error.message : "登録に失敗しました。");
    }
  };

  return (
    <Screen>
      <SectionTitle
        eyebrow="Account"
        title="最初に、あなたの情報を登録"
        description="MVP では軽量な疑似サインインで進めます。後から Firebase Authentication へ差し替えやすい構成です。"
      />

      <View style={styles.form}>
        <View style={styles.segment}>
          {(["email", "apple"] as AuthProvider[]).map((item) => (
            <Pressable
              key={item}
              onPress={() => setProvider(item)}
              style={[
                styles.segmentButton,
                provider === item && styles.segmentButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  provider === item && styles.segmentTextActive,
                ]}
              >
                {item === "email" ? "メール" : "Apple"}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>表示名</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="例: みほ"
            placeholderTextColor={palette.textSoft}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>メールアドレス</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="name@example.com"
            placeholderTextColor={palette.textSoft}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
        </View>
      </View>

      <Pressable onPress={submit} style={styles.primaryButton}>
        <Text style={styles.primaryText}>次へ進む</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  segment: {
    flexDirection: "row",
    backgroundColor: palette.surfaceMuted,
    padding: 4,
    borderRadius: radii.pill,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.pill,
    alignItems: "center",
  },
  segmentButtonActive: {
    backgroundColor: palette.surface,
  },
  segmentText: {
    color: palette.textMuted,
    fontWeight: "600",
  },
  segmentTextActive: {
    color: palette.text,
  },
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
