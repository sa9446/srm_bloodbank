import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  warning?: boolean;
}

export default function YesNoToggle({ label, value, onChange, warning }: Props) {
  return (
    <View style={s.wrap}>
      <Text style={s.label}>{label}</Text>
      <View style={s.btns}>
        <TouchableOpacity
          style={[s.btn, value && (warning ? s.yesWarn : s.yes)]}
          onPress={() => onChange(true)}
        >
          <Text style={[s.btnTxt, value && s.btnTxtActive]}>YES</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.btn, !value && s.no]}
          onPress={() => onChange(false)}
        >
          <Text style={[s.btnTxt, !value && s.btnTxtActive]}>NO</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  label: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 18, paddingRight: 8 },
  btns: { flexDirection: 'row', gap: 6 },
  btn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: '#f3f4f6' },
  yes: { backgroundColor: '#22c55e' },
  yesWarn: { backgroundColor: '#f59e0b' },
  no: { backgroundColor: '#22c55e' },
  btnTxt: { fontSize: 11, fontWeight: '700', color: '#9ca3af' },
  btnTxtActive: { color: '#fff' },
});
