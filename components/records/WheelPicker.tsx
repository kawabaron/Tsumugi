import { useEffect, useMemo, useRef } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { palette, radii, spacing } from "@/constants/theme";

type WheelPickerProps = {
  values: number[];
  value: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  width?: number;
  itemHeight?: number;
  style?: ViewStyle;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const WheelPicker = ({
  values,
  value,
  onChange,
  formatValue = (item) => String(item),
  width = 88,
  itemHeight = 44,
  style,
}: WheelPickerProps) => {
  const scrollRef = useRef<ScrollView>(null);
  const spacerHeight = itemHeight * 2;

  const selectedIndex = useMemo(
    () => clamp(values.findIndex((item) => item === value), 0, Math.max(values.length - 1, 0)),
    [value, values]
  );

  const scrollToIndex = (index: number, animated: boolean) => {
    scrollRef.current?.scrollTo({
      y: index * itemHeight,
      animated,
    });
  };

  useEffect(() => {
    const requestId = requestAnimationFrame(() => {
      scrollToIndex(selectedIndex, false);
    });

    return () => cancelAnimationFrame(requestId);
  }, [itemHeight, selectedIndex]);

  const snapToValue = (offsetY: number) => {
    const nextIndex = clamp(Math.round(offsetY / itemHeight), 0, values.length - 1);
    const nextValue = values[nextIndex];
    scrollToIndex(nextIndex, true);
    if (nextValue !== value) {
      onChange(nextValue);
    }
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    snapToValue(event.nativeEvent.contentOffset.y);
  };

  return (
    <View style={[styles.wrapper, { width, height: itemHeight * 5 }, style]}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        bounces={false}
        decelerationRate="normal"
        nestedScrollEnabled
        snapToInterval={itemHeight}
        snapToAlignment="start"
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={(event) => {
          const velocityY = Math.abs(event.nativeEvent.velocity?.y ?? 0);
          if (velocityY < 0.05) {
            handleScrollEnd(event);
          }
        }}
        onLayout={() => scrollToIndex(selectedIndex, false)}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={{ height: spacerHeight }} />
        {values.map((item) => {
          const isSelected = item === value;
          return (
            <View key={item} style={[styles.item, { height: itemHeight }]}>
              <Text style={[styles.itemText, isSelected && styles.selectedText]}>
                {formatValue(item)}
              </Text>
            </View>
          );
        })}
        <View style={{ height: spacerHeight }} />
      </ScrollView>
      <View
        pointerEvents="none"
        style={[
          styles.selection,
          {
            height: itemHeight,
            top: itemHeight * 2,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radii.md,
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.line,
    overflow: "hidden",
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  scrollContent: {
    alignItems: "stretch",
  },
  itemText: {
    color: palette.textSoft,
    fontSize: 18,
    fontWeight: "600",
  },
  selectedText: {
    color: palette.text,
    fontSize: 22,
    fontWeight: "700",
  },
  selection: {
    position: "absolute",
    left: 8,
    right: 8,
    borderRadius: radii.md,
    backgroundColor: "rgba(255, 252, 246, 0.24)",
    borderWidth: 1,
    borderColor: palette.line,
  },
});
