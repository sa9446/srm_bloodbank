import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const STEPS = ['Registration', 'Questionnaire', 'Consent', 'Result'];
const RED = '#9f1239';

export default function StepIndicator({ current }: { current: number }) {
  return (
    <View style={s.wrap}>
      {STEPS.map((label, idx) => {
        const num = idx + 1;
        const done = num < current;
        const active = num === current;
        return (
          <React.Fragment key={label}>
            <View style={s.step}>
              <View style={[s.circle, done && s.done, active && s.active]}>
                <Text style={[s.circleText, (done || active) && s.circleTextLight]}>
                  {done ? '✓' : num}
                </Text>
              </View>
              <Text style={[s.label, active && s.labelActive, done && s.labelDone]} numberOfLines={1}>
                {label}
              </Text>
            </View>
            {idx < STEPS.length - 1 && (
              <View style={[s.line, done && s.lineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 12, paddingVertical: 12 },
  step: { alignItems: 'center', width: 58 },
  circle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  active: { backgroundColor: RED, shadowColor: RED, shadowOpacity: 0.4, shadowRadius: 6, elevation: 4 },
  done: { backgroundColor: '#22c55e' },
  circleText: { fontSize: 13, fontWeight: '700', color: '#9ca3af' },
  circleTextLight: { color: '#fff' },
  label: { fontSize: 9, color: '#9ca3af', marginTop: 4, textAlign: 'center', fontWeight: '500' },
  labelActive: { color: RED, fontWeight: '700' },
  labelDone: { color: '#22c55e' },
  line: { flex: 1, height: 2, backgroundColor: '#e5e7eb', marginTop: 15 },
  lineDone: { backgroundColor: '#22c55e' },
});
