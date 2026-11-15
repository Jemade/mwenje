// Mwenje design tokens, taken 1:1 from the design canvas.
export const colors = {
  navy: '#2E3191',
  midnight: '#12133D',
  gold: '#EBB51B',
  goldSoft: '#F6DB86',
  alert: '#E5484D',
  alertText: '#B4232A',
  alertBg: '#FDECEC',
  bg: '#F6F6FA',
  card: '#FFFFFF',
  text: '#12133D',
  textBody: '#4A4D6E',
  muted: '#6B6E8A',
  subtle: '#8A8DA8',
  lavender: '#C9CAEB',
  inactive: '#A9ABD6',
  track: '#EFF0F6',
  divider: '#F0F1F6',
  chip: '#EEEFF8',
  dotOff: '#D7D8E8',
  mapBg: '#E9EBF3',
  mapBlock: '#F2F3F8',
  white: '#FFFFFF',
} as const;

export const fonts = {
  400: 'Manrope_400Regular',
  500: 'Manrope_500Medium',
  600: 'Manrope_600SemiBold',
  700: 'Manrope_700Bold',
  800: 'Manrope_800ExtraBold',
} as const;

export type Weight = keyof typeof fonts;

export const shadow = {
  card: '0px 10px 30px rgba(46,49,145,0.07)',
  soft: '0px 4px 14px rgba(46,49,145,0.08)',
  float: '0px 16px 40px rgba(18,19,61,0.16)',
  tabBar: '0px 14px 30px rgba(18,19,61,0.3)',
  pin: '0px 6px 14px rgba(18,19,61,0.22)',
} as const;

/** Convert a CSS em letter-spacing into React Native points. */
export const em = (value: number, fontSize: number) => value * fontSize;
