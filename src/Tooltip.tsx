import React, {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  type ColorValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  FadeOut,
  measure,
  runOnJS,
  runOnUI,
  type BaseAnimationBuilder,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { Pointer } from './Pointer';

export interface TooltipProps {
  /** To show the tooltip. */
  visible?: boolean;

  /** Style of the view parent view */
  style?: StyleProp<ViewStyle>;

  /** Component to be rendered as the display container. */
  content?: React.ReactElement<{}>;
  /** Passes style object to tooltip container */
  containerStyle?: StyleProp<ViewStyle>;
  /**
   * Reanimated entering animation
   * https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations/
   */
  entering?: BaseAnimationBuilder | typeof BaseAnimationBuilder;
  /**
   * Reanimated exiting animation
   * https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations/
   */
  exiting?: BaseAnimationBuilder | typeof BaseAnimationBuilder;

  /** Flag to determine whether or not to display the pointer. */
  withPointer?: boolean;
  /** Style to be applied on the pointer. */
  pointerStyle?: StyleProp<ViewStyle>;
  /** Pointer size */
  pointerSize?: number;
  /** Pointer color */
  pointerColor?: ColorValue;

  /** Callback when the is closed. */
  onClose?: () => void;
}

export const Tooltip = React.memo((props: PropsWithChildren<TooltipProps>) => {
  const {
    visible = false,
    style,
    containerStyle,
    entering,
    exiting,
    withPointer = true,
    pointerStyle,
    pointerSize = withPointer ? 8 : 0,
    pointerColor = styles.defaultTooltip.backgroundColor,
    onClose,
  } = props;

  const [modalVisible, setModalVisible] = useState(visible);
  const [contentVisible, setContentVisible] = useState(visible);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
    }
    setContentVisible(visible);
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
      const tooltipY =
        pointY + (pointerDown ? -tooltipDimensions.height : pointerSize);
      tooltipLayout.value = {
        y: tooltipY,
        x: tooltipOutsideRight || tooltipOutsideLeft ? 0 : tooltipX,
      };
    }
  }, [backdrop, element, pointerLayout, pointerSize, tooltip, tooltipLayout]);

  const setPositionIfVisible = useCallback(() => {
    if (contentVisible) {
      runOnUI(setTooltipPosition)();
    }
  }, [contentVisible, setTooltipPosition]);

  const tooltipPosition = useAnimatedStyle(
    () => ({
      position: 'absolute',
      top: tooltipLayout.value.y,
      left: tooltipLayout.value.x ?? 0,
      right: tooltipLayout.value.x === 0 ? 0 : undefined,
    }),
    []
  );

  const pointerPosition = useAnimatedStyle(
    () => ({
      position: 'absolute',
      top: pointerLayout.value.y,
      left: pointerLayout.value.x,
    }),
    []
  );

  const pointerTransform = useAnimatedStyle(
    () => ({
      marginLeft: -pointerSize,
      transform: [
        {
          rotate: pointerLayout.value.isDown ? '0deg' : '180deg',
        },
      ],
    }),
    []
  );

  const onPressCallback = useCallback(() => {
    setContentVisible(false);
  }, []);

  const exitingWithCallback = useMemo(() => {
    const close = () => {
      onClose && onClose();
      setModalVisible(false);
    };
    const worklet = () => {
      'worklet';
      onClose && runOnJS(close)();
    };

    return exiting
      ? // @ts-ignore For some reason `bob build` throws an error here
        exiting.withCallback(worklet)
      : FadeOut.duration(1).withCallback(worklet);
  }, [exiting, onClose]);

  return (
    <View
      ref={element}
      collapsable={false}
      style={style}
      onLayout={setPositionIfVisible}
    >
      {props.children}
      <Modal visible={modalVisible} transparent onShow={setPositionIfVisible}>
        {contentVisible ? (
          <TouchableWithoutFeedback
            style={styles.backdrop}
            onPress={onPressCallback}
          >
            <View style={styles.backdrop} ref={backdrop}>
              <>
                <Animated.View style={tooltipPosition} ref={tooltip}>
                  <Animated.View
                    entering={entering}
                    exiting={exitingWithCallback}
                  >
                    <View style={containerStyle ?? styles.defaultTooltip}>
                      {props.content}
                    </View>
                  </Animated.View>
                </Animated.View>
                {withPointer ? (
                  <Animated.View style={pointerPosition}>
                    <Animated.View entering={entering} exiting={exiting}>
                      <Animated.View style={pointerTransform}>
                        <Pointer
                          style={pointerStyle}
                          size={pointerSize}
                          color={pointerColor}
                        />
                      </Animated.View>
                    </Animated.View>
                  </Animated.View>
                ) : null}
              </>
            </View>
          </TouchableWithoutFeedback>
        ) : null}
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  defaultTooltip: {
    backgroundColor: '#F3F2F7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 8,
  },
});
