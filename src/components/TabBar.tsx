import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadow } from '../theme';
import { Icon, IconName } from './Icon';
import { T } from './T';
import { Press } from './ui';

const ITEMS: { route: string; label: string; icon: IconName }[] = [
  { route: 'home', label: 'Home', icon: 'home' },
  { route: 'map', label: 'Map', icon: 'map' },
  { route: 'report', label: 'Report', icon: 'plus' },
  { route: 'forecast', label: 'Forecast', icon: 'trend' },
  { route: 'alerts', label: 'Alerts', icon: 'bell' },
];

export const TAB_BAR_SPACE = 68 + 30 + 16;

/** Floating midnight pill tab bar. The active tab grows into a gold pill with its label. */
export function TabBar({ state, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const active = state.routes[state.index]?.name;

  return (
    <View
      style={{
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: Math.max(insets.bottom - 4, 16),
        height: 68,
        borderRadius: 34,
        backgroundColor: colors.midnight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        boxShadow: shadow.tabBar,
      }}
    >
      {ITEMS.map((item) => {
        const on = item.route === active;
        return (
          <Press
            key={item.route}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: on }}
            onPress={() => {
              if (item.route === 'report') router.push('/report');
              else {
                const key = state.routes.find((r) => r.name === item.route)?.key;
                if (key) navigateToTab(key);
              }
            }}
            style={
              on
                ? { height: 48, paddingHorizontal: 18, borderRadius: 24, backgroundColor: colors.gold, flexDirection: 'row', alignItems: 'center', gap: 8 }
                : { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }
            }
          >
            <Icon name={item.icon} size={on ? 20 : 22} stroke={on ? 2.2 : 2} color={on ? colors.midnight : colors.inactive} />
            {on && (
              <T w={800} size={14}>
                {item.label}
              </T>
            )}
          </Press>
        );
      })}
    </View>
  );
}
