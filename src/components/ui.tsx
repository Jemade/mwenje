import * as Haptics from 'expo-haptics';
import { ReactNode } from 'react';
import { Platform, Pressable, PressableProps, StyleProp, View, ViewStyle } from 'react-native';
import { colors } from '../theme';
import { T } from './T';

export const tap = () => {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
};

export const success = () => {
  if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
};

/** Pressable that dims slightly while pressed. */
export function Press({ style, children, onPress, ...rest }: PressableProps & { style?: StyleProp<ViewStyle>; children?: ReactNode }) {
  return (
    <Pressable
      {...rest}
      onPress={(e) => {
        tap();
        onPress?.(e);
      }}
      style={({ pressed }) => [style, pressed && { opacity: 0.82, transform: [{ scale: 0.98 }] }]}
    >
      {children}
    </Pressable>
  );
}

/** Red "Power off · …" or gold "Power on · …" pill. */
export function StatusPill({ off, label }: { off: boolean; label: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 7,
        paddingHorizontal: 12,
        borderRadius: 999,
        backgroundColor: off ? colors.alertBg : '#FFF4D6',
        alignSelf: 'flex-start',
      }}
    >
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: off ? colors.alert : colors.gold }} />
      <T w={800} size={13} color={off ? colors.alertText : '#7A5A00'}>
        {label}
      </T>
    </View>
  );
}

export function AvatarStack({ size = 28, ring, fills }: { size?: number; ring: string; fills: string[] }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {fills.map((c, i) => (
        <View
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: c,
            borderWidth: 2,
            borderColor: ring,
            marginLeft: i === 0 ? 0 : -10,
          }}
        />
      ))}
    </View>
  );
}
