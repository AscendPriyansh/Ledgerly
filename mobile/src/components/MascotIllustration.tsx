import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Ellipse } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface MascotIllustrationProps {
  height?: number;
}

export function MascotIllustration({ height = 240 }: MascotIllustrationProps) {
  const w = Math.min(width, 420);

  return (
    <View style={[styles.container, { height }]}>
      <Svg width={w} height={height} viewBox="0 0 360 220" fill="none">
        <Defs>
          <LinearGradient id="mountainBack" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#0E1E28" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#09131B" stopOpacity="0.95" />
          </LinearGradient>
          <LinearGradient id="mountainFront" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#0B1A24" />
            <Stop offset="100%" stopColor="#050B10" />
          </LinearGradient>
          <LinearGradient id="leafGlowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#10B981" />
            <Stop offset="60%" stopColor="#34E0A1" />
            <Stop offset="100%" stopColor="#A7F3D0" />
          </LinearGradient>
          <LinearGradient id="horizonGlow" x1="0%" y1="100%" x2="0%" y2="0%">
            <Stop offset="0%" stopColor="#0E3326" stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#090D14" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Ambient emerald horizon glow */}
        <Path d="M0,80 Q180,40 360,80 L360,220 L0,220 Z" fill="url(#horizonGlow)" />

        {/* Stars */}
        <Circle cx="40" cy="30" r="1" fill="#FFFFFF" opacity={0.6} />
        <Circle cx="85" cy="45" r="1.5" fill="#34E0A1" opacity={0.8} />
        <Circle cx="120" cy="20" r="1" fill="#FFFFFF" opacity={0.5} />
        <Circle cx="180" cy="35" r="1.2" fill="#FFFFFF" opacity={0.7} />
        <Circle cx="260" cy="25" r="1.5" fill="#34E0A1" opacity={0.7} />
        <Circle cx="310" cy="50" r="1" fill="#FFFFFF" opacity={0.5} />
        <Circle cx="230" cy="60" r="0.8" fill="#FFFFFF" opacity={0.4} />

        {/* Distant mountains */}
        <Path
          d="M0,150 Q90,95 180,135 T360,130 L360,220 L0,220 Z"
          fill="url(#mountainBack)"
        />

        {/* Floating MiniLedger Leaf in the sky */}
        <Ellipse cx="76" cy="98" rx="28" ry="24" fill="rgba(52, 224, 161, 0.12)" />
        <Path
          d="M62,106 C64,90 76,75 92,72 C92,88 80,107 62,106 Z"
          fill="url(#leafGlowGrad)"
        />
        <Path
          d="M62,106 C70,98 80,87 92,72"
          stroke="#064E3B"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.5"
        />

        {/* Foreground Cliff & Seated Person Silhouette */}
        <Path
          d="M70,220 Q120,160 170,165 Q230,170 360,195 L360,220 Z"
          fill="url(#mountainFront)"
        />

        {/* Seated figure watching the leaf */}
        <Circle cx="140" cy="142" r="6" fill="#0E232F" />
        <Path
          d="M135,148 C135,148 140,147 145,148 C147,152 148,158 147,166 C143,166 137,166 133,166 C132,158 133,152 135,148 Z"
          fill="#0E232F"
        />
        {/* Legs bent on the cliff */}
        <Path
          d="M134,163 C128,162 125,165 124,171 C128,172 134,171 138,166 Z"
          fill="#091820"
        />
        <Path
          d="M145,163 C151,163 154,166 156,172 C151,173 146,171 142,166 Z"
          fill="#091820"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
