import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ConsentData } from '@/types/donor';
import StepIndicator from '@/components/StepIndicator';

const RED = '#9f1239';

interface Props {
  registeredName: string;
  onBack: () => void;
  onNext: (d: ConsentData) => void;
}

export default function ModuleCScreen({ registeredName, onBack, onNext }: Props) {
  const [wantResults, setWantResults] = useState(false);
  const [signature, setSignature] = useState('');
  const [timestamp] = useState(new Date().toISOString());

  function submit() {
    const trimmed = signature.trim();
    if (!trimmed) return Alert.alert('Required', 'Please type your full name as signature.');
    if (trimmed.toLowerCase() !== registeredName.trim().toLowerCase()) {
      return Alert.alert(
        'Name Mismatch',
        `Signature must match registered name: "${registeredName}"`,
      );
    }
    onNext({ consentGiven: true, wantTestResults: wantResults, signature: trimmed, timestamp });
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topBar}>
        <Text style={s.topBarText}>SRM Blood Donation Camp</Text>
      </View>
      <StepIndicator current={3} />
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">

        <View style={s.card}>
          <Text style={s.cardTitle}>Donor Declaration & Consent</Text>

          <View style={s.declarationBox}>
            <Text style={s.declarationText}>
              I hereby declare that the information provided by me in this form is true and correct to the best of my knowledge and belief. I am donating blood voluntarily without any pressure or monetary benefit.{'\n\n'}
              I understand that my blood will be tested for HIV, Hepatitis B, Hepatitis C, Syphilis, and Malaria. I consent to this testing and understand that reactive results will be communicated to me confidentially.{'\n\n'}
              I confirm that I have read and understood the donor information leaflet. I am aware of what blood donation involves and have had an opportunity to ask questions.{'\n\n'}
              I am in good health and to the best of my knowledge I am not a carrier of any blood-borne disease. I understand that donating blood when I know I am at risk could seriously harm others.{'\n\n'}
              I authorize SRM Medical College Hospital & Research Centre, Department of Transfusion Medicine & Blood Centre to use my donated blood or its components for transfusion or medical purposes.
            </Text>
          </View>

          <View style={s.separator} />

          <Text style={s.sectionLabel}>HIV Testing Consent</Text>
          <View style={s.hivBox}>
            <Text style={s.hivText}>
              I consent to HIV testing as per the National Blood Policy guidelines. I understand that my blood will be tested for HIV antibodies and that reactive results will be reported as per NACO guidelines.
            </Text>
          </View>

          <View style={s.separator} />

          <Text style={s.sectionLabel}>Test Results Notification</Text>
          <Text style={s.subLabel}>Would you like to be informed of your test results?</Text>
          <View style={s.toggleRow}>
            <TouchableOpacity
              style={[s.toggleBtn, wantResults && s.toggleActive]}
              onPress={() => setWantResults(true)}
            >
              <Text style={[s.toggleTxt, wantResults && s.toggleTxtActive]}>YES</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.toggleBtn, !wantResults && s.toggleActive]}
              onPress={() => setWantResults(false)}
            >
              <Text style={[s.toggleTxt, !wantResults && s.toggleTxtActive]}>NO</Text>
            </TouchableOpacity>
          </View>

          <View style={s.separator} />

          <Text style={s.sectionLabel}>Electronic Signature</Text>
          <Text style={s.subLabel}>
            Type your full name exactly as registered: <Text style={s.nameHint}>"{registeredName}"</Text>
          </Text>
          <TextInput
            style={s.sigInput}
            value={signature}
            onChangeText={setSignature}
            placeholder="Type your full name here"
            autoCapitalize="words"
          />

          <View style={s.tsBox}>
            <Text style={s.tsLabel}>Timestamp</Text>
            <Text style={s.tsValue}>{new Date(timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</Text>
          </View>
        </View>

        <View style={s.btnRow}>
          <TouchableOpacity style={s.backBtn} onPress={onBack}>
            <Text style={s.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.nextBtn} onPress={submit}>
            <Text style={s.nextBtnText}>Submit & Get Result →</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  topBar: { backgroundColor: RED, paddingHorizontal: 16, paddingVertical: 10 },
  topBarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  scroll: { flex: 1 },
  scrollContent: { padding: 12, paddingBottom: 32, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: RED, marginBottom: 14 },
  declarationBox: { backgroundColor: '#fef2f2', borderRadius: 10, padding: 14, borderLeftWidth: 3, borderLeftColor: RED },
  declarationText: { fontSize: 13, color: '#374151', lineHeight: 20 },
  separator: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 14 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 6 },
  subLabel: { fontSize: 12, color: '#6b7280', marginBottom: 10 },
  hivBox: { backgroundColor: '#eff6ff', borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: '#3b82f6' },
  hivText: { fontSize: 12, color: '#1e40af', lineHeight: 18 },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#f3f4f6', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  toggleActive: { backgroundColor: RED, borderColor: RED },
  toggleTxt: { fontSize: 13, fontWeight: '700', color: '#9ca3af' },
  toggleTxtActive: { color: '#fff' },
  nameHint: { fontWeight: '700', color: RED },
  sigInput: { borderWidth: 1.5, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111', backgroundColor: '#fafafa', fontStyle: 'italic' },
  tsBox: { marginTop: 12, backgroundColor: '#f9fafb', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  tsLabel: { fontSize: 10, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 },
  tsValue: { fontSize: 12, color: '#374151', marginTop: 3 },
  btnRow: { flexDirection: 'row', gap: 10 },
  backBtn: { flex: 1, borderWidth: 1.5, borderColor: RED, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  backBtnText: { color: RED, fontWeight: '700', fontSize: 14 },
  nextBtn: { flex: 2, backgroundColor: RED, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
