import React, { useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import type { StyleProp } from 'react-native';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

type PointerProps = {
  style?: StyleProp<ViewStyle>;
  size?: number;
  color?: string;
};

export const Pointer = React.memo(
  ({ style, size = 16, color = 'grey' }: PointerProps) => {
    const mergedStyle = useMemo(
      () => [
        styles.pointer,
        {
          marginLeft: -Math.round(size / 2),
          borderLeftWidth: Math.round(size / 2),
          borderRightWidth: Math.round(size / 2),
          borderBottomColor: color,
          borderBottomWidth: 16,
        },
        style,
      ],
      [color, size, style]
    );
    return <Animated.View style={mergedStyle} />;
  }
);

const styles = StyleSheet.create({
  pointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
