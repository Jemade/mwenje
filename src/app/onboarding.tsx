import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Glow } from '../components/Glow';
import { Icon } from '../components/Icon';
import { Logo } from '../components/Logo';
import { T } from '../components/T';
import { Press } from '../components/ui';
import { useStore } from '../store';
import { colors } from '../theme';

const SLIDES = [
  { title: 'Never get caught in the dark again', body: 'See if your suburb has power right now, and get a heads-up before the next cut.' },
  { title: 'Your neighbours are the grid map', body: 'One tap tells everyone nearby when power goes off or comes back. No waiting for official updates.' },
  { title: 'Plan around the next cut', body: 'Mwenje learns your suburb’s pattern and warns you 30 minutes before power is likely to go.' },
];

const SHEET = 382;

export default function Onboarding() {
  const { dispatch } = useStore();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [slide, setSlide] = useState(0);
  const hero = height - SHEET;
  const cy = Math.max(insets.top + 120, hero * 0.56);

  const finish = () => {
    dispatch({ type: 'onboard' });
    router.replace('/home');
  };

  const ring = (size: number, border: string) => (
    <View style={{ position: 'absolute', left: '50%', top: cy, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, borderRadius: size / 2, borderWidth: 1, borderColor: border }} />
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.navy, overflow: 'hidden' }}>
      <StatusBar style="light" />
      {ring(520, 'rgba(255,255,255,0.08)')}
      {ring(380, 'rgba(255,255,255,0.12)')}
      <Glow size={300} color={colors.gold} opacity={0.45} style={{ left: '50%', top: cy - 150, marginLeft: -150 }} />

      <View
        style={{
          position: 'absolute',
          left: '50%',
          top: cy - 66,
          marginLeft: -66,
          width: 132,
          height: 132,
          borderRadius: 40,
          backgroundColor: colors.gold,
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0px 24px 50px rgba(18,19,61,0.4)',
        }}
      >
        <Logo size={96} pin={colors.midnight} bolt={colors.gold} />
      </View>

      <Chip dot={colors.gold} label="Power back · Borrowdale" style={{ left: 18, top: Math.max(insets.top + 40, hero * 0.277) }} />
      <Chip dot={colors.alert} label="Cut likely 05:00" style={{ right: 16, top: cy + 92 }} />

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          minHeight: SHEET,
          backgroundColor: colors.white,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          paddingTop: 30,
          paddingHorizontal: 24,
          paddingBottom: Math.max(insets.bottom, 20),
          gap: 14,
        }}
      >
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {SLIDES.map((_, i) => (
            <Press key={i} accessibilityLabel={`Slide ${i + 1}`} hitSlop={10} onPress={() => setSlide(i)}>
              <View style={{ width: i === slide ? 24 : 6, height: 6, borderRadius: 3, backgroundColor: i === slide ? colors.navy : colors.dotOff }} />
            </Press>
          ))}
        </View>
        <Press onPress={() => setSlide((slide + 1) % SLIDES.length)} accessibilityHint="Shows the next tip" style={{ gap: 14 }}>
          <T w={800} size={32} ls={-0.035} lh={1.12}>
            {SLIDES[slide].title}
          </T>
          <T w={400} size={16} lh={1.55} color={colors.muted}>
            {SLIDES[slide].body}
          </T>
        </Press>
        <Press
          onPress={finish}
          style={{ marginTop: 8, height: 58, borderRadius: 20, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <T w={800} size={16} color={colors.white}>
            Get started
          </T>
          <Icon name="arrowRight" size={18} stroke={2.6} color={colors.white} />
        </Press>
        <Press onPress={finish} style={{ padding: 6 }}>
          <T w={700} size={15} color={colors.navy} center>
            I already have an account
          </T>
        </Press>
      </View>
    </View>
  );
}

function Chip({ dot, label, style }: { dot: string; label: string; style: object }) {
  return (
    <View
      style={[
        { position: 'absolute', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.14)', flexDirection: 'row', alignItems: 'center', gap: 8 },
        style,
      ]}
    >
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot }} />
      <T w={700} size={13} color={colors.white}>
        {label}
      </T>
    </View>
  );
}
