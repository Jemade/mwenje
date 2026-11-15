import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Icon } from '../../components/Icon';
import { T } from '../../components/T';
import { TAB_BAR_SPACE } from '../../components/TabBar';
import { Press, StatusPill } from '../../components/ui';
import { useNow, useStore } from '../../store';
import { clock, dayWord, hm, hourLabel } from '../../store/format';
import { nextCut } from '../../store/selectors';
import { colors, shadow } from '../../theme';

const R = 98;
const CIRC = 2 * Math.PI * R;

export default function Home() {
  const { area, unread } = useStore();
  const now = useNow();
  const insets = useSafeAreaInsets();
  const off = area.status === 'off';
  const elapsed = now - area.since;
  const usualMs = area.usualCutMin * 60_000;
  const frac = off ? Math.min(1, elapsed / usualMs) : Math.min(1, elapsed / (12 * 3_600_000));
  const next = nextCut(area, now);

  // round "usually back" to the nearest half hour
  const back = new Date(area.since + usualMs);
  back.setMinutes(Math.round(back.getMinutes() / 30) * 30, 0, 0);

  const stats = off
    ? [
        { v: `~${clock(back.getTime())}`, l: 'Usually back' },
        { v: String(area.reporters), l: 'Neighbours' },
        { v: `${Math.round(frac * 100)}%`, l: 'Of usual cut' },
      ]
    : [
        { v: next ? hourLabel(next.cut.start) : '—', l: 'Next cut' },
        { v: String(area.reporters), l: 'Neighbours' },
        { v: next ? `${Math.round(next.cut.prob * 100)}%` : '—', l: 'Chance' },
      ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: TAB_BAR_SPACE + insets.bottom }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' }}>
              <T w={800} size={15} color={colors.gold}>
                TM
              </T>
            </View>
            <View>
              <T w={600} size={13} color={colors.muted}>
                Your area
              </T>
              <Press onPress={() => router.push('/area')} accessibilityRole="button" accessibilityLabel="Change area" style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <T w={800} size={18} ls={-0.02}>
                  {area.name}, {area.city}
                </T>
                <Icon name="chevronDown" size={16} stroke={2.6} color={colors.text} />
              </Press>
            </View>
          </View>
          <Press
            onPress={() => router.navigate('/alerts')}
            accessibilityLabel={`Alerts, ${unread} unread`}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', boxShadow: shadow.soft }}
          >
            <Icon name="bell" size={20} color={colors.text} />
            {unread > 0 && (
              <View style={{ position: 'absolute', top: 10, right: 11, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.alert, borderWidth: 2, borderColor: colors.white }} />
            )}
          </Press>
        </View>

        {/* Status card */}
        <View style={{ marginTop: 20, marginHorizontal: 16, backgroundColor: colors.white, borderRadius: 32, paddingTop: 20, paddingHorizontal: 20, paddingBottom: 22, alignItems: 'center', gap: 18, boxShadow: shadow.card }}>
          <View style={{ alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <StatusPill off={off} label={off ? 'Power off' : 'Power on'} />
            <T w={600} size={13} color={colors.muted}>
              Since {clock(area.since)}
            </T>
          </View>

          <View style={{ width: 224, height: 224, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={224} height={224} viewBox="0 0 224 224" style={{ position: 'absolute' }}>
              <Circle cx={112} cy={112} r={R} fill="none" stroke={colors.track} strokeWidth={16} />
              <Circle
                cx={112}
                cy={112}
                r={R}
                fill="none"
                stroke={colors.gold}
                strokeWidth={16}
                strokeLinecap="round"
                strokeDasharray={`${Math.max(1, frac * CIRC)} ${CIRC}`}
                transform="rotate(-90 112 112)"
              />
              <Circle cx={112} cy={112} r={76} fill={off ? colors.midnight : colors.navy} />
            </Svg>
            <View style={{ alignItems: 'center', gap: 2 }}>
              <Icon name="bolt" size={22} stroke={2.2} color={colors.gold} />
              <T w={800} size={40} ls={-0.04} lh={1.1} color={colors.white}>
                {hm(elapsed)}
              </T>
              <T w={600} size={12} color={colors.inactive}>
                {off ? 'hours without power' : 'hours with power'}
              </T>
            </View>
          </View>

          <View style={{ alignSelf: 'stretch', flexDirection: 'row' }}>
            {stats.map((s, i) => (
              <View key={s.l} style={{ flex: 1, alignItems: 'center', gap: 2, borderLeftWidth: i === 1 ? 1 : 0, borderRightWidth: i === 1 ? 1 : 0, borderColor: colors.track }}>
                <T w={800} size={18}>
                  {s.v}
                </T>
                <T w={600} size={12} color={colors.muted}>
                  {s.l}
                </T>
              </View>
            ))}
          </View>

          <Press
            onPress={() => router.push({ pathname: '/report', params: { status: off ? 'on' : 'off' } })}
            style={{ alignSelf: 'stretch', height: 56, borderRadius: 18, backgroundColor: off ? colors.gold : colors.midnight, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Icon name={off ? 'bolt' : 'boltOff'} size={18} stroke={2.4} color={off ? colors.midnight : colors.gold} />
            <T w={800} size={16} color={off ? colors.midnight : colors.white}>
              {off ? 'My power is back' : 'My power went off'}
            </T>
          </Press>
        </View>

        {/* Next cut */}
        {next && (
          <Press
            onPress={() => router.navigate('/forecast')}
            style={{ marginTop: 14, marginHorizontal: 16, height: 84, borderRadius: 26, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18 }}
          >
            <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="clock" size={22} stroke={2.2} color={colors.gold} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <T w={600} size={13} color={colors.lavender}>
                Next likely cut
              </T>
              <T w={800} size={16} color={colors.white}>
                {dayWord(next.date, new Date(now))} · {hourLabel(next.cut.start)} – {hourLabel(next.cut.end)}
              </T>
            </View>
            <T w={800} size={15} color={colors.gold}>
              {Math.round(next.cut.prob * 100)}%
            </T>
          </Press>
        )}
      </ScrollView>
    </View>
  );
}
