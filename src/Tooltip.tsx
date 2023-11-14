import React, {
  type PropsWithChildren,
  useCallback,
  useState,
  useEffect,
  useMemo,
} from 'react';
import {
  View,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  FadeOut,
  measure,
  runOnJS,
  runOnUI,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  type BaseAnimationBuilder,
} from 'react-native-reanimated';
import { Pointer } from './Pointer';

export interface TooltipProps {
  /** To show the tooltip. */
  visible?: boolean;

  /** Component to be rendered as the display container. */
  content?: React.ReactElement<{}>;
  /** Passes style object to tooltip container */
  containerStyle?: StyleProp<ViewStyle>;
  /** */
  entering?: typeof BaseAnimationBuilder;
  exiting?: typeof BaseAnimationBuilder;

  /** Flag to determine whether or not to display the pointer. */
  withPointer?: boolean;
  /** Style to be applied on the pointer. */
  pointerStyle?: StyleProp<ViewStyle>;
  pointerSize?: number;

  onPress?: () => void;
}

export const Tooltip = React.memo((props: PropsWithChildren<TooltipProps>) => {
  const {
    visible = false,
    onPress,
    containerStyle,
    entering,
    exiting,
    withPointer = true,
    pointerStyle,
    pointerSize = withPointer ? 8 : 0,
  } = props;

  const [visibleState, setVisibleState] = useState(visible);

  useEffect(() => {
    if (visible) {
      setVisibleState(true);
    }
  }, [visible]);

  const element = useAnimatedRef<View>();
  const backdrop = useAnimatedRef<View>();
  const tooltip = useAnimatedRef<Animated.View>();

  const pointerLayout = useSharedValue<{
    x?: number;
    y?: number;
    isDown?: boolean;
  }>({
    x: undefined,
    y: undefined,
    isDown: undefined,
  });

  const tooltipLayout = useSharedValue<{ x?: number; y?: number }>({
    y: undefined,
    x: undefined,
  });

  const setTooltipPosition = useCallback(() => {
    'worklet';
    const elementDimensions = measure(element);
    const backdropDimensions = measure(backdrop);
    const tooltipDimensions = measure(tooltip);

    if (elementDimensions && backdropDimensions && tooltipDimensions) {
      const pointerDown =
        elementDimensions.pageY + elementDimensions.height / 2 >=
        backdropDimensions.height / 2;
      const pointX = elementDimensions.pageX + elementDimensions.width / 2;
      const pointY =
        elementDimensions.pageY +
        (pointerDown ? -pointerSize : elementDimensions.height);
      pointerLayout.value = {
        x: pointX,
        y: pointY,
        isDown: pointerDown,
      };

      const tooltipX = pointX - tooltipDimensions.width / 2;
      const tooltipOutsideRight =
        tooltipX + tooltipDimensions.width > backdropDimensions.width;
      const tooltipOutsideLeft = tooltipX < 0;
      tooltipLayout.value = {
        y: pointY + (pointerDown ? -tooltipDimensions.height : pointerSize),
        x: tooltipOutsideRight || tooltipOutsideLeft ? 0 : tooltipX,
      };
    }
  }, [backdrop, element, pointerLayout, pointerSize, tooltip, tooltipLayout]);

  const setPositionIfVisible = useCallback(() => {
    if (visibleState) {
      runOnUI(setTooltipPosition)();
    }
  }, [setTooltipPosition, visibleState]);

  const tooltipPosition = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      opacity: tooltipLayout.value.x === undefined ? 0 : 1,
      top: tooltipLayout.value.y,
      left: tooltipLayout.value.x ?? 0,
      right: tooltipLayout.value.x === 0 ? 0 : undefined,
      backgroundColor: 'transparent',
    };
  }, []);

  const pointerPosition = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      opacity: pointerLayout.value.x === undefined ? 0 : 1,
      top: pointerLayout.value.y,
      left: pointerLayout.value.x,
    };
  }, []);

  const pointerTransform = useAnimatedStyle(
    () => ({
      transform: [
        {
          rotate: pointerLayout.value.isDown ? '0deg' : '180deg',
        },
      ],
    }),
    []
  );

  const exitingWithCallback = useMemo(() => {
    return (exiting ?? FadeOut.duration(1)).withCallback(() => {
      'worklet';
      runOnJS(setVisibleState)(false);
    });
  }, [exiting]);

  return (
    <View collapsable={false} ref={element} onLayout={setPositionIfVisible}>
      {props.children}
      <Modal transparent visible={visibleState} onShow={setPositionIfVisible}>
        <TouchableWithoutFeedback style={styles.backdrop} onPress={onPress}>
          <View style={styles.backdrop} ref={backdrop}>
            {visible ? (
              <>
                <Animated.View style={tooltipPosition} ref={tooltip}>
                  <Animated.View
                    style={containerStyle ?? styles.defaultTooltip}
                    entering={entering}
                    exiting={exitingWithCallback}
                  >
                    {props.content}
                  </Animated.View>
                </Animated.View>
                {withPointer ? (
                  <Animated.View style={pointerPosition}>
                    <Animated.View entering={entering} exiting={exiting}>
                      <Pointer
                        style={[pointerStyle, pointerTransform]}
                        size={pointerSize}
                      />
                    </Animated.View>
                  </Animated.View>
                ) : null}
              </>
            ) : null}
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  defaultTooltip: {
    backgroundColor: 'lightgrey',
    padding: 8,
    borderRadius: 4,
    marginHorizontal: 8,
  },
});
