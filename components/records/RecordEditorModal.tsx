import { useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  eventMeta,
  palette,
  poopAmountOptions,
  poopColorOptions,
  poopHardnessOptions,
  radii,
  spacing,
} from "@/constants/theme";
import { combineDateAndTime, currentTimeKey, timeInputFromIso } from "@/lib/date";
import {
  PoopAmount,
  PoopColor,
  PoopHardness,
  RecordEvent,
  RecordEventType,
  TimeMinuteInterval,
} from "@/types/domain";
import { WheelPicker } from "@/components/records/WheelPicker";

type DraftRecord = {
  type: RecordEventType;
  hour: number;
  minute: number;
  endHour: number;
  endMinute: number;
  amountMl: number;
  poopAmount?: PoopAmount;
  poopHardness?: PoopHardness;
  poopColor?: PoopColor;
  note: string;
};

type RecordEditorModalProps = {
  visible: boolean;
  mode: "create" | "edit";
  date: string;
  record?: RecordEvent | null;
  relatedRecord?: RecordEvent | null;
  defaultType?: RecordEventType;
  minuteInterval: TimeMinuteInterval;
  accentColor: string;
  onClose: () => void;
  onSave: (input: {
    type: RecordEventType;
    timestamp: string;
    sleepEndTimestamp?: string;
    amountMl?: number;
    poopAmount?: PoopAmount;
    poopHardness?: PoopHardness;
    poopColor?: PoopColor;
    note?: string;
  }) => void;
  onDelete?: () => void;
};

const createDraft = (
  record?: RecordEvent | null,
  defaultType: RecordEventType = "milk",
  relatedRecord?: RecordEvent | null
): DraftRecord => {
  const [hourString, minuteString] = (record
    ? timeInputFromIso(record.timestamp)
    : currentTimeKey()
  ).split(":");
  const [endHourString, endMinuteString] = (relatedRecord
    ? timeInputFromIso(relatedRecord.timestamp)
    : currentTimeKey()
  ).split(":");

  return {
    type: record?.type ?? defaultType,
    hour: Number(hourString),
    minute: Number(minuteString),
    endHour: Number(endHourString),
    endMinute: Number(endMinuteString),
    amountMl: record?.amountMl ?? 120,
    poopAmount: record?.poopAmount,
    poopHardness: record?.poopHardness,
    poopColor: record?.poopColor,
    note: record?.note ?? "",
  };
};

const hourValues = Array.from({ length: 24 }, (_, index) => index);
const amountValues = Array.from({ length: 40 }, (_, index) => (index + 1) * 10);

const clampMinute = (minute: number) => Math.min(Math.max(minute, 0), 59);

const snapMinuteToInterval = (minute: number, interval: TimeMinuteInterval) => {
  if (interval === 1) {
    return clampMinute(minute);
  }
  const snapped = Math.round(minute / interval) * interval;
  return Math.min(Math.max(snapped, 0), 60 - interval);
};

