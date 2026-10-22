import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';

interface MiniLedgerLogoProps {
  size?: number;
  withGlow?: boolean;
  style?: ViewStyle;
}

export function MiniLedgerLogo({ size = 44, withGlow = true, style }: MiniLedgerLogoProps) {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {withGlow && <View style={[styles.glow, { width: size * 1.4, height: size * 1.4 }]} />}
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <Defs>
          <LinearGradient id="leafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#10B981" />
            <Stop offset="50%" stopColor="#34E0A1" />
            <Stop offset="100%" stopColor="#6EE7B7" />
          </LinearGradient>
          <LinearGradient id="veinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#064E3B" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#047857" stopOpacity="0.2" />
          </LinearGradient>
        </Defs>

        {/* Dynamic Stylized Leaf matching reference */}
        <Path
          d="M20,80 C22,50 45,20 85,15 C85,55 58,82 20,80 Z"
          fill="url(#leafGrad)"
        />
        {/* Leaf Center Vein */}
        <Path
          d="M20,80 C38,65 55,45 85,15"
          stroke="#064E3B"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeOpacity="0.45"
        />
        {/* Subtle Side Veins */}
        <Path
          d="M38,65 C48,60 56,66 60,70"
          stroke="#064E3B"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.35"
        />
        <Path
          d="M52,48 C62,42 70,46 76,50"
          stroke="#064E3B"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.35"
        />
        {/* Friendly mascot spark */}
        <Circle cx="48" cy="36" r="3" fill="#FFFFFF" opacity={0.7} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(52, 224, 161, 0.18)',
    transform: [{ scale: 1.1 }],
  },
});
