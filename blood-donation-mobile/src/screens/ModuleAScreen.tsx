import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BasicInfo, Gender, MaritalStatus, DonationType } from '@/types/donor';
import StepIndicator from '@/components/StepIndicator';

const RED = '#9f1239';
const today = new Date().toISOString().split('T')[0];

function calcAge(dob: string): number {
  if (!dob) return 0;
  const b = new Date(dob), n = new Date();
  let age = n.getFullYear() - b.getFullYear();
  if (n.getMonth() - b.getMonth() < 0 || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) age--;
  return age;
}

interface Props { onNext: (d: BasicInfo) => void; }

const BLANK: BasicInfo = {
  fullName: '', fatherName: '', occupation: '', address: '', mobile: '', email: '',
  gender: 'MALE', maritalStatus: 'SINGLE', dob: '', age: 0,
  weightKg: 0, donationType: 'WHOLE_BLOOD', isFirstTimeDonor: false, lastDonationDate: '',
};

export default function ModuleAScreen({ onNext }: Props) {
  const [f, setF] = useState<BasicInfo>(BLANK);

  function set<K extends keyof BasicInfo>(k: K, v: BasicInfo[K]) {
    setF(prev => {
      const next = { ...prev, [k]: v };
      if (k === 'dob') next.age = calcAge(v as string);
      return next;
    });
  }

  function submit() {
    if (!f.fullName.trim()) return Alert.alert('Required', 'Please enter your full name.');
    if (!f.fatherName.trim()) return Alert.alert('Required', "Please enter father's name.");
    if (!f.occupation.trim()) return Alert.alert('Required', 'Please enter your occupation.');
    if (!f.address.trim()) return Alert.alert('Required', 'Please enter your address.');
    if (!/^\d{10}$/.test(f.mobile)) return Alert.alert('Invalid', 'Enter a valid 10-digit mobile number.');
    if (!f.dob) return Alert.alert('Required', 'Please enter your date of birth.');
    if (f.age < 18) return Alert.alert('Not Eligible', 'You must be at least 18 years old.');
    if (f.age > 65) return Alert.alert('Not Eligible', 'Maximum eligible age is 65 years.');
    if (!f.weightKg || f.weightKg < 45) return Alert.alert('Not Eligible', 'Minimum weight is 45 kg.');
    if (!f.isFirstTimeDonor && !f.lastDonationDate) return Alert.alert('Required', 'Please enter your last donation date.');
    onNext(f);
  }

  const vol = f.weightKg >= 45 ? (f.weightKg <= 55 ? 350 : 450) : null;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topBar}>
        <Text style={s.topBarText}>SRM Blood Donation Camp</Text>
      </View>
      <StepIndicator current={1} />
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">

        <SectionCard title="Personal Details" num={1}>
          <Field label="Full Name *">
            <TextInput style={s.input} value={f.fullName} onChangeText={v => set('fullName', v)} placeholder="As per Aadhaar / ID proof" />
          </Field>
          <Field label="Father's / Husband's Name *">
            <TextInput style={s.input} value={f.fatherName} onChangeText={v => set('fatherName', v)} />
          </Field>
          <Field label="Occupation *">
            <TextInput style={s.input} value={f.occupation} onChangeText={v => set('occupation', v)} placeholder="e.g., Engineer, Student" />
          </Field>
          <Field label="Address *">
            <TextInput style={[s.input, { height: 72, textAlignVertical: 'top' }]} value={f.address} onChangeText={v => set('address', v)} multiline />
          </Field>
          <Field label="Mobile Number *">
            <TextInput style={s.input} value={f.mobile} onChangeText={v => set('mobile', v.replace(/\D/g, '').slice(0, 10))} keyboardType="phone-pad" placeholder="10-digit number" />
          </Field>
          <Field label="Email ID">
            <TextInput style={s.input} value={f.email} onChangeText={v => set('email', v)} keyboardType="email-address" autoCapitalize="none" placeholder="optional" />
          </Field>
        </SectionCard>

        <SectionCard title="Demographics" num={2}>
          <Field label="Gender *">
            <ToggleGroup
              options={[['MALE','Male'],['FEMALE','Female'],['OTHER','Other']] as [Gender,string][]}
              value={f.gender} onChange={v => set('gender', v)}
            />
          </Field>
          <Field label="Marital Status *">
            <ToggleGroup
              options={[['SINGLE','Single'],['MARRIED','Married']] as [MaritalStatus,string][]}
              value={f.maritalStatus} onChange={v => set('maritalStatus', v)}
            />
          </Field>
          <Field label="Date of Birth * (YYYY-MM-DD)">
            <TextInput style={s.input} value={f.dob} onChangeText={v => set('dob', v)} placeholder="1995-06-15" maxLength={10} keyboardType="numeric" />
            {f.age > 0 && <Text style={s.hint}>Age: {f.age} years</Text>}
          </Field>
          <Field label="Weight (kg) *">
            <TextInput style={s.input} value={f.weightKg > 0 ? String(f.weightKg) : ''} onChangeText={v => set('weightKg', parseFloat(v) || 0)} keyboardType="decimal-pad" placeholder="e.g., 65" />
            {vol && <Text style={s.hintGreen}>Eligible volume: {vol} ml</Text>}
          </Field>
        </SectionCard>

        <SectionCard title="Donation Details" num={3}>
          <Field label="Type of Donation *">
            <ToggleGroup
              options={[['WHOLE_BLOOD','Whole Blood'],['APHERESIS','Apheresis']] as [DonationType,string][]}
              value={f.donationType} onChange={v => set('donationType', v)}
            />
          </Field>
          <TouchableOpacity style={s.checkRow} onPress={() => set('isFirstTimeDonor', !f.isFirstTimeDonor)}>
            <View style={[s.checkbox, f.isFirstTimeDonor && s.checked]}>
              {f.isFirstTimeDonor && <Text style={s.checkMark}>✓</Text>}
            </View>
            <Text style={s.checkLabel}>This is my first time donating blood</Text>
          </TouchableOpacity>
          {!f.isFirstTimeDonor && (
            <Field label="Date of Last Donation * (YYYY-MM-DD)">
              <TextInput style={s.input} value={f.lastDonationDate} onChangeText={v => set('lastDonationDate', v)} placeholder="2024-12-01" maxLength={10} keyboardType="numeric" />
            </Field>
          )}
        </SectionCard>

        <TouchableOpacity style={s.nextBtn} onPress={submit}>
          <Text style={s.nextBtnText}>Continue to Questionnaire →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionCard({ title, num, children }: { title: string; num: number; children: React.ReactNode }) {
  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <View style={s.numBadge}><Text style={s.numText}>{num}</Text></View>
        <Text style={s.cardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );
}