export const RecordEditorModal = ({
  visible,
  mode,
  date,
  record,
  relatedRecord,
  defaultType = "milk",
  minuteInterval,
  accentColor,
  onClose,
  onSave,
  onDelete,
}: RecordEditorModalProps) => {
  const [draft, setDraft] = useState<DraftRecord>(() =>
    createDraft(record, defaultType, relatedRecord)
  );
  const [noteFocused, setNoteFocused] = useState(false);
  const [activePicker, setActivePicker] = useState<null | "start_time" | "end_time" | "amount">(
    null
  );
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const noteInputRef = useRef<TextInput>(null);
  const bodyScrollRef = useRef<ScrollView>(null);
  const selectedPoopColorOption =
    poopColorOptions.find((option) => option.value === draft.poopColor) ?? null;

  useEffect(() => {
    if (visible) {
      setDraft(createDraft(record, defaultType, relatedRecord));
      setNoteFocused(false);
      setActivePicker(null);
      setKeyboardHeight(0);
    }
  }, [defaultType, record, relatedRecord, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
      requestAnimationFrame(() => {
        bodyScrollRef.current?.scrollToEnd({ animated: true });
      });
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [visible]);

  const minuteValues = useMemo(
    () => Array.from({ length: Math.floor(60 / minuteInterval) }, (_, index) => index * minuteInterval),
    [minuteInterval]
  );

  const type = draft.type;
  const meta = eventMeta[type];
  const needsAmount = type === "milk";
  const needsPoopDetails = type === "poop";
  const needsNote = type === "milk" || type === "memo" || mode === "edit";
  const isSleepPair = type === "sleep_start" && relatedRecord?.type === "sleep_end";
  const title = isSleepPair
    ? "寝る・起きるを編集"
    : mode === "create"
      ? `${meta.label}を追加`
      : `${meta.label}を編集`;
  const snappedMinute = useMemo(
    () => snapMinuteToInterval(draft.minute, minuteInterval),
    [draft.minute, minuteInterval]
  );
  const snappedEndMinute = useMemo(
    () => snapMinuteToInterval(draft.endMinute, minuteInterval),
    [draft.endMinute, minuteInterval]
  );
  const displayTime = `${String(draft.hour).padStart(2, "0")}:${String(draft.minute).padStart(2, "0")}`;
  const displayEndTime = `${String(draft.endHour).padStart(2, "0")}:${String(draft.endMinute).padStart(2, "0")}`;
  const anyPickerVisible = activePicker !== null;

  const saveDisabled = useMemo(() => {
    if (needsAmount && !draft.amountMl) {
      return true;
    }
    if (type === "memo" && !draft.note.trim()) {
      return true;
    }
    return false;
  }, [draft.amountMl, draft.note, needsAmount, type]);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    noteInputRef.current?.blur();
  };

  const handleClose = () => {
    dismissKeyboard();
    onClose();
  };

  return (
    <Modal animationType="fade" visible={visible} transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[
          styles.backdrop,
          keyboardHeight > 0 ? styles.backdropWithKeyboard : null,
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>

          <ScrollView
            ref={bodyScrollRef}
            style={styles.body}
            scrollEnabled={!anyPickerVisible}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.content,
              styles.bodyContent,
              keyboardHeight > 0 ? styles.contentWithKeyboard : null,
            ]}
          >
            <View style={styles.field}>
              <Text style={styles.label}>{isSleepPair ? "寝る" : "時刻"}</Text>
              <Pressable
                onPress={() => {
                  dismissKeyboard();
                  setActivePicker((current) => (current === "start_time" ? null : "start_time"));
                }}
                style={[styles.timeButton, activePicker === "start_time" && styles.timeButtonActive]}
              >
                <View style={styles.timeButtonTextWrap}>
                  <Text style={styles.timeButtonValue}>{displayTime}</Text>
                </View>
                <Text style={styles.timeButtonAction}>
                  {activePicker === "start_time" ? "閉じる" : "変更"}
                </Text>
              </Pressable>

              {activePicker === "start_time" ? (
                <View style={styles.timePickerPanel}>
                  <View style={styles.timeRow}>
                    <WheelPicker
                      values={hourValues}
                      value={draft.hour}
                      onChange={(hour) => setDraft((current) => ({ ...current, hour }))}
                      formatValue={(hour) => `${String(hour).padStart(2, "0")}時`}
                    />
                    <WheelPicker
                      values={minuteValues}
                      value={snappedMinute}
                      onChange={(minute) => setDraft((current) => ({ ...current, minute }))}
                      formatValue={(minute) => `${String(minute).padStart(2, "0")}分`}
                    />
                  </View>
                </View>
              ) : null}
            </View>

            {isSleepPair ? (
              <View style={styles.field}>
                <Text style={styles.label}>起きる</Text>
                <Pressable
                  onPress={() => {
                    dismissKeyboard();
                    setActivePicker((current) => (current === "end_time" ? null : "end_time"));
                  }}
                  style={[styles.timeButton, activePicker === "end_time" && styles.timeButtonActive]}
                >
                  <View style={styles.timeButtonTextWrap}>
                    <Text style={styles.timeButtonValue}>{displayEndTime}</Text>
                  </View>
                  <Text style={styles.timeButtonAction}>
                    {activePicker === "end_time" ? "閉じる" : "変更"}
                  </Text>
                </Pressable>

                {activePicker === "end_time" ? (
                  <View style={styles.timePickerPanel}>
                    <View style={styles.timeRow}>
                      <WheelPicker
                        values={hourValues}
                        value={draft.endHour}
                        onChange={(endHour) => setDraft((current) => ({ ...current, endHour }))}
                        formatValue={(hour) => `${String(hour).padStart(2, "0")}時`}
                      />
                      <WheelPicker
                        values={minuteValues}
                        value={snappedEndMinute}
                        onChange={(endMinute) => setDraft((current) => ({ ...current, endMinute }))}
                        formatValue={(minute) => `${String(minute).padStart(2, "0")}分`}
                      />
                    </View>
                  </View>
                ) : null}
              </View>
            ) : null}

            {needsAmount ? (
              <View style={styles.field}>
                <Text style={styles.label}>量 (ml)</Text>
                <Pressable
                  onPress={() => {
                    dismissKeyboard();
                    setActivePicker((current) => (current === "amount" ? null : "amount"));
                  }}
                  style={[styles.timeButton, activePicker === "amount" && styles.timeButtonActive]}
                >
                  <View style={styles.timeButtonTextWrap}>
                    <Text style={styles.timeButtonValue}>{draft.amountMl}ml</Text>
                  </View>
                  <Text style={styles.timeButtonAction}>
                    {activePicker === "amount" ? "閉じる" : "変更"}
                  </Text>
                </Pressable>

                {activePicker === "amount" ? (
                  <View style={styles.timePickerPanel}>
                    <View style={styles.centeredPicker}>
                      <WheelPicker
                        values={amountValues}
                        value={draft.amountMl}
                        onChange={(amountMl) => setDraft((current) => ({ ...current, amountMl }))}
                        formatValue={(amountMl) => `${amountMl}ml`}
                        width={120}
                      />
                    </View>
                  </View>
                ) : null}
              </View>
            ) : null}

            {needsPoopDetails ? (
              <View style={styles.field}>
                <Text style={styles.label}>量</Text>
                <View style={styles.optionRow}>
                  {poopAmountOptions.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => setDraft((current) => ({ ...current, poopAmount: option.value }))}
                      style={[
                        styles.optionChip,
                        draft.poopAmount === option.value && styles.optionChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionChipText,
                          draft.poopAmount === option.value && styles.optionChipTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.label}>かたさ</Text>
                <View style={styles.optionRow}>
                  {poopHardnessOptions.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() =>
                        setDraft((current) => ({ ...current, poopHardness: option.value }))
                      }
                      style={[
                        styles.optionChip,
                        draft.poopHardness === option.value && styles.optionChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionChipText,
                          draft.poopHardness === option.value && styles.optionChipTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.label}>色</Text>
                <View style={styles.optionRow}>
                  {poopColorOptions.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => setDraft((current) => ({ ...current, poopColor: option.value }))}
                      style={[
                        styles.optionChip,
                        styles.colorOptionChip,
                        {
                          borderColor: option.borderColor,
                          backgroundColor:
                            draft.poopColor === option.value ? option.backgroundColor : palette.background,
                        },
                        draft.poopColor === option.value && styles.optionChipActive,
                      ]}
                    >
                      <View
                        style={[
                          styles.colorDot,
                          {
                            backgroundColor: option.color,
                            borderColor: option.value === "white" ? "#CFC7BC" : option.color,
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.optionChipText,
                          { color: draft.poopColor === option.value ? option.textColor : palette.textMuted },
                          draft.poopColor === option.value && styles.optionChipTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

            {needsNote ? (
              <View style={styles.field}>
                <Text style={styles.label}>コメント</Text>
                <TextInput
                  ref={noteInputRef}
                  value={draft.note}
                  onChangeText={(note) => setDraft((current) => ({ ...current, note }))}
                  onFocus={() => {
                    setNoteFocused(true);
                    setActivePicker(null);
                    requestAnimationFrame(() => {
                      bodyScrollRef.current?.scrollToEnd({ animated: true });
                    });
                  }}
                  onBlur={() => setNoteFocused(false)}
                  onSubmitEditing={dismissKeyboard}
                  placeholder="任意で入力"
                  placeholderTextColor={palette.textSoft}
                  blurOnSubmit
                  returnKeyType="done"
                  style={[styles.input, noteFocused && styles.inputFocused]}
                />
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            {mode === "edit" && onDelete ? (
              <Pressable onPress={onDelete} style={styles.deleteButton}>
                <Text style={styles.deleteText}>削除</Text>
              </Pressable>
            ) : (
              <View />
            )}
            <View style={styles.actions}>
              <Pressable onPress={handleClose} style={styles.secondaryButton}>
                <Text style={styles.secondaryText}>閉じる</Text>
              </Pressable>
              <Pressable
                disabled={saveDisabled}
                onPress={() => {
                  dismissKeyboard();
                  onSave({
                    type,
                    timestamp: combineDateAndTime(
                      date,
                      `${String(draft.hour).padStart(2, "0")}:${String(draft.minute).padStart(2, "0")}`
                    ),
                    sleepEndTimestamp: isSleepPair
                      ? combineDateAndTime(
                          date,
                          `${String(draft.endHour).padStart(2, "0")}:${String(draft.endMinute).padStart(2, "0")}`
                        )
                      : undefined,
                    amountMl: needsAmount ? draft.amountMl : undefined,
                    poopAmount: needsPoopDetails ? draft.poopAmount : undefined,
                    poopHardness: needsPoopDetails ? draft.poopHardness : undefined,
                    poopColor: needsPoopDetails ? draft.poopColor : undefined,
                    note: draft.note.trim() ? draft.note.trim() : undefined,
                  });
                }}
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor:
                      type === "poop" && selectedPoopColorOption
                        ? selectedPoopColorOption.color
                        : accentColor,
                  },
                  saveDisabled && styles.disabledButton,
                ]}
              >
                <Text style={styles.primaryText}>保存</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    backgroundColor: "rgba(27, 21, 12, 0.22)",
  },
  backdropWithKeyboard: {
    justifyContent: "flex-start",
    paddingTop: spacing.xl,
  },
  sheet: {
    width: "100%",
    maxWidth: 460,
    maxHeight: "78%",
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(139, 121, 92, 0.14)",
    shadowColor: "#000000",
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    overflow: "hidden",
  },
  header: {
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(139, 121, 92, 0.10)",
  },
  body: {
    flexGrow: 0,
    minHeight: 0,
  },
  content: {
    gap: spacing.md,
  },
  bodyContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  contentWithKeyboard: {
    paddingBottom: spacing.md,
  },
  title: {
    color: palette.text,
    fontSize: 22,
    fontWeight: "700",
  },
  field: {
    gap: 8,
  },
  label: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "600",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: palette.background,
  },
  timeButtonActive: {
    borderColor: palette.textSoft,
  },
  timeButtonTextWrap: {
    gap: 0,
  },
  timeButtonValue: {
    color: palette.text,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  timeButtonAction: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  timePickerPanel: {
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: radii.md,
    backgroundColor: palette.surfaceMuted,
    marginTop: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    shadowColor: palette.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  centeredPicker: {
    alignItems: "center",
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.background,
  },
  optionChipActive: {
    borderColor: palette.textSoft,
    backgroundColor: palette.surfaceMuted,
  },
  colorOptionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  optionChipText: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  optionChipTextActive: {
    color: palette.text,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: palette.text,
    fontSize: 15,
    backgroundColor: palette.background,
  },
  inputFocused: {
    borderColor: palette.textSoft,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(139, 121, 92, 0.10)",
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
