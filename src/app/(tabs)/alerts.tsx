import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Animated, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from '../../components/Icon';
import { T } from '../../components/T';
import { TAB_BAR_SPACE } from '../../components/TabBar';
import { Press, tap } from '../../components/ui';
import { useNow, useStore } from '../../store';
import { clock, sameDay } from '../../store/format';
import { AlertItem, AlertKind } from '../../store/mock';
import { colors, shadow } from '../../theme';

const LOOK: Record<AlertKind, { icon: IconName; bg: string; fg: string }> = {
  back: { icon: 'bolt', bg: colors.gold, fg: colors.midnight },
  likely: { icon: 'clock', bg: colors.alertBg, fg: colors.alertText },
  off: { icon: 'boltOff', bg: colors.midnight, fg: colors.white },
};

function Switch({ value, onToggle, label }: { value: boolean; onToggle: () => void; label: string }) {
  const [x] = useState(() => new Animated.Value(value ? 1 : 0));
  useEffect(() => {
    Animated.spring(x, { toValue: value ? 1 : 0, useNativeDriver: false, bounciness: 6 }).start();
  }, [value, x]);
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => {
        tap();
        onToggle();
      }}
      hitSlop={8}
    >
      <Animated.View style={{ width: 52, height: 30, borderRadius: 15, backgroundColor: x.interpolate({ inputRange: [0, 1], outputRange: ['rgba(255,255,255,0.25)', colors.gold] }) }}>
        <Animated.View style={{ position: 'absolute', top: 3, left: x.interpolate({ inputRange: [0, 1], outputRange: [3, 25] }), width: 24, height: 24, borderRadius: 12, backgroundColor: colors.white }} />
      </Animated.View>
    </Pressable>
  );
}

function Group({ title, items, onPress }: { title: string; items: AlertItem[]; onPress: (id: string) => void }) {
  if (!items.length) return null;
  return (
    <>
      <T w={800} size={13} color={colors.subtle} ls={0.08} upper style={{ marginTop: 22, marginBottom: 10, marginHorizontal: 24 }}>
        {title}
      </T>
      <View style={{ marginHorizontal: 16, backgroundColor: colors.white, borderRadius: 28, paddingVertical: 6, paddingHorizontal: 16, boxShadow: '0px 10px 30px rgba(46,49,145,0.06)' }}>
        {items.map((f, i) => {
          const look = LOOK[f.kind];
          return (
            <Press
              key={f.id}
              onPress={() => onPress(f.id)}
              style={{ flexDirection: 'row', gap: 14, alignItems: 'center', paddingVertical: 14, borderBottomWidth: i === items.length - 1 ? 0 : 1, borderColor: colors.divider }}
            >
              <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: look.bg, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={look.icon} size={20} stroke={2.2} color={look.fg} />
              </View>
              <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
                <T w={800} size={15}>
                  {f.title}
                </T>
                <T w={600} size={13} color={colors.muted}>
                  {f.body}
                </T>
              </View>
              <View style={{ alignSelf: 'flex-start', paddingTop: 4, alignItems: 'flex-end', gap: 8 }}>
                <T w={700} size={12} color={colors.subtle}>
                  {clock(f.at)}
                </T>
                {!f.read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.alert }} />}
              </View>
            </Press>
          );
        })}
      </View>
    </>
  );
}

export default function Alerts() {
  const { alerts, headsUp, unread, dispatch } = useStore();
  const now = useNow(60_000);
  const insets = useSafeAreaInsets();
  const today = new Date(now);
  const sorted = [...alerts].sort((a, b) => b.at - a.at);
  const todays = sorted.filter((a) => sameDay(new Date(a.at), today));
  const earlier = sorted.filter((a) => !sameDay(new Date(a.at), today));
  const read = (id: string) => dispatch({ type: 'markRead', id });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: TAB_BAR_SPACE + insets.bottom }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 24, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <T w={800} size={28} ls={-0.03}>
            Alerts
          </T>
          <Press onPress={() => dispatch({ type: 'markAllRead' })} disabled={!unread} hitSlop={10} style={{ paddingBottom: 4, opacity: unread ? 1 : 0.4 }}>
            <T w={700} size={14} color={colors.navy}>
              Mark all read
            </T>
          </Press>
        </View>

        <View style={{ marginTop: 18, marginHorizontal: 16, borderRadius: 28, backgroundColor: colors.navy, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, boxShadow: shadow.card }}>
          <View style={{ width: 50, height: 50, borderRadius: 18, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="bell" size={24} stroke={2.2} color={colors.midnight} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <T w={800} size={16} color={colors.white}>
              30-min heads-up
            </T>
            <T w={600} size={13} color={colors.lavender}>
              {headsUp ? 'Before every likely cut' : 'Off · you won’t be warned'}
            </T>
          </View>
          <Switch value={headsUp} onToggle={() => dispatch({ type: 'toggleHeadsUp' })} label="30-min heads-up" />
        </View>

        <Group title="Today" items={todays} onPress={read} />
        <Group title="Earlier" items={earlier} onPress={read} />
      </ScrollView>
    </View>
  );
}
