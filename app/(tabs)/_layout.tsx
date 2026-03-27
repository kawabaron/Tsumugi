import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { palette } from "@/constants/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.text,
        tabBarInactiveTintColor: palette.textSoft,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.line,
        },
      }}
    >
      <Tabs.Screen
        name="records"
        options={{
          title: "記録",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons color={color} name="timeline-text-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "グラフ",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons color={color} name="chart-box-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "設定",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons color={color} name="cog-outline" size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
