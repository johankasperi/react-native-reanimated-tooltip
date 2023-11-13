import React, {
  useEffect,
  type PropsWithChildren,
  useCallback,
  useLayoutEffect,
} from 'react';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';
import {
  TouchableOpacity,
  View,
  StatusBar,
  I18nManager,
  Platform,
  Dimensions,
  Pressable,
  Modal,
} from 'react-native';
import Animated, {
  measure,
  runOnUI,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { Pointer } from './Pointer';

export interface TooltipProps {
  /** To show the tooltip. */
  visible?: boolean;

  /** Flag to determine whether or not to display the pointer. */
  withPointer?: boolean;

  /** Component to be rendered as the display container. */
  content?: React.ReactElement<{}>;

  /** Passes style object to tooltip container */
  containerStyle?: StyleProp<ViewStyle>;

  /** Style to be applied on the pointer. */
  pointerStyle?: StyleProp<ViewStyle>;

  /** */
  animationType?: 'fade' | 'none';

  onPress?: () => void;

  overlayStyle?: StyleProp<ViewStyle>;
}

/** Tooltips display informative text when users tap on an element.
 * @usage
 * ### Example
 *```tsx live
function RNETooltip() {
  const [open, setOpen] = React.useState(false);
  return (
    <Stack row align="center">
      <Tooltip
        visible={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        popover={<Text style={{color:'#fff'}}>Tooltip text</Text>}
      >
        Click me
      </Tooltip>
    </Stack>
  );
}
 * ```
 */
export const Tooltip = React.memo(
  ({
    withPointer = true,
    containerStyle = {},
    pointerStyle,
    onPress,
    visible = false,
    animationType = 'fade',
    overlayStyle,
    ...props
  }: PropsWithChildren<TooltipProps>) => {
    const element = useAnimatedRef<View>();

    const pointerLayout = useSharedValue({
      x: 0,
      y: 0,
      isDown: true,
    });

    const setTooltipPosition = useCallback(() => {
      'worklet';
      const elementLayout = measure(element);
      if (elementLayout) {
        console.log({ elementLayout });
        const elementTopHalf = elementLayout.pageY < 200 / 2;
        pointerLayout.value = {
          x: elementLayout.pageX + elementLayout.width / 2,
          y: elementLayout.pageY + (elementTopHalf ? 0 : elementLayout.height),
          isDown: elementTopHalf,
        };
      }
    }, [element, pointerLayout]);

    useEffect(() => {
      if (visible) {
        runOnUI(setTooltipPosition)();
      }
    }, [visible, setTooltipPosition]);

    const tooltipPosition = useAnimatedStyle(() => {
      return {
        position: 'absolute',
      };
    }, []);

    const pointerPosition = useAnimatedStyle(() => {
      return {
        position: 'absolute',
        top: pointerLayout.value.y,
        left: pointerLayout.value.x,
        transform: [
          {
            rotate: pointerLayout.value.isDown ? '0deg' : '180deg',
          },
        ],
      };
    }, []);

    return (
      <View collapsable={false} ref={element}>
        {props.children}
        <Modal transparent visible={visible}>
          <TouchableOpacity
            style={[overlayStyle, { flex: 1 }]}
            onPress={onPress}
          >
            <Animated.View style={tooltipPosition}>
              <View>{props.content}</View>
            </Animated.View>
            <Pointer style={[pointerStyle, pointerPosition]} />
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }
);
