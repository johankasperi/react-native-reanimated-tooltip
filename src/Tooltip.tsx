import React, { type PropsWithChildren, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  type ColorValue,
  type StyleProp,
  type ViewStyle,
  type ViewProps,
} from 'react-native';
import Animated, {
  type BaseAnimationBuilder,
  useAnimatedStyle,
  useSharedValue,
  useDerivedValue,
} from 'react-native-reanimated';
import { Portal } from '@gorhom/portal';
import type { PortalProps } from '@gorhom/portal/lib/typescript/components/portal/types';
import type { MeasuredDimensions } from 'react-native-reanimated';
import { Pointer } from './Pointer';
import type { LayoutChangeEvent } from 'react-native';

export interface TooltipProps extends ViewProps {
  portalHostName?: PortalProps['hostName'];

  /** To show the tooltip. */
  visible?: boolean;

  /** Style of view wrapping the tooltip */
  containerStyle?: StyleProp<ViewStyle>;

  /** Style of the tooltip */
  tooltipStyle?: StyleProp<ViewStyle>;

  /** Component to be rendered as the display container. */
  content?: React.ReactElement<{}>;

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
    portalHostName,
    visible = false,
    containerStyle,
    content,
    tooltipStyle,
    entering,
    exiting,
    withPointer = true,
    pointerStyle,
    pointerSize = withPointer ? 8 : 0,
    pointerColor = styles.defaultTooltip.backgroundColor,
    children,
    onLayout,
    ...rest
  } = props;

  const element = useRef<View>(null);
  const backdrop = useRef<View>(null);
  const tooltip = useRef<Animated.View>(null);

  const elementDimensions = useSharedValue<MeasuredDimensions | null>(null);
  const backdropDimensions = useSharedValue<MeasuredDimensions | null>(null);
  const tooltipDimensions = useSharedValue<MeasuredDimensions | null>(null);

  const pointPosition = useDerivedValue<
    | {
        x: number;
        y: number;
        topHalfOfViewport: boolean;
      }
    | undefined
  >(() => {
    if (elementDimensions.value && backdropDimensions.value) {
      const topHalfOfViewport =
        elementDimensions.value.pageY + elementDimensions.value.height / 2 >=
        backdropDimensions.value.height / 2;
      const x =
        elementDimensions.value.pageX + elementDimensions.value.width / 2;
      const y =
        elementDimensions.value.pageY +
        (topHalfOfViewport ? -pointerSize : elementDimensions.value.height);

      return { x, y, topHalfOfViewport };
    }
    return undefined;
  });

  const onElementLayout = useCallback(
    (event: LayoutChangeEvent) => {
      onLayout?.(event);
      element.current?.measure((x, y, width, height, pageX, pageY) => {
        elementDimensions.value = {
          x,
          y,
          width,
          height,
          pageX,
          pageY,
        };
      });
    },
    [element, elementDimensions, onLayout]
  );

  const onBackdropLayout = useCallback(() => {
    backdrop.current?.measure((x, y, width, height, pageX, pageY) => {
      backdropDimensions.value = {
        x,
        y,
        width,
        height,
        pageX,
        pageY,
      };
    });
  }, [backdrop, backdropDimensions]);

  const onTooltipLayout = useCallback(() => {
    tooltip.current?.measure((x, y, width, height, pageX, pageY) => {
      tooltipDimensions.value = {
        x,
        y,
        width,
        height,
        pageX,
        pageY,
      };
    });
  }, [tooltip, tooltipDimensions]);

  const containerAnimatedStyle = useAnimatedStyle(() => {
    if (pointPosition.value) {
      return {
        position: 'absolute',
        top: pointPosition.value.y,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
      };
    }
    return {
      position: 'absolute',
      top: -10000,
      left: 0,
      right: 0,
    };
  });

  const tooltipAnimatedStyle = useAnimatedStyle(() => {
    if (
      backdropDimensions.value &&
      tooltipDimensions.value &&
      pointPosition.value
    ) {
      let tooltipX = pointPosition.value.x - tooltipDimensions.value.width / 2;
      const tooltipOutsideRight =
        tooltipX + tooltipDimensions.value.width >
        backdropDimensions.value.width;
      if (tooltipOutsideRight) {
        tooltipX =
          backdropDimensions.value.width - tooltipDimensions.value.width;
      }

      const tooltipOutsideLeft = tooltipX < 0;
      if (tooltipOutsideLeft) {
        tooltipX = 0;
      }
      return {
        position: 'absolute',
        top: pointPosition.value.topHalfOfViewport
          ? -tooltipDimensions.value.height
          : pointerSize,
        left: tooltipX,
      };
    }
    return {
      position: 'absolute',
      top: -10000,
    };
  }, []);

  const pointerAnimatedStyle = useAnimatedStyle(() => {
    if (pointPosition.value) {
      return {
        position: 'absolute',
        top: 0,
        left: pointPosition.value.x,
        marginLeft: -pointerSize,
        transform: [
          {
            rotate: pointPosition.value.topHalfOfViewport ? '0deg' : '180deg',
          },
        ],
      };
    }
    return {
      position: 'absolute',
      top: -10000,
    };
  }, []);

  return (
    <View
      {...rest}
      ref={element}
      collapsable={false}
      onLayout={onElementLayout}
    >
      {children}
      <Portal hostName={portalHostName}>
        {visible ? (
          <>
            <View
              style={styles.backdrop}
              ref={backdrop}
              pointerEvents="none"
              onLayout={onBackdropLayout}
            />
            <Animated.View style={[containerStyle, containerAnimatedStyle]}>
              <Animated.View entering={entering} exiting={exiting}>
                <Animated.View
                  style={tooltipAnimatedStyle}
                  ref={tooltip}
                  onLayout={onTooltipLayout}
                >
                  <View style={tooltipStyle ?? styles.defaultTooltip}>
                    {content}
                  </View>
                </Animated.View>
                {withPointer ? (
                  <Animated.View style={pointerAnimatedStyle}>
                    <Pointer
                      style={pointerStyle}
                      size={pointerSize}
                      color={pointerColor}
                    />
                  </Animated.View>
                ) : null}
              </Animated.View>
            </Animated.View>
          </>
        ) : null}
      </Portal>
    </View>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  defaultTooltip: {
    backgroundColor: '#F3F2F7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 8,
  },
});
