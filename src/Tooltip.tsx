import React, {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  StyleSheet,
  View,
  type ColorValue,
  type StyleProp,
  type ViewStyle,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  measure,
  runOnUI,
  type BaseAnimationBuilder,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { Pointer } from './Pointer';
import { ZView } from 'react-native-z-view';

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
  } = props;

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

      let tooltipX = pointX - tooltipDimensions.width / 2;
      const tooltipOutsideRight =
        tooltipX + tooltipDimensions.width > backdropDimensions.width;
      if (tooltipOutsideRight) {
        tooltipX = backdropDimensions.width - tooltipDimensions.width;
      }

      const tooltipOutsideLeft = tooltipX < 0;
      if (tooltipOutsideLeft) {
        tooltipX = 0;
      }
      const tooltipY =
        pointY + (pointerDown ? -tooltipDimensions.height : pointerSize);
      tooltipLayout.value = {
        y: tooltipY,
        x: tooltipX,
      };
      console.log('set position');
    }
  }, [backdrop, element, pointerLayout, pointerSize, tooltip, tooltipLayout]);

  const setPositionIfVisible = useCallback(() => {
    if (visible) {
      runOnUI(setTooltipPosition)();
    }
  }, [visible, setTooltipPosition]);

  const { fontScale, width } = useWindowDimensions();
  const prevFontScale = useRef(fontScale);
  const prevWidth = useRef(width);
  useEffect(() => {
    if (prevFontScale.current !== fontScale || prevWidth.current !== width) {
      prevFontScale.current = fontScale;
      prevWidth.current = width;
      setPositionIfVisible();
    }
  }, [fontScale, setPositionIfVisible, width]);

  const tooltipPosition = useAnimatedStyle(
    () => ({
      position: 'absolute',
      top: tooltipLayout.value.y,
      left: tooltipLayout.value.x,
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

  return (
    <View ref={element} collapsable={false} style={style}>
      {props.children}
      {visible ? (
        <ZView top={0} right={0} bottom={0} left={0} touchable={false}>
          <View
            style={styles.backdrop}
            ref={backdrop}
            pointerEvents="none"
            onLayout={setPositionIfVisible}
          >
            <>
              <Animated.View entering={entering} exiting={exiting}>
                <Animated.View style={tooltipPosition} ref={tooltip}>
                  <View style={containerStyle ?? styles.defaultTooltip}>
                    {props.content}
                  </View>
                </Animated.View>
              </Animated.View>
              {withPointer ? (
                <Animated.View entering={entering} exiting={exiting}>
                  <Animated.View style={pointerPosition}>
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
        </ZView>
      ) : null}
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
