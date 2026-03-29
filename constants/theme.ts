import { PoopAmount, PoopColor, PoopHardness, RecordEventType } from "@/types/domain";

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
    label: "寝る",
    shortLabel: "寝る",
    tint: "#8574B6",
    icon: "weather-night",
  },
  sleep_end: {
    label: "起きる",
    shortLabel: "起きる",
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

export const poopAmountOptions: { value: PoopAmount; label: string }[] = [
  { value: "tiny", label: "ちょこっと" },
  { value: "small", label: "少なめ" },
  { value: "normal", label: "ふつう" },
  { value: "large", label: "多め" },
];

export const poopHardnessOptions: { value: PoopHardness; label: string }[] = [
  { value: "diarrhea", label: "下痢" },
  { value: "soft", label: "やわらかめ" },
  { value: "normal", label: "ふつう" },
  { value: "firm", label: "かため" },
];

export const poopColorOptions: {
  value: PoopColor;
  label: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}[] = [
  {
    value: "white",
    label: "白",
    color: "#F2EEE5",
    backgroundColor: "#F8F6F0",
    borderColor: "#D8D2C8",
    textColor: "#6D665C",
  },
  {
    value: "yellow",
    label: "黄",
    color: "#E5C749",
    backgroundColor: "#FBF4CF",
    borderColor: "#E4D58A",
    textColor: "#8A6B12",
  },
  {
    value: "orange",
    label: "橙",
    color: "#DE9B45",
    backgroundColor: "#FCE8CE",
    borderColor: "#E6BD86",
    textColor: "#925615",
  },
  {
    value: "brown",
    label: "茶",
    color: "#8D6340",
    backgroundColor: "#EFE1D6",
    borderColor: "#C6A58C",
    textColor: "#6F482A",
  },
  {
    value: "green",
    label: "緑",
    color: "#6F8B4F",
    backgroundColor: "#E4EFD9",
    borderColor: "#AFC58E",
    textColor: "#4C6731",
  },
  {
    value: "red",
    label: "赤",
    color: "#C86B68",
    backgroundColor: "#F8DEDD",
    borderColor: "#E4A2A0",
    textColor: "#9B3D3B",
  },
  {
    value: "black",
    label: "黒",
    color: "#3B3732",
    backgroundColor: "#E3DFDB",
    borderColor: "#A59D95",
    textColor: "#2E2924",
  },
];
