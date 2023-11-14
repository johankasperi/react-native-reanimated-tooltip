import React, { useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import type { StyleProp } from 'react-native';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

type PointerProps = {
  style?: StyleProp<ViewStyle>;
  size: number;
  color?: string;
};

export const Pointer = React.memo(
  ({ style, size, color = 'lightgrey' }: PointerProps) => {
    const mergedStyle = useMemo(
      () => [
        styles.pointer,
        {
          marginLeft: -size,
          borderLeftWidth: size,
          borderRightWidth: size,
          borderTopColor: color,
          borderTopWidth: size,
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
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
