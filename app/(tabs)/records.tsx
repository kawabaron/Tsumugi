import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import dayjs from "dayjs";

import { Screen } from "@/components/Screen";
import { DateCalendarModal } from "@/components/records/DateCalendarModal";
import { DateNavigator } from "@/components/records/DateNavigator";
import { QuickActionBar } from "@/components/records/QuickActionBar";
import { RecordEditorModal } from "@/components/records/RecordEditorModal";
import { TimelineList } from "@/components/records/TimelineList";
import { palette, radii, spacing } from "@/constants/theme";
import {
  useAnalyticsQuery,
  useAppContextQuery,
  useRecordActions,
  useRecordsQuery,
} from "@/hooks/use-app-data";
import { combineDateAndTime, currentTimeKey, formatDuration } from "@/lib/date";
import { useAppStore } from "@/store/app-store";
import { PoopAmount, PoopColor, PoopHardness, RecordEvent, RecordEventType } from "@/types/domain";

type EditorState =
  | { visible: false }
  | {
      visible: true;
      mode: "create" | "edit";
      type?: RecordEventType;
      record?: RecordEvent;
      relatedRecord?: RecordEvent;
    };

export default function RecordsScreen() {
  const { data: context } = useAppContextQuery();
  const { data: records = [] } = useRecordsQuery();
  const { data: analytics } = useAnalyticsQuery(7);
  const { createRecord, updateRecord, deleteRecord } = useRecordActions();
  const selectedDate = useAppStore((state) => state.selectedDate);
  const setSelectedDate = useAppStore((state) => state.setSelectedDate);
  const shiftSelectedDate = useAppStore((state) => state.shiftSelectedDate);
  const session = useAppStore((state) => state.session);
  const [editor, setEditor] = useState<EditorState>({ visible: false });
  const [calendarVisible, setCalendarVisible] = useState(false);

  const settings = context?.settings;
  const accentColor = settings?.themeColor ?? palette.text;
  const summary = analytics?.summary;
  const today = dayjs().format("YYYY-MM-DD");
  const canMoveNext = selectedDate < today;
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

  const openEdit = (record: RecordEvent, relatedRecord?: RecordEvent) => {
    setEditor({ visible: true, mode: "edit", record, relatedRecord });
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
      timestamp: combineDateAndTime(selectedDate, currentTimeKey()),
    });
    return record;
  };

  const handleQuickAction = async (type: RecordEventType) => {
    if (type === "milk" || type === "memo" || type === "poop") {
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
    sleepEndTimestamp?: string;
    amountMl?: number;
    poopAmount?: PoopAmount;
    poopHardness?: PoopHardness;
    poopColor?: PoopColor;
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
          poopAmount: input.poopAmount,
          poopHardness: input.poopHardness,
          poopColor: input.poopColor,
          note: input.note,
        });
        if (
          editor.relatedRecord &&
          editor.record.type === "sleep_start" &&
          editor.relatedRecord.type === "sleep_end" &&
          input.sleepEndTimestamp
        ) {
          await updateRecord.mutateAsync({
            id: editor.relatedRecord.id,
            timestamp: input.sleepEndTimestamp,
            note: editor.relatedRecord.note,
          });
        }
      } else {
        await createRecord.mutateAsync({
          familyGroupId: session.currentFamilyGroupId,
          childId: session.currentChildId,
          createdByUserId: session.currentUserId,
          type: input.type,
          timestamp: input.timestamp,
          amountMl: input.amountMl,
          poopAmount: input.poopAmount,
          poopHardness: input.poopHardness,
          poopColor: input.poopColor,
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
      if (editor.relatedRecord) {
        await deleteRecord.mutateAsync(editor.relatedRecord.id);
      }
      closeEditor();
    } catch (error) {
      Alert.alert("Tsumugi", error instanceof Error ? error.message : "削除に失敗しました。");
    }
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-56, 56])
    .onEnd((event) => {
      if (event.translationX > 40 || event.velocityX > 650) {
        runOnJS(shiftSelectedDate)(-1);
      }
      if ((event.translationX < -40 || event.velocityX < -650) && canMoveNext) {
        runOnJS(shiftSelectedDate)(1);
      }
    });

  const quickActions =
    settings?.quickActionOrder?.filter((type) => visibleTypes.includes(type)) ?? visibleTypes;

  const summaryLine = [
    `ミルク ${summary?.totalMilkMl ?? 0}ml`,
    `おしっこ ${summary?.peeCount ?? 0}回`,
    `うんち ${summary?.poopCount ?? 0}回`,
    `ねんね ${formatDuration(summary?.sleepMinutes ?? 0)}`,
  ].join(" ・ ");

  const ageInDays = context?.childProfile?.birthDate
    ? dayjs(selectedDate).startOf("day").diff(dayjs(context.childProfile.birthDate).startOf("day"), "day") + 1
    : null;

  return (
    <Screen scroll={false} contentContainerStyle={styles.screen}>
      <View style={styles.topArea}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>
            {context?.childProfile ? `${context.childProfile.name}の記録` : "育児記録"}
          </Text>
          {ageInDays && ageInDays > 0 ? <Text style={styles.ageText}>生後{ageInDays}日目</Text> : null}
        </View>

        <DateNavigator
          date={selectedDate}
          onPrevious={() => shiftSelectedDate(-1)}
          onNext={() => {
            if (canMoveNext) {
              shiftSelectedDate(1);
            }
          }}
          onOpenCalendar={() => setCalendarVisible(true)}
          accentColor={accentColor}
        />

        <View style={styles.summaryBar}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.72}
            style={styles.summaryText}
          >
            {summaryLine}
          </Text>
        </View>
      </View>

      <View style={styles.timelineSection}>
        <GestureDetector gesture={panGesture}>
          <View style={styles.timelineWrap}>
            <TimelineList
              records={visibleRecords}
              density={settings?.timelineDensity ?? "standard"}
              onPressRecord={openEdit}
            />
          </View>
        </GestureDetector>
      </View>

      <View style={styles.quickDock}>
        <QuickActionBar
          actions={quickActions}
          accentColor={accentColor}
          onPress={handleQuickAction}
        />
      </View>

      <DateCalendarModal
        visible={calendarVisible}
        date={selectedDate}
        accentColor={accentColor}
        onClose={() => setCalendarVisible(false)}
        onSelectDate={(date) => {
          setSelectedDate(dayjs(date).isAfter(dayjs(today), "day") ? today : date);
          setCalendarVisible(false);
        }}
      />

      <RecordEditorModal
        visible={editor.visible}
        mode={editor.visible ? editor.mode : "create"}
        date={selectedDate}
        record={editor.visible ? editor.record : undefined}
        relatedRecord={editor.visible ? editor.relatedRecord : undefined}
        defaultType={editor.visible ? editor.type : "milk"}
        minuteInterval={settings?.timeMinuteInterval ?? 5}
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
    gap: spacing.sm,
    backgroundColor: palette.background,
    paddingBottom: 0,
  },
  topArea: {
    gap: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  title: {
    color: palette.text,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "700",
    flex: 1,
  },
  ageText: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  summaryBar: {
    minHeight: 32,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: "rgba(139, 121, 92, 0.12)",
    justifyContent: "center",
  },
  summaryText: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  timelineSection: {
    flex: 1,
    minHeight: 0,
  },
  timelineWrap: {
    flex: 1,
    minHeight: 0,
  },
  quickDock: {
    marginHorizontal: -spacing.lg,
    marginBottom: -spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: 2,
    paddingBottom: 0,
    backgroundColor: "rgba(246, 244, 239, 0.96)",
    borderTopWidth: 1,
    borderTopColor: "rgba(139, 121, 92, 0.10)",
  },
});
