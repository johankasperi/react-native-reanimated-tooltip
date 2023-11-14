import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  type ColorValue,
  type ViewStyle,
  type StyleProp,
} from 'react-native';

type PointerProps = {
  style?: StyleProp<ViewStyle>;
  size: number;
  color: ColorValue;
};

export const Pointer = React.memo(({ style, size, color }: PointerProps) => {
  const mergedStyle = useMemo(
    () => [
      styles.pointer,
      {
        borderLeftWidth: size,
        borderRightWidth: size,
        borderTopColor: color,
        borderTopWidth: size,
      },
      style,
    ],
    [color, size, style]
  );
  return <View style={mergedStyle} />;
});

const styles = StyleSheet.create({
  pointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