function ToggleGroup<T extends string>({ options, value, onChange }: { options: [T, string][]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={s.toggleRow}>
      {options.map(([v, l]) => (
        <TouchableOpacity key={v} style={[s.toggleBtn, value === v && s.toggleActive]} onPress={() => onChange(v)}>
          <Text style={[s.toggleTxt, value === v && s.toggleTxtActive]}>{l}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  topBar: { backgroundColor: RED, paddingHorizontal: 16, paddingVertical: 10 },
  topBarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  scroll: { flex: 1 },
  scrollContent: { padding: 12, paddingBottom: 32, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  numBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' },
  numText: { color: RED, fontWeight: '800', fontSize: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: RED },
  field: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14, color: '#111', backgroundColor: '#fafafa' },
  hint: { fontSize: 11, color: '#6b7280', marginTop: 4 },
  hintGreen: { fontSize: 11, color: '#16a34a', marginTop: 4, fontWeight: '600' },
  toggleRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  toggleActive: { backgroundColor: RED, borderColor: RED },
  toggleTxt: { fontSize: 13, color: '#6b7280', fontWeight: '600' },
  toggleTxtActive: { color: '#fff' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: RED, borderColor: RED },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '800' },
  checkLabel: { fontSize: 13, color: '#374151', flex: 1 },
  nextBtn: { backgroundColor: RED, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  nextBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
