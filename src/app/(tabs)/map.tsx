import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Animated, Easing, Keyboard, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { Icon } from '../../components/Icon';
import { T } from '../../components/T';
import { AvatarStack, Press, StatusPill } from '../../components/ui';
import { useNow, useStore } from '../../store';
import { ago, hmWords, plural } from '../../store/format';
import { Area, mapLabels } from '../../store/mock';
import { colors, fonts, shadow } from '../../theme';

type Filter = 'all' | 'off' | 'on';
const FILTER_LABEL: Record<Filter, string> = { all: 'All suburbs', off: 'Without power', on: 'With power' };

const BLOCKS =
  'M20 120h120v90H20zM170 90h90v110h-90zM290 140h110v80H290zM-10 250h110v120H-10zM130 240h100v100H130zM260 260h140v90H260zM30 410h120v100H30zM180 390h90v130h-90zM300 400h100v110H300zM-10 560h140v90H-10zM160 560h120v80H160zM300 560h100v100H300z';
const MAIN_ROAD = 'M150 -20C140 120 160 260 150 380S120 640 140 880';
const ROADS: [string, number][] = [
  ['M-20 230C80 220 160 250 230 225S350 190 420 210', 16],
  [MAIN_ROAD, 18],
  ['M-20 380C90 370 200 400 290 375S380 360 420 365', 10],
  ['M270 -20C280 120 270 300 285 540', 10],
  ['M-20 540C100 530 260 560 420 530', 10],
];

