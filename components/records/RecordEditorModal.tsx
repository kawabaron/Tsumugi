import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { eventMeta, palette, radii, spacing } from "@/constants/theme";
import { combineDateAndTime, timeInputFromIso } from "@/lib/date";
import { RecordEvent, RecordEventType } from "@/types/domain";

type DraftRecord = {
  type: RecordEventType;
  time: string;
  amountMl: string;
  note: string;
};

type RecordEditorModalProps = {
  visible: boolean;
  mode: "create" | "edit";
  date: string;
  record?: RecordEvent | null;
  defaultType?: RecordEventType;
  accentColor: string;
  onClose: () => void;
  onSave: (input: { type: RecordEventType; timestamp: string; amountMl?: number; note?: string }) => void;
  onDelete?: () => void;
};

const createDraft = (
  date: string,
  record?: RecordEvent | null,
  defaultType: RecordEventType = "milk"
): DraftRecord => ({
  type: record?.type ?? defaultType,
  time: record ? timeInputFromIso(record.timestamp) : "12:00",
  amountMl: record?.amountMl ? String(record.amountMl) : "",
  note: record?.note ?? "",
});

export const RecordEditorModal = ({
  visible,
  mode,
  date,
  record,
  defaultType = "milk",
  accentColor,
  onClose,
  onSave,
  onDelete,
}: RecordEditorModalProps) => {
  const [draft, setDraft] = useState<DraftRecord>(() => createDraft(date, record, defaultType));

  useEffect(() => {
    if (visible) {
      setDraft(createDraft(date, record, defaultType));
    }
  }, [date, defaultType, record, visible]);

  const type = draft.type;
  const meta = eventMeta[type];
  const needsAmount = type === "milk";
  const needsNote = type === "memo" || mode === "edit";
  const title = mode === "create" ? `${meta.label}を追加` : `${meta.label}を編集`;

  const saveDisabled = useMemo(() => {
    if (!draft.time.match(/^\d{2}:\d{2}$/)) {
      return true;
    }
    if (needsAmount && !draft.amountMl.trim()) {
      return true;
    }
    if (type === "memo" && !draft.note.trim()) {
      return true;
    }
    return false;
  }, [draft.amountMl, draft.note, draft.time, needsAmount, type]);

  return (
    <Modal animationType="slide" visible={visible} transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>記録時刻は 24 時間表記で入力できます。</Text>

          <View style={styles.field}>
            <Text style={styles.label}>種別</Text>
            <View style={styles.typeWrap}>
              <Text style={[styles.typeChip, { borderColor: `${meta.tint}44`, color: meta.tint }]}>
                {meta.label}
              </Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>時刻</Text>
            <TextInput
              value={draft.time}
              onChangeText={(time) => setDraft((current) => ({ ...current, time }))}
              placeholder="12:00"
              placeholderTextColor={palette.textSoft}
              style={styles.input}
            />
          </View>

          {needsAmount ? (
            <View style={styles.field}>
              <Text style={styles.label}>量 (ml)</Text>
              <TextInput
                value={draft.amountMl}
                onChangeText={(amountMl) => setDraft((current) => ({ ...current, amountMl }))}
                keyboardType="number-pad"
                placeholder="120"
                placeholderTextColor={palette.textSoft}
                style={styles.input}
              />
            </View>
          ) : null}

          {needsNote ? (
            <View style={styles.field}>
              <Text style={styles.label}>メモ</Text>
              <TextInput
                value={draft.note}
                onChangeText={(note) => setDraft((current) => ({ ...current, note }))}
                placeholder="任意で入力"
                placeholderTextColor={palette.textSoft}
                multiline
                style={[styles.input, styles.textArea]}
              />
            </View>
          ) : null}

          <View style={styles.footer}>
            {mode === "edit" && onDelete ? (
              <Pressable onPress={onDelete} style={styles.deleteButton}>
                <Text style={styles.deleteText}>削除</Text>
              </Pressable>
            ) : <View />}
            <View style={styles.actions}>
              <Pressable onPress={onClose} style={styles.secondaryButton}>
                <Text style={styles.secondaryText}>閉じる</Text>
              </Pressable>
              <Pressable
                disabled={saveDisabled}
                onPress={() =>
                  onSave({
                    type,
                    timestamp: combineDateAndTime(date, draft.time),
                    amountMl: needsAmount ? Number(draft.amountMl) : undefined,
                    note: draft.note.trim() ? draft.note.trim() : undefined,
                  })
                }
                style={[
                  styles.primaryButton,
                  { backgroundColor: accentColor },
                  saveDisabled && styles.disabledButton,
                ]}
              >
                <Text style={styles.primaryText}>保存</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(27, 21, 12, 0.22)",
  },
  sheet: {
    backgroundColor: palette.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: radii.pill,
    backgroundColor: palette.line,
    alignSelf: "center",
  },
  title: {
    color: palette.text,
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "600",
  },
  typeWrap: {
    flexDirection: "row",
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    backgroundColor: palette.background,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    color: palette.text,
    fontSize: 16,
    backgroundColor: palette.background,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.line,
  },
  secondaryText: {
    color: palette.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  deleteText: {
    color: palette.danger,
    fontSize: 14,
    fontWeight: "700",
  },
  primaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radii.pill,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.5,
  },
});
