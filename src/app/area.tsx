import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { T } from '../components/T';
import { Press, StatusPill } from '../components/ui';
import { useNow, useStore } from '../store';
import { hmWords } from '../store/format';
import { colors, fonts, shadow } from '../theme';

/** Area picker, opened from the "Your area" button on Home. */
export default function AreaPicker() {
  const { areas, areaId, dispatch } = useStore();
  const now = useNow();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const list = areas.filter((a) => `${a.name} ${a.city}`.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingTop: Math.max(insets.top, 20) + 6, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <T w={800} size={28} ls={-0.03}>
          Choose your area
        </T>
        <Press onPress={() => router.back()} accessibilityLabel="Close" style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', boxShadow: shadow.soft }}>
          <Icon name="close" size={20} stroke={2.2} color={colors.text} />
        </Press>
      </View>

      <View style={{ marginTop: 18, marginHorizontal: 16, height: 52, borderRadius: 26, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, boxShadow: shadow.soft }}>
        <Icon name="search" size={20} stroke={2.2} color={colors.muted} />
        <TextInput
          autoFocus
          value={q}
          onChangeText={setQ}
          placeholder="Search a suburb"
          placeholderTextColor={colors.subtle}
          style={{ flex: 1, fontFamily: fonts[600], fontSize: 15, color: colors.text, paddingVertical: 0, outlineStyle: 'none' } as object}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }} keyboardShouldPersistTaps="handled">
        <View style={{ backgroundColor: colors.white, borderRadius: 28, paddingHorizontal: 16, paddingVertical: 6, boxShadow: shadow.card }}>
          {list.map((a, i) => (
            <Press
              key={a.id}
              onPress={() => {
                dispatch({ type: 'setArea', id: a.id });
                router.back();
              }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderTopWidth: i ? 1 : 0, borderColor: colors.divider }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: a.id === areaId ? colors.navy : colors.chip, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={a.id === areaId ? 'check' : 'pin'} size={18} stroke={2.4} color={a.id === areaId ? colors.gold : colors.navy} />
              </View>
              <View style={{ flex: 1 }}>
                <T w={800} size={16}>
                  {a.name}
                </T>
                <T w={600} size={13} color={colors.muted}>
                  {a.city} · {a.reporters} reports
                </T>
              </View>
              <StatusPill off={a.status === 'off'} label={`${a.status === 'off' ? 'Off' : 'On'} ${hmWords(now - a.since)}`} />
            </Press>
          ))}
          {list.length === 0 && (
            <T w={600} size={14} color={colors.muted} style={{ paddingVertical: 14 }}>
              No suburb matches “{q.trim()}”
            </T>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