export default function MapScreen() {
  const { areas, area: myArea, dispatch } = useStore();
  const now = useNow();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [selectedId, setSelectedId] = useState(myArea.id);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 2000, easing: Easing.out(Easing.quad), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  // the map art is drawn in the 390×844 design frame and scaled to cover the screen
  const s = Math.max(width / 390, height / 844);
  const ox = (width - 390 * s) / 2;
  const oy = (height - 844 * s) / 2;
  const px = (x: number) => ox + x * s;
  const py = (y: number) => oy + y * s;

  const selected = areas.find((a) => a.id === selectedId) ?? myArea;
  const results = query.trim() ? areas.filter((a) => a.name.toLowerCase().includes(query.trim().toLowerCase())) : [];
  const visible = areas.filter((a) => a.pos && a.id !== selected.id && (filter === 'all' || a.status === filter));

  const pick = (a: Area) => {
    setSelectedId(a.id);
    setQuery('');
    Keyboard.dismiss();
  };

  const selOff = selected.status === 'off';

  return (
    <View style={{ flex: 1, backgroundColor: colors.mapBg, overflow: 'hidden' }}>
      <StatusBar style="dark" />
      <Svg width={width} height={height} viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute' }}>
        <Rect width={390} height={844} fill={colors.mapBg} />
        <Path d={BLOCKS} fill={colors.mapBlock} />
        {ROADS.map(([d, w]) => (
          <Path key={d} d={d} fill="none" stroke={colors.white} strokeWidth={w} strokeLinecap="round" />
        ))}
        <Path d={MAIN_ROAD} fill="none" stroke={colors.goldSoft} strokeWidth={4} strokeLinecap="round" opacity={0.8} />
      </Svg>

      {mapLabels.map((l) => (
        <T key={l.text} w={700} size={11} color={colors.subtle} ls={0.08} upper style={{ position: 'absolute', left: px(l.x), top: py(l.y) }}>
          {l.text}
        </T>
      ))}

      {visible.map((a) => {
        const on = a.status === 'on';
        return (
          <Press
            key={a.id}
            onPress={() => pick(a)}
            accessibilityLabel={`${a.name}, power ${a.status}`}
            hitSlop={8}
            style={{
              position: 'absolute',
              left: px(a.pos!.x) - 20,
              top: py(a.pos!.y) - 20,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: on ? colors.gold : colors.midnight,
              borderWidth: 3,
              borderColor: colors.white,
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: shadow.pin,
            }}
          >
            <T w={800} size={13} color={on ? colors.midnight : colors.white}>
              {on ? 'ON' : a.reporters}
            </T>
          </Press>
        );
      })}

      {selected.pos && (
        <>
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: px(selected.pos.x) - 60,
              top: py(selected.pos.y) - 60,
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: 'rgba(46,49,145,0.12)',
              transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.1] }) }],
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] }),
            }}
          />
          <View pointerEvents="none" style={{ position: 'absolute', left: px(selected.pos.x) - 40, top: py(selected.pos.y) - 40, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(46,49,145,0.18)' }} />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: px(selected.pos.x) - 26,
              top: py(selected.pos.y) - 26,
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: selOff ? colors.midnight : colors.gold,
              borderWidth: 4,
              borderColor: selOff ? colors.gold : colors.white,
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0px 10px 20px rgba(18,19,61,0.35)',
            }}
          >
            <T w={800} size={15} color={selOff ? colors.white : colors.midnight}>
              {selOff ? selected.reporters : 'ON'}
            </T>
          </View>
        </>
      )}

      {/* Search + filter */}
      <View style={{ position: 'absolute', left: 16, right: 16, top: insets.top + 4, gap: 8 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1, height: 52, borderRadius: 26, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, boxShadow: '0px 8px 20px rgba(18,19,61,0.1)' }}>
            <Icon name="search" size={20} stroke={2.2} color={colors.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search a suburb"
              placeholderTextColor={colors.subtle}
              accessibilityLabel="Search a suburb"
              returnKeyType="search"
              onSubmitEditing={() => results[0] && pick(results[0])}
              style={{ flex: 1, minWidth: 0, fontFamily: fonts[600], fontSize: 15, color: colors.text, paddingVertical: 0, outlineStyle: 'none' } as object}
            />
          </View>
          <Press
            onPress={() => setFilter(filter === 'all' ? 'off' : filter === 'off' ? 'on' : 'all')}
            accessibilityLabel={`Filter: ${FILTER_LABEL[filter]}`}
            style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: filter === 'all' ? colors.midnight : colors.gold, alignItems: 'center', justifyContent: 'center', boxShadow: '0px 8px 20px rgba(18,19,61,0.2)' }}
          >
            <Icon name="filter" size={20} stroke={2.2} color={filter === 'all' ? colors.white : colors.midnight} />
          </Press>
        </View>

        {filter !== 'all' && !results.length && (
          <View style={{ alignSelf: 'flex-end', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: colors.midnight }}>
            <T w={800} size={12} color={colors.white}>
              {FILTER_LABEL[filter]}
            </T>
          </View>
        )}

        {query.trim() !== '' && (
          <View style={{ backgroundColor: colors.white, borderRadius: 24, paddingVertical: 6, paddingHorizontal: 16, boxShadow: shadow.float }}>
            {results.length === 0 && (
              <T w={600} size={14} color={colors.muted} style={{ paddingVertical: 12 }}>
                No suburb called “{query.trim()}” yet
              </T>
            )}
            {results.map((a, i) => (
              <Press key={a.id} onPress={() => pick(a)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderColor: colors.divider }}>
                <View>
                  <T w={800} size={15}>
                    {a.name}
                  </T>
                  <T w={600} size={12} color={colors.muted}>
                    {a.city}
                  </T>
                </View>
                <StatusPill off={a.status === 'off'} label={a.status === 'off' ? 'Off' : 'On'} />
              </Press>
            ))}
          </View>
        )}
      </View>

      {/* Selected suburb card */}
      <View style={{ position: 'absolute', left: 16, right: 16, bottom: Math.max(insets.bottom - 4, 16) + 84, backgroundColor: colors.white, borderRadius: 30, padding: 20, gap: 16, boxShadow: shadow.float }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ gap: 4 }}>
            <T w={800} size={22} ls={-0.02}>
              {selected.name}
            </T>
            <T w={600} size={13} color={colors.muted}>
              Updated {ago(Math.max(selected.since, now - 60_000), now)}
            </T>
          </View>
          <StatusPill off={selOff} label={`${selOff ? 'Off' : 'On'} ${hmWords(now - selected.since)}`} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <AvatarStack size={30} ring={colors.white} fills={[colors.navy, colors.gold, colors.midnight]} />
            <T w={700} size={14}>
              {plural(selected.reporters, 'neighbour')} reported
            </T>
          </View>
          <Press
            onPress={() => {
              dispatch({ type: 'setArea', id: selected.id });
              router.navigate('/home');
            }}
            accessibilityLabel={`Open ${selected.name}`}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name="arrowRight" size={20} stroke={2.6} color={colors.midnight} />
          </Press>
        </View>
      </View>
    </View>
  );
}
