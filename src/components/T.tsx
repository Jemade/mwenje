import { Text, TextProps, TextStyle } from 'react-native';
import { colors, fonts, Weight } from '../theme';

type Props = TextProps & {
  w?: Weight;
  size?: number;
  color?: string;
  /** letter-spacing in em, like the CSS in the design */
  ls?: number;
  upper?: boolean;
  center?: boolean;
  lh?: number;
};

/** Text in Manrope. `w` picks the weight, since custom fonts ignore fontWeight. */
export function T({ w = 600, size = 15, color = colors.text, ls, upper, center, lh, style, ...rest }: Props) {
  const s: TextStyle = {
    fontFamily: fonts[w],
    fontSize: size,
    color,
    letterSpacing: ls !== undefined ? ls * size : undefined,
    textTransform: upper ? 'uppercase' : undefined,
    textAlign: center ? 'center' : undefined,
    lineHeight: lh !== undefined ? lh * size : undefined,
    fontVariant: ['tabular-nums'],
  };
  return <Text {...rest} style={[s, style]} />;
}
