import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Home'> };

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.bloodDrop}>🩸</Text>
          <Text style={s.title}>SRM Medical College{'\n'}Hospital & Research Centre</Text>
          <Text style={s.dept}>Department of Transfusion Medicine & Blood Centre</Text>
          <Text style={s.address}>SRM Nagar, Potheri, Kattankulathur‑601203{'\n'}Chengalpattu District, Tamil Nadu</Text>
          <Text style={s.lic}>Lic. No. 416/280  |  SRM MOH & RO/BC‑01/019/VER 1.0‑OCT‑2023</Text>
        </View>

        {/* Banner */}
        <View style={s.card}>
          <View style={s.banner}>
            <Text style={s.bannerSub}>YOU ARE INVITED TO</Text>
            <Text style={s.bannerTitle}>BLOOD DONATION CAMP</Text>
            <Text style={s.bannerSub}>Register Online — Fast & Paperless</Text>
          </View>

          <View style={s.infoBlock}>
            <InfoRow icon="📋" label="What to expect" text="Quick eligibility screening + health check by medical officers." />
            <InfoRow icon="⏱️" label="Time needed" text="30–45 minutes including rest after donation." />
            <InfoRow icon="✅" label="Requirements" text="Age 18–65 · Weight ≥ 45 kg · Feeling healthy · Eaten within 4 hrs" />
            <InfoRow icon="🏥" label="Blood types" text="All ABO & Rh groups. Whole Blood & Apheresis accepted." />
          </View>

          <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Register')}>
            <Text style={s.btnText}>Register to Donate →</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.footer}>Your data is stored securely and used only for this donation camp.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, text }: { icon: string; label: string; text: string }) {
  return (
    <View style={s.row}>
      <Text style={s.rowIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.rowLabel}>{label.toUpperCase()}</Text>
        <Text style={s.rowText}>{text}</Text>
      </View>
    </View>
  );
}

const RED = '#9f1239';
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: RED },
  scroll: { paddingBottom: 32 },
  header: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 28 },
  bloodDrop: { fontSize: 52, marginBottom: 10 },
  title: { fontSize: 20, fontWeight: '900', color: '#fff', textAlign: 'center', lineHeight: 28 },
  dept: { fontSize: 12, color: '#fda4af', textAlign: 'center', marginTop: 4 },
  address: { fontSize: 11, color: '#fecdd3', textAlign: 'center', marginTop: 4 },
  lic: { fontSize: 10, color: '#fb7185', textAlign: 'center', marginTop: 4 },
  card: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
  banner: { backgroundColor: RED, paddingVertical: 20, alignItems: 'center' },
  bannerSub: { fontSize: 11, color: '#fda4af', letterSpacing: 1.5, fontWeight: '600' },
  bannerTitle: { fontSize: 26, fontWeight: '900', color: '#fff', marginTop: 2 },
  infoBlock: { padding: 20, gap: 14 },
  row: { flexDirection: 'row', gap: 12 },
  rowIcon: { fontSize: 24, marginTop: 2 },
  rowLabel: { fontSize: 10, color: RED, fontWeight: '700', letterSpacing: 1 },
  rowText: { fontSize: 13, color: '#555', marginTop: 2, lineHeight: 18 },
  btn: { backgroundColor: RED, margin: 16, marginTop: 4, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  footer: { color: '#fecdd3', fontSize: 11, textAlign: 'center', marginTop: 20, paddingHorizontal: 32, lineHeight: 16 },
});
