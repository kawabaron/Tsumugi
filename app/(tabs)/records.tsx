import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { DateNavigator } from "@/components/records/DateNavigator";
import { QuickActionBar } from "@/components/records/QuickActionBar";
import { RecordEditorModal } from "@/components/records/RecordEditorModal";
import { TimelineList } from "@/components/records/TimelineList";
import { palette, radii, spacing } from "@/constants/theme";
import { useAppContextQuery, useRecordActions, useRecordsQuery } from "@/hooks/use-app-data";
import { todayKey } from "@/lib/date";
import { useAppStore } from "@/store/app-store";
import { RecordEvent, RecordEventType } from "@/types/domain";

type EditorState =
  | { visible: false }
  | {
      visible: true;
      mode: "create" | "edit";
      type?: RecordEventType;
      record?: RecordEvent;
    };

export default function RecordsScreen() {
  const { data: context } = useAppContextQuery();
  const { data: records = [] } = useRecordsQuery();
  const { createRecord, updateRecord, deleteRecord } = useRecordActions();
  const selectedDate = useAppStore((state) => state.selectedDate);
  const setSelectedDate = useAppStore((state) => state.setSelectedDate);
  const shiftSelectedDate = useAppStore((state) => state.shiftSelectedDate);
  const session = useAppStore((state) => state.session);
  const [editor, setEditor] = useState<EditorState>({ visible: false });
  const [toast, setToast] = useState<{ id: string; type: RecordEventType } | null>(null);

  const settings = context?.settings;
  const accentColor = settings?.themeColor ?? palette.text;
  const visibleTypes = settings?.visibleRecordTypes ?? [
    "milk",
    "pee",
    "poop",
    "sleep_start",
    "sleep_end",
    "memo",
  ];
  const visibleRecords = useMemo(
    () => records.filter((record) => visibleTypes.includes(record.type)),
    [records, visibleTypes]
  );

  const closeEditor = () => setEditor({ visible: false });

  const openCreate = (type: RecordEventType) => {
    setEditor({ visible: true, mode: "create", type });
  };

  const openEdit = (record: RecordEvent) => {
    setEditor({ visible: true, mode: "edit", record });
  };

  const createImmediateRecord = async (type: RecordEventType) => {
    if (!session.currentFamilyGroupId || !session.currentChildId || !session.currentUserId) {
      return;
    }

    const record = await createRecord.mutateAsync({
      familyGroupId: session.currentFamilyGroupId,
      childId: session.currentChildId,
      createdByUserId: session.currentUserId,
      type,
      timestamp: new Date().toISOString(),
    });
    setToast({ id: record.id, type });
  };

  const handleQuickAction = async (type: RecordEventType) => {
    if (type === "milk" || type === "memo") {
      openCreate(type);
      return;
    }

    if (settings?.enableOneTapRecord && !settings.enableConfirmBeforeSave) {
      try {
        await createImmediateRecord(type);
      } catch (error) {
        Alert.alert("Tsumugi", error instanceof Error ? error.message : "保存に失敗しました。");
      }
      return;
    }

    openCreate(type);
  };

  const saveDraft = async (input: {
    type: RecordEventType;
    timestamp: string;
    amountMl?: number;
    note?: string;
  }) => {
    try {
      if (!session.currentFamilyGroupId || !session.currentChildId || !session.currentUserId) {
        return;
      }

      if (editor.visible && editor.mode === "edit" && editor.record) {
        await updateRecord.mutateAsync({
          id: editor.record.id,
          timestamp: input.timestamp,
          amountMl: input.amountMl,
          note: input.note,
        });
      } else {
        await createRecord.mutateAsync({
          familyGroupId: session.currentFamilyGroupId,
          childId: session.currentChildId,
          createdByUserId: session.currentUserId,
          type: input.type,
          timestamp: input.timestamp,
          amountMl: input.amountMl,
          note: input.note,
        });
      }
      closeEditor();
    } catch (error) {
      Alert.alert("Tsumugi", error instanceof Error ? error.message : "保存に失敗しました。");
    }
  };

  const removeRecord = async () => {
    if (!editor.visible || editor.mode !== "edit" || !editor.record) {
      return;
    }
    try {
      await deleteRecord.mutateAsync(editor.record.id);
      closeEditor();
    } catch (error) {
      Alert.alert("Tsumugi", error instanceof Error ? error.message : "削除に失敗しました。");
    }
  };

  const panGesture = Gesture.Pan().onEnd((event) => {
    if (event.translationX > 40) {
      runOnJS(shiftSelectedDate)(-1);
    }
    if (event.translationX < -40) {
      runOnJS(shiftSelectedDate)(1);
    }
  });

  const quickActions =
    settings?.quickActionOrder?.filter((type) => visibleTypes.includes(type)) ?? visibleTypes;

  return (
    <Screen scroll={false} contentContainerStyle={styles.screen}>
      <SectionTitle
        eyebrow="Timeline"
        title={context?.childProfile ? `${context.childProfile.name} の記録` : "育児記録"}
        description="左右スワイプでも日付移動できます。タップで編集、クイック操作で最短記録。"
      />

      <GestureDetector gesture={panGesture}>
        <View style={styles.flex}>
          <DateNavigator
            date={selectedDate}
            onPrevious={() => shiftSelectedDate(-1)}
            onNext={() => shiftSelectedDate(1)}
            onToday={() => setSelectedDate(todayKey())}
            accentColor={accentColor}
          />

          <TimelineList
            records={visibleRecords}
            members={context?.members ?? []}
            density={settings?.timelineDensity ?? "standard"}
            onPressRecord={openEdit}
          />

          <QuickActionBar
            actions={quickActions}
            accentColor={accentColor}
            onPress={handleQuickAction}
          />
        </View>
      </GestureDetector>

      {toast ? (
        <View style={[styles.toast, { borderColor: `${accentColor}44` }]}>
          <Text style={styles.toastText}>記録を追加しました。</Text>
          <Pressable
            onPress={async () => {
              await deleteRecord.mutateAsync(toast.id);
              setToast(null);
            }}
          >
            <Text style={[styles.undoText, { color: accentColor }]}>Undo</Text>
          </Pressable>
        </View>
      ) : null}

      <RecordEditorModal
        visible={editor.visible}
        mode={editor.visible ? editor.mode : "create"}
        date={selectedDate}
        record={editor.visible ? editor.record : undefined}
        defaultType={editor.visible ? editor.type : "milk"}
        accentColor={accentColor}
        onClose={closeEditor}
        onSave={saveDraft}
        onDelete={editor.visible && editor.mode === "edit" ? removeRecord : undefined}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: spacing.md,
  },
  flex: {
    flex: 1,
    gap: spacing.md,
  },
  toast: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: 108,
    backgroundColor: palette.surface,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toastText: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "600",
  },
  undoText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
