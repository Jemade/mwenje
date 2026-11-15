import Svg, { Path, Rect } from 'react-native-svg';
import { colors } from '../theme';

export const PIN_PATH = 'M32 9c-10.5 0-19 8.2-19 18.6C13 41.4 32 57 32 57s19-15.6 19-29.4C51 17.2 42.5 9 32 9z';
export const BOLT_PATH = 'M34.5 16L24 31h7.5l-3 13L40 27.5h-7.6l2.1-11.5z';

type Props = { size?: number; pin?: string; bolt?: string; tile?: string };

/** The Mwenje mark: a suburb pin with power inside. Pass `tile` for the app-icon version. */
export function Logo({ size = 64, pin = colors.gold, bolt = colors.navy, tile }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityLabel="Mwenje logo">
      {tile && <Rect width={64} height={64} rx={15} fill={tile} />}
      <Path d={PIN_PATH} fill={pin} />
      <Path d={BOLT_PATH} fill={bolt} />
    </Svg>
  );
}
