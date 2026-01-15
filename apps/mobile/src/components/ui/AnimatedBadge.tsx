import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface AnimatedBadgeProps {
  count: number;
  color?: string;
  textColor?: string;
  size?: 'small' | 'medium' | 'large';
  showZero?: boolean;
}

const SIZES = {
  small: { minWidth: 16, height: 16, fontSize: 10, padding: 2 },
  medium: { minWidth: 20, height: 20, fontSize: 12, padding: 4 },
  large: { minWidth: 24, height: 24, fontSize: 14, padding: 6 },
};

export default function AnimatedBadge({
  count,
  color = '#00CCBC',
  textColor = '#FFFFFF',
  size = 'medium',
  showZero = false,
}: AnimatedBadgeProps) {
  const scale = useSharedValue(1);
  const previousCount = useSharedValue(count);

  useEffect(() => {
    if (count !== previousCount.value && count > 0) {
      // Animation de pulse quand le count change
      scale.value = withSequence(
        withSpring(1.3, { damping: 10, stiffness: 400 }),
        withSpring(1, { damping: 10, stiffness: 400 })
      );
    }
    previousCount.value = count;
  }, [count]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (count === 0 && !showZero) return null;

  const sizeConfig = SIZES[size];
  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <Animated.View
      style={[
        styles.badge,
        {
          backgroundColor: color,
          minWidth: sizeConfig.minWidth,
          height: sizeConfig.height,
          paddingHorizontal: sizeConfig.padding,
        },
        animatedStyle,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontSize: sizeConfig.fontSize,
          },
        ]}
      >
        {displayCount}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
