import Svg, { Circle, Path, Rect } from 'react-native-svg';

// Line icons used across the design (24×24, round caps).
const paths = {
  home: ['M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'],
  map: ['M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z', 'M9 4v14M15 6v14'],
  plus: ['M12 8v8M8 12h8'],
  trend: ['M3 17l5-5 4 4 8-8', 'M15 8h5v5'],
  bell: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'],
  bolt: ['M13 2L3 14h9l-1 8 10-12h-9l1-8z'],
  boltOff: ['M13 2L3 14h9l-1 8 10-12h-9l1-8z', 'M2 2l20 20'],
  clock: ['M12 7v5l3 2'],
  chevronDown: ['M6 9l6 6 6-6'],
  arrowRight: ['M5 12h14M13 6l6 6-6 6'],
  close: ['M18 6L6 18M6 6l12 12'],
  pin: ['M12 21s-7-6.3-7-11.5A7 7 0 0 1 19 9.5C19 14.7 12 21 12 21z'],
  search: ['M21 21l-4.3-4.3'],
  filter: ['M4 6h16M7 12h10M10 18h4'],
  calendar: ['M3 10h18M8 3v4M16 3v4'],
  check: ['M5 12.5l4.5 4.5L19 7'],
} as const;

export type IconName = keyof typeof paths;

type Props = { name: IconName; size?: number; color?: string; stroke?: number };

export function Icon({ name, size = 22, color = '#12133D', stroke = 2 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {(name === 'plus' || name === 'clock') && <Circle cx={12} cy={12} r={9} />}
      {name === 'pin' && <Circle cx={12} cy={9.5} r={2.5} />}
      {name === 'search' && <Circle cx={11} cy={11} r={7} />}
      {name === 'calendar' && <Rect x={3} y={5} width={18} height={16} rx={3} />}
      {paths[name].map((d) => (
        <Path key={d} d={d} />
      ))}
    </Svg>
  );
}
