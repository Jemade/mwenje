import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Glow } from '../components/Glow';
import { Icon } from '../components/Icon';
import { T } from '../components/T';
import { AvatarStack, Press, success } from '../components/ui';
import { useStore } from '../store';
import { plural } from '../store/format';
import { PowerStatus } from '../store/mock';
import { colors } from '../theme';

export default function Report() {
  const { area, dispatch } = useStore();
  const params = useLocalSearchParams<{ status?: PowerStatus }>();
  const insets = useSafeAreaInsets();
  // default to the opposite of what the suburb shows now
  const [choice, setChoice] = useState<PowerStatus>(params.status ?? (area.status === 'off' ? 'on' : 'off'));
  const [sent, setSent] = useState(false);
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/home'));

  const submit = () => {
    if (sent) return;
    dispatch({ type: 'report', id: area.id, status: choice });
    success();
    setSent(true);
    setTimeout(close, 1100);
  };

  const off = choice === 'off';
  const segment = (value: PowerStatus, label: string) => {
    const on = choice === value;
    return (
      <Press
        onPress={() => !sent && setChoice(value)}
        accessibilityRole="tab"
        accessibilityState={{ selected: on }}
        style={{ flex: 1, height: 46, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? colors.white : 'transparent' }}
      >
        <T w={800} size={15} color={on ? colors.midnight : colors.lavender}>
          {label}
        </T>
      </Press>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.midnight, overflow: 'hidden' }}>
      <StatusBar style="light" />
      <Glow size={560} color={colors.navy} opacity={0.9} style={{ left: '50%', marginLeft: -280, top: '56%', marginTop: -280 }} />

      <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Press onPress={close} accessibilityLabel="Close" style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="close" size={20} stroke={2.2} color={colors.white} />
        </Press>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="pin" size={16} stroke={2.2} color={colors.lavender} />
          <T w={700} size={14} color={colors.lavender}>
            {area.name}
          </T>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <View style={{ paddingTop: 28, paddingHorizontal: 24, gap: 22 }}>
        <T w={800} size={32} ls={-0.035} lh={1.12} color={colors.white}>
          What’s your power doing right now?
        </T>
        <View style={{ flexDirection: 'row', padding: 5, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.08)' }}>
          {segment('off', 'It went off')}
          {segment('on', "It's back")}
        </View>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: 290,
            height: 290,
            borderRadius: 145,
            backgroundColor: 'rgba(235,181,27,0.07)',
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.12] }) }],
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.2] }),
          }}
        />
        <View pointerEvents="none" style={{ position: 'absolute', width: 236, height: 236, borderRadius: 118, backgroundColor: 'rgba(235,181,27,0.12)' }} />
        <Press
          onPress={submit}
          accessibilityRole="button"
          accessibilityLabel={off ? 'Report power off' : 'Report power back'}
          style={{ width: 184, height: 184, borderRadius: 92, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0px 20px 50px rgba(235,181,27,0.4)' }}
        >
          <Icon name={sent ? 'check' : off ? 'boltOff' : 'bolt'} size={56} color={colors.midnight} />
          <T w={800} size={16}>
            {sent ? 'Thanks! Reported' : off ? 'Tap: power off' : 'Tap: power back'}
          </T>
        </Press>
      </View>

      <View style={{ paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom, 20) + 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <AvatarStack ring={colors.midnight} fills={[colors.navy, colors.gold, colors.white]} />
        <T w={600} size={14} color={colors.lavender} style={{ flexShrink: 1 }}>
          {plural(area.recent, 'neighbour')} reported in the last 10 min
        </T>
      </View>
    </View>
  );
}
