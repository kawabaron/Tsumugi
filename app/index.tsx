import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";

import { palette } from "@/constants/theme";
import { useAppStore } from "@/store/app-store";

export default function IndexScreen() {
  const bootstrapped = useAppStore((state) => state.bootstrapped);
  const session = useAppStore((state) => state.session);

  if (!bootstrapped) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: palette.background,
        }}
      >
        <ActivityIndicator color={palette.textMuted} />
      </View>
    );
  }

  if (!session.currentUserId) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (!session.currentFamilyGroupId) {
    return <Redirect href="/(auth)/create-family" />;
  }

  if (!session.currentChildId) {
    return <Redirect href="/(auth)/child-setup" />;
  }

  return <Redirect href="/(tabs)/records" />;
}
