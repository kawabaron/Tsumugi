import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";

import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { SettingSection } from "@/components/settings/SettingSection";
import { defaultVisibleTypes, eventMeta, palette, radii, spacing, themeOptions } from "@/constants/theme";
import { useAppContextQuery, useSessionActions, useSettingsActions } from "@/hooks/use-app-data";
import { birthDateInput } from "@/lib/date";
import { RecordEventType, TimelineDensity } from "@/types/domain";

export default function SettingsScreen() {
  const { data: context } = useAppContextQuery();
  const { saveSettings, updateChildProfile } = useSettingsActions();
  const { signOut } = useSessionActions();
  const [childName, setChildName] = useState(context?.childProfile?.name ?? "");
  const [childBirthDate, setChildBirthDate] = useState(
    birthDateInput(context?.childProfile?.birthDate)
  );

  const settings = context?.settings;
  const accentColor = settings?.themeColor ?? palette.text;

  const applySettings = async (input: Partial<NonNullable<typeof settings>>) => {
    if (!context?.currentUser) {
      return;
    }
    try {
      await saveSettings.mutateAsync({
        userId: context.currentUser.id,
        input,
      });
    } catch (error) {
      Alert.alert("Tsumugi", error instanceof Error ? error.message : "設定保存に失敗しました。");
    }
  };

  const reorderActions = (type: RecordEventType, direction: -1 | 1) => {
    if (!settings) {
      return;
    }
    const next = [...settings.quickActionOrder];
    const index = next.indexOf(type);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= next.length) {
      return;
    }
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    applySettings({ quickActionOrder: next });
  };

  const toggleVisibleType = (type: RecordEventType) => {
    if (!settings) {
      return;
    }
    const visible = settings.visibleRecordTypes.includes(type);
    const next = visible
      ? settings.visibleRecordTypes.filter((item) => item !== type)
      : [...settings.visibleRecordTypes, type];
    applySettings({ visibleRecordTypes: next.length ? next : defaultVisibleTypes });
  };

  const densityOptions = useMemo(
    () =>
      [
        { label: "広め", value: "comfortable" },
        { label: "標準", value: "standard" },
        { label: "詰め気味", value: "compact" },
      ] as { label: string; value: TimelineDensity }[],
    []
  );

  useEffect(() => {
    setChildName(context?.childProfile?.name ?? "");
    setChildBirthDate(birthDateInput(context?.childProfile?.birthDate));
  }, [context?.childProfile?.birthDate, context?.childProfile?.name]);

  return (
    <Screen>
      <SectionTitle
        eyebrow="Customize"
        title="設定"
        description="見た目・入力動作・共有・Siri 導線をここで整えられます。"
      />

      <SettingSection title="子ども情報" description="プロフィールの最小編集">
        <TextInput
          value={childName}
          onChangeText={setChildName}
          placeholder="名前"
          placeholderTextColor={palette.textSoft}
          style={styles.input}
        />
        <TextInput
          value={childBirthDate}
          onChangeText={setChildBirthDate}
          placeholder="2025-10-01"
          placeholderTextColor={palette.textSoft}
          style={styles.input}
        />
        <Pressable
          onPress={async () => {
            if (!context?.childProfile) {
              return;
            }
            await updateChildProfile.mutateAsync({
              childId: context.childProfile.id,
              input: {
                name: childName,
                birthDate: childBirthDate,
              },
            });
          }}
          style={[styles.primaryButton, { backgroundColor: accentColor }]}
        >
          <Text style={styles.primaryText}>プロフィールを更新</Text>
        </Pressable>
      </SettingSection>

      <SettingSection title="表示カスタム" description="テーマとタイムラインの見え方">
        <Text style={styles.subLabel}>テーマカラー</Text>
        <View style={styles.themeRow}>
          {themeOptions.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => applySettings({ themeColor: option.value })}
              style={[
                styles.themeChip,
                {
                  borderColor:
                    settings?.themeColor === option.value ? option.value : palette.line,
                },
              ]}
            >
              <View style={[styles.themeDot, { backgroundColor: option.value }]} />
              <Text style={styles.themeText}>{option.name}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.subLabel}>表示密度</Text>
        <View style={styles.segment}>
          {densityOptions.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => applySettings({ timelineDensity: option.value })}
              style={[
                styles.segmentButton,
                settings?.timelineDensity === option.value && styles.segmentButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  settings?.timelineDensity === option.value && styles.segmentTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.subLabel}>表示する記録種別</Text>
        {Object.keys(eventMeta).map((type) => {
          const key = type as RecordEventType;
          return (
            <View key={type} style={styles.row}>
              <Text style={styles.rowLabel}>{eventMeta[key].label}</Text>
              <Switch
                value={settings?.visibleRecordTypes.includes(key) ?? true}
                onValueChange={() => toggleVisibleType(key)}
                trackColor={{ true: `${accentColor}66`, false: palette.line }}
                thumbColor={palette.surface}
              />
            </View>
          );
        })}
      </SettingSection>

      <SettingSection title="入力カスタム" description="クイック操作の体験を調整">
        <View style={styles.row}>
          <Text style={styles.rowLabel}>1 タップ記録</Text>
          <Switch
            value={settings?.enableOneTapRecord ?? true}
            onValueChange={(value) => applySettings({ enableOneTapRecord: value })}
            trackColor={{ true: `${accentColor}66`, false: palette.line }}
            thumbColor={palette.surface}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>記録前の確認</Text>
          <Switch
            value={settings?.enableConfirmBeforeSave ?? false}
            onValueChange={(value) => applySettings({ enableConfirmBeforeSave: value })}
            trackColor={{ true: `${accentColor}66`, false: palette.line }}
            thumbColor={palette.surface}
          />
        </View>

        <Text style={styles.subLabel}>クイックボタン順</Text>
        {settings?.quickActionOrder.map((type) => (
          <View key={type} style={styles.reorderRow}>
            <Text style={styles.rowLabel}>{eventMeta[type].label}</Text>
            <View style={styles.reorderActions}>
              <Pressable onPress={() => reorderActions(type, -1)} style={styles.reorderButton}>
                <Text style={styles.reorderText}>上へ</Text>
              </Pressable>
              <Pressable onPress={() => reorderActions(type, 1)} style={styles.reorderButton}>
                <Text style={styles.reorderText}>下へ</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </SettingSection>

      <SettingSection title="共有" description="招待コードとメンバー">
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>招待コード</Text>
          <Text style={[styles.infoValue, { color: accentColor }]}>
            {context?.familyGroup?.inviteCode ?? "----"}
          </Text>
        </View>
        {(context?.members ?? []).map((member) => (
          <View key={member.id} style={styles.memberRow}>
            <View>
              <Text style={styles.rowLabel}>{member.displayName}</Text>
              <Text style={styles.memberMeta}>{member.role === "owner" ? "Owner" : "Member"}</Text>
            </View>
            <Text style={styles.memberMeta}>{member.email ?? ""}</Text>
          </View>
        ))}
      </SettingSection>

      <SettingSection title="Siri / ショートカット" description="定型フレーズ中心の MVP 実装">
        {[
          "ミルクを記録",
          "おしっこを記録",
          "うんちを記録",
          "ねんね開始を記録",
          "ねんね終了を記録",
        ].map((phrase) => (
          <View key={phrase} style={styles.shortcutRow}>
            <Text style={styles.rowLabel}>{phrase}</Text>
          </View>
        ))}
        <Text style={styles.helper}>
          `tsumugi://shortcut?type=pee` のようなディープリンクで共通保存ロジックへ流す構成です。iOS 側の App Intents サンプルも同梱しています。
        </Text>
      </SettingSection>

      <SettingSection title="その他">
        <Pressable
          onPress={async () => {
            await signOut.mutateAsync();
            router.replace("/(auth)/welcome");
          }}
          style={styles.logoutButton}
        >
          <Text style={styles.logoutText}>サインアウト</Text>
        </Pressable>
      </SettingSection>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    color: palette.text,
  },
  primaryButton: {
    borderRadius: radii.pill,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  subLabel: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  themeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  themeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    backgroundColor: palette.background,
  },
  themeDot: {
    width: 14,
    height: 14,
    borderRadius: radii.pill,
  },
  themeText: {
    color: palette.text,
    fontWeight: "600",
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
    paddingVertical: 10,
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 4,
  },
  rowLabel: {
    flex: 1,
    color: palette.text,
    fontSize: 15,
  },
  reorderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  reorderActions: {
    flexDirection: "row",
    gap: 8,
  },
  reorderButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.background,
  },
  reorderText: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: palette.background,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 4,
  },
  infoLabel: {
    color: palette.textSoft,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 2,
  },
  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 4,
  },
  memberMeta: {
    color: palette.textSoft,
    fontSize: 12,
  },
  shortcutRow: {
    paddingVertical: 4,
  },
  helper: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  logoutButton: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.background,
  },
  logoutText: {
    color: palette.danger,
    fontSize: 15,
    fontWeight: "700",
  },
});
