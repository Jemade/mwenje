import { StatusBar } from 'expo-status-bar';
import { ComponentRef, useMemo, useRef, useState } from 'react';
import { GestureResponderEvent, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { Icon } from '../../components/Icon';
import { T } from '../../components/T';
import { TAB_BAR_SPACE } from '../../components/TabBar';
import { Press } from '../../components/ui';
import { useStore } from '../../store';
import { hourLabel, monthName, weekday } from '../../store/format';
import { chanceOfPower, Cut, forecastFor } from '../../store/mock';
import { colors, shadow } from '../../theme';

const CH = 160;
const yFor = (c: number) => 10 + (1 - c) * 140;

/** Smooth line through points (Catmull-Rom converted to cubic Béziers). */
function smoothPath(pts: [number, number][]) {
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

const defaultHour = (cut: Cut | null) => (cut ? Math.min(cut.end, cut.start + 2) : 12);

export default function Forecast() {
  const { area } = useStore();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const today = useMemo(() => new Date(), []);
  const days = useMemo(() => forecastFor(area, today), [area, today]);
  const [sel, setSel] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const day = days[sel];
  const [hour, setHour] = useState(() => defaultHour(days[1].cut));

  const W = Math.min(width, 520) - 32 - 40;
  const xFor = (h: number) => (h / 24) * W;

  const line = useMemo(() => {
    const pts: [number, number][] = [];
    for (let h = 0; h <= 24; h += 0.75) pts.push([xFor(h), yFor(chanceOfPower(day.cut, h))]);
    return smoothPath(pts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, W]);

  const chartRef = useRef<ComponentRef<typeof View>>(null);
  const chartLeft = useRef(0);
  const scrub = (e: GestureResponderEvent) => {
    const x = e.nativeEvent.pageX - chartLeft.current;
    if (Number.isFinite(x)) setHour(Math.max(0, Math.min(24, Math.round((x / W) * 48) / 2)));
  };

  const choose = (i: number) => {
    setSel(i);
    setHour(defaultHour(days[i].cut));
  };

  const chance = chanceOfPower(day.cut, hour);
  const mx = xFor(hour);
  const my = yFor(chance);
  const tipLeft = mx + 11 + 140 > W ? mx - 11 - 140 : mx + 11;

  const upcoming = days.map((d, i) => ({ ...d, i })).filter((d) => d.cut && (showAll ? d.i !== sel : d.i > sel));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: TAB_BAR_SPACE + insets.bottom, maxWidth: 520, width: '100%', alignSelf: 'center' }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ gap: 2 }}>
            <T w={600} size={13} color={colors.muted}>
              {area.name} · {monthName(today)}
            </T>
            <T w={800} size={28} ls={-0.03}>
              Forecast
            </T>
          </View>
          <Press onPress={() => choose(0)} accessibilityLabel="Jump to today" style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', boxShadow: shadow.soft }}>
            <Icon name="calendar" size={20} color={colors.text} />
          </Press>
        </View>

        {/* Week strip */}
        <View style={{ marginTop: 18, marginHorizontal: 16, flexDirection: 'row', gap: 6 }}>
          {days.map((d, i) => {
            const on = i === sel;
            return (
              <Press
                key={i}
                onPress={() => choose(i)}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`${weekday(d.date)} ${d.date.getDate()}${d.cut ? ', cut likely' : ''}`}
                style={{ flex: 1, height: 70, borderRadius: 22, backgroundColor: on ? colors.midnight : colors.white, alignItems: 'center', justifyContent: 'center', gap: 4 }}
              >
                <T w={700} size={12} color={on ? colors.white : colors.text} style={{ opacity: 0.75 }}>
                  {weekday(d.date)}
                </T>
                <T w={800} size={17} color={on ? colors.white : colors.text}>
                  {d.date.getDate()}
                </T>
                <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: d.cut ? (on ? colors.gold : colors.alert) : 'transparent' }} />
              </Press>
            );
          })}
        </View>

        {/* Chart card */}
        <View style={{ marginTop: 16, marginHorizontal: 16, backgroundColor: colors.white, borderRadius: 30, padding: 20, gap: 12, boxShadow: shadow.card }}>
          <View style={{ gap: 2 }}>
            <T w={600} size={13} color={colors.muted}>
              Chance of power · {weekday(day.date)} {day.date.getDate()}
            </T>
            <T w={800} size={22} ls={-0.02}>
              {day.cut ? `Cut likely ${hourLabel(day.cut.start)}–${hourLabel(day.cut.end)}` : 'No cuts expected'}
            </T>
          </View>

          <View
            ref={chartRef}
            onLayout={() => chartRef.current?.measureInWindow((x) => (chartLeft.current = x))}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderTerminationRequest={() => false}
            onResponderGrant={scrub}
            onResponderMove={scrub}
            accessibilityHint="Tap or drag across the chart to see the chance of power at that time"
            style={{ width: W, height: CH }}
          >
            <Svg width={W} height={CH} style={{ position: 'absolute' }}>
              <Defs>
                <LinearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={colors.gold} stopOpacity={0.38} />
                  <Stop offset="1" stopColor={colors.gold} stopOpacity={0} />
                </LinearGradient>
              </Defs>
              {day.cut && <Rect x={xFor(day.cut.start)} y={0} width={xFor(day.cut.end - day.cut.start)} height={CH} rx={12} fill={colors.midnight} opacity={0.06} />}
              <Path d={`M0 40h${W}M0 80h${W}M0 120h${W}`} stroke={colors.track} strokeWidth={1} />
              <Path d={`${line} L${W} ${CH} L0 ${CH} Z`} fill="url(#gold)" />
              <Path d={line} fill="none" stroke={colors.gold} strokeWidth={3.5} strokeLinecap="round" />
              <Path d={`M${mx} 0V${CH}`} stroke={colors.midnight} strokeWidth={1.5} strokeDasharray="4 4" />
              <Circle cx={mx} cy={my} r={7} fill={colors.midnight} stroke={colors.white} strokeWidth={3} />
            </Svg>
            {day.cut && (
              <T w={800} size={11} color={colors.muted} ls={0.06} upper style={{ position: 'absolute', left: xFor(day.cut.start) + 6, top: 6 }}>
                Likely off
              </T>
            )}
            <View pointerEvents="none" style={{ position: 'absolute', left: tipLeft, top: my - 36 < 24 ? my + 14 : Math.min(CH - 28, my - 36), paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, backgroundColor: colors.midnight }}>
              <T w={800} size={12} color={colors.white} numberOfLines={1}>
                {hourLabel(hour)} · {Math.round(chance * 100)}% chance
              </T>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {['00:00', '06:00', '12:00', '18:00', '24:00'].map((t) => (
              <T key={t} w={700} size={12} color={colors.subtle}>
                {t}
              </T>
            ))}
          </View>
        </View>

        {/* Coming up */}
        <View style={{ marginTop: 18, marginBottom: 10, marginHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <T w={800} size={17}>
            {showAll ? 'This week' : 'Coming up'}
          </T>
          <Press onPress={() => setShowAll(!showAll)} hitSlop={10}>
            <T w={700} size={13} color={colors.navy}>
              {showAll ? 'Show less' : 'See all'}
            </T>
          </Press>
        </View>
        <View style={{ marginHorizontal: 16, gap: 10 }}>
          {upcoming.length === 0 && (
            <View style={{ height: 68, backgroundColor: colors.white, borderRadius: 22, justifyContent: 'center', paddingHorizontal: 16 }}>
              <T w={700} size={14} color={colors.muted}>
                No more cuts expected this week
              </T>
            </View>
          )}
          {upcoming.map((u) => (
            <Press key={u.i} onPress={() => choose(u.i)} style={{ height: 68, backgroundColor: colors.white, borderRadius: 22, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16 }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.chip, alignItems: 'center', justifyContent: 'center' }}>
                <T w={800} size={10} color={colors.navy} upper lh={1}>
                  {weekday(u.date)}
                </T>
                <T w={800} size={16} color={colors.navy} lh={1.1}>
                  {u.date.getDate()}
                </T>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <T w={800} size={15}>
                  {hourLabel(u.cut!.start)} – {hourLabel(u.cut!.end)}
                </T>
                <T w={600} size={12} color={colors.muted}>
                  {u.cut!.note}
                </T>
              </View>
              <T w={800} size={15}>
                {Math.round(u.cut!.prob * 100)}%
              </T>
            </Press>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
