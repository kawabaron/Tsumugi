import { RecordEventType } from "@/types/domain";

export const palette = {
  background: "#F6F4EF",
  surface: "#FFFCF6",
  surfaceMuted: "#F1ECE3",
  line: "#DDD3C3",
  text: "#2F2A22",
  textMuted: "#7B7468",
  textSoft: "#A09789",
  success: "#5F7A65",
  danger: "#BB6B65",
  shadow: "rgba(61, 42, 16, 0.08)",
};

export const themeOptions = [
  { name: "Moss", value: "#6B8A72" },
  { name: "Sky", value: "#6A90B8" },
  { name: "Terracotta", value: "#C57D63" },
  { name: "Rosewood", value: "#A6676B" },
];

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radii = {
  sm: 12,
  md: 18,
  lg: 26,
  pill: 999,
};

export const eventMeta: Record<
  RecordEventType,
  { label: string; shortLabel: string; tint: string; icon: string }
> = {
  milk: {
    label: "ミルク",
    shortLabel: "ミルク",
    tint: "#C8A36A",
    icon: "baby-bottle-outline",
  },
  pee: {
    label: "おしっこ",
    shortLabel: "おしっこ",
    tint: "#6F9CC8",
    icon: "water-outline",
  },
  poop: {
    label: "うんち",
    shortLabel: "うんち",
    tint: "#8C6C54",
    icon: "seed-outline",
  },
  sleep_start: {
    label: "ねんね開始",
    shortLabel: "ねんね開始",
    tint: "#8574B6",
    icon: "weather-night",
  },
  sleep_end: {
    label: "ねんね終了",
    shortLabel: "ねんね終了",
    tint: "#D59C54",
    icon: "white-balance-sunny",
  },
  memo: {
    label: "メモ",
    shortLabel: "メモ",
    tint: "#74836B",
    icon: "note-text-outline",
  },
};

export const defaultVisibleTypes: RecordEventType[] = [
  "milk",
  "pee",
  "poop",
  "sleep_start",
  "sleep_end",
  "memo",
];

export const defaultQuickActionOrder: RecordEventType[] = [
  "milk",
  "pee",
  "poop",
  "sleep_start",
  "sleep_end",
  "memo",
];
