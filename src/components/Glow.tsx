import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

/** Soft radial glow, like the CSS radial-gradient(circle, color, transparent 70%) in the design. */
export function Glow({ size, color, opacity, style }: { size: number; color: string; opacity: number; style?: object }) {
  const id = `g${color.replace('#', '')}${Math.round(opacity * 100)}${size}`;
  return (
    <Svg width={size} height={size} style={[{ position: 'absolute' }, style]} pointerEvents="none">
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity={opacity} />
          <Stop offset="0.7" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
    </Svg>
  );
}
