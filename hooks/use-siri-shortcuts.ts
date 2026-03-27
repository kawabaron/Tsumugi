import { useEffect } from "react";
import { Alert } from "react-native";
import * as Linking from "expo-linking";

import { useRecordActions } from "@/hooks/use-app-data";
import { useAppStore } from "@/store/app-store";

const supportedTypes = new Set([
  "milk",
  "pee",
  "poop",
  "sleep_start",
  "sleep_end",
]);

export const useSiriShortcuts = () => {
  const session = useAppStore((state) => state.session);
  const { createRecord } = useRecordActions();

  useEffect(() => {
    const handleUrl = async (url: string | null) => {
      if (!url) {
        return;
      }

      const parsed = Linking.parse(url);
      const shortcutType = parsed.queryParams?.type;
      if (typeof shortcutType !== "string" || !supportedTypes.has(shortcutType)) {
        return;
      }

      if (!session.currentFamilyGroupId || !session.currentChildId || !session.currentUserId) {
        Alert.alert("Tsumugi", "ショートカットを使う前に家族設定を完了してください。");
        return;
      }

      const amountParam = parsed.queryParams?.amount;
      const amountMl =
        typeof amountParam === "string" && Number.isFinite(Number(amountParam))
          ? Number(amountParam)
          : undefined;

      await createRecord.mutateAsync({
        familyGroupId: session.currentFamilyGroupId,
        childId: session.currentChildId,
        createdByUserId: session.currentUserId,
        type: shortcutType,
        timestamp: new Date().toISOString(),
        amountMl,
      });
    };

    Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, [createRecord, session]);
};
