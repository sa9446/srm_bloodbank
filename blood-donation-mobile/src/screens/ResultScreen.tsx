import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Share, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { EligibilityResult, BasicInfo } from '@/types/donor';

const RED = '#9f1239';
const GREEN = '#16a34a';
const AMBER = '#d97706';
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Props {
  result: EligibilityResult;
  basicInfo: BasicInfo;
  donorId: string;
  onDone: () => void;
}

function statusColor(s: string) {
  if (s === 'ELIGIBLE') return GREEN;
  if (s === 'TEMP_DEFERRED') return AMBER;
  return RED;
}

function statusLabel(s: string) {
  if (s === 'ELIGIBLE') return 'ELIGIBLE TO DONATE';
  if (s === 'TEMP_DEFERRED') return 'TEMPORARILY DEFERRED';
  return 'PERMANENTLY DEFERRED';
}

function statusBg(s: string) {
  if (s === 'ELIGIBLE') return '#f0fdf4';
  if (s === 'TEMP_DEFERRED') return '#fffbeb';
  return '#fff1f2';
}

export default function ResultScreen({ result, basicInfo, donorId, onDone }: Props) {
  const color = statusColor(result.status);
  const isLocal = donorId.startsWith('LOCAL-');
  const qrUrl = `${API_URL}/api/qr/${donorId}`;

  async function handleShare() {
    const msg = [
      `SRM Blood Donation Camp — Registration Confirmation`,
      `Name: ${basicInfo.fullName}`,
      `Status: ${statusLabel(result.status)}`,
      result.reason ? `Note: ${result.reason}` : null,
      result.eligibleReturnDate ? `Eligible from: ${result.eligibleReturnDate}` : null,
      `Donor ID: ${donorId}`,
    ]
      .filter(Boolean)
      .join('\n');
    await Share.share({ message: msg });
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topBar}>
        <Text style={s.topBarText}>SRM Blood Donation Camp</Text>
      </View>
      <ScrollView contentContainerStyle={s.scrollContent}>

        <View style={[s.banner, { backgroundColor: statusBg(result.status), borderColor: color }]}>
          <View style={[s.statusDot, { backgroundColor: color }]} />
          <Text style={[s.statusText, { color }]}>{statusLabel(result.status)}</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Registration Summary</Text>
          <InfoRow label="Full Name" value={basicInfo.fullName} />
          <InfoRow label="Date of Birth" value={basicInfo.dob} />
          <InfoRow label="Age" value={`${basicInfo.age} years`} />
          <InfoRow label="Gender" value={basicInfo.gender} />
          <InfoRow label="Donation Type" value={basicInfo.donationType === 'WHOLE_BLOOD' ? 'Whole Blood' : 'Apheresis'} />
          <InfoRow label="Weight" value={`${basicInfo.weightKg} kg`} />
          {basicInfo.weightKg >= 45 && (
            <InfoRow label="Eligible Volume" value={basicInfo.weightKg <= 55 ? '350 ml' : '450 ml'} highlight />
          )}
        </View>

        {result.status !== 'ELIGIBLE' && result.reason && (
          <View style={[s.card, { borderLeftWidth: 4, borderLeftColor: color }]}>
            <Text style={[s.cardTitle, { color }]}>
              {result.status === 'TEMP_DEFERRED' ? 'Deferral Reason' : 'Permanent Deferral'}
            </Text>
            <Text style={s.reasonText}>{result.reason}</Text>
            {result.eligibleReturnDate && (
              <View style={s.returnBox}>
                <Text style={s.returnLabel}>Eligible to donate from</Text>
                <Text style={s.returnDate}>{result.eligibleReturnDate}</Text>
              </View>
            )}
          </View>
        )}

        <View style={s.card}>
          <Text style={s.cardTitle}>Donor QR Code</Text>
          <Text style={s.qrSubtitle}>Show this to the medical officer at the camp</Text>
          {isLocal ? (
            <View style={s.offlineBox}>
              <Text style={s.offlineIcon}>📋</Text>
              <Text style={s.offlineTitle}>Offline Registration</Text>
              <Text style={s.offlineDesc}>
                Show your Donor ID below to the registration desk staff.
              </Text>
            </View>
          ) : (
            <View style={s.qrWrapper}>
              <Image
                source={{ uri: qrUrl }}
                style={s.qrImage}
                resizeMode="contain"
              />
            </View>
          )}
          <Text style={s.donorIdLabel}>Donor ID</Text>
          <Text style={s.donorIdValue}>{donorId}</Text>
          {isLocal && (
            <Text style={s.offlineNote}>* Registered offline — connect to camp Wi-Fi for QR code</Text>
          )}
        </View>

        {result.status === 'ELIGIBLE' && (
          <View style={[s.card, { backgroundColor: '#f0fdf4' }]}>
            <Text style={[s.cardTitle, { color: GREEN }]}>What to do next</Text>
            {[
              'Proceed to the registration desk and show your QR code.',
              'A medical officer will verify your details and check your vitals.',
              'After a quick health check, you will proceed to donation.',
              'Rest for 10–15 minutes and enjoy refreshments after donation.',
            ].map((tip, i) => (
              <View key={i} style={s.tipRow}>
                <View style={[s.tipNum, { backgroundColor: GREEN }]}>
                  <Text style={s.tipNumText}>{i + 1}</Text>
                </View>
                <Text style={s.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={s.btnRow}>
          <TouchableOpacity style={s.shareBtn} onPress={handleShare}>
            <Text style={s.shareBtnText}>Share Result</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.doneBtn} onPress={onDone}>
            <Text style={s.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.footer}>
          SRM Medical College Hospital & Research Centre{'\n'}
          Dept. of Transfusion Medicine & Blood Centre
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={[s.infoValue, highlight && { color: GREEN, fontWeight: '700' }]}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  topBar: { backgroundColor: RED, paddingHorizontal: 16, paddingVertical: 10 },
  topBarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  scrollContent: { padding: 12, paddingBottom: 40, gap: 12 },
  banner: { borderWidth: 1.5, borderRadius: 14, paddingVertical: 18, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusDot: { width: 14, height: 14, borderRadius: 7 },
  statusText: { fontSize: 17, fontWeight: '900', flex: 1 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: RED, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  infoLabel: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  infoValue: { fontSize: 13, color: '#111827', fontWeight: '600' },
  reasonText: { fontSize: 14, color: '#374151', lineHeight: 20 },
  returnBox: { marginTop: 12, backgroundColor: '#f0fdf4', borderRadius: 10, padding: 12, alignItems: 'center' },
  returnLabel: { fontSize: 11, color: '#15803d', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  returnDate: { fontSize: 18, fontWeight: '900', color: GREEN, marginTop: 4 },
  qrSubtitle: { fontSize: 12, color: '#6b7280', marginBottom: 16 },
  qrWrapper: { alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#fee2e2' },
  qrImage: { width: 200, height: 200 },
  offlineBox: { alignItems: 'center', padding: 20, backgroundColor: '#fffbeb', borderRadius: 12, borderWidth: 1, borderColor: '#fde68a' },
  offlineIcon: { fontSize: 36, marginBottom: 8 },
  offlineTitle: { fontSize: 15, fontWeight: '800', color: '#92400e', marginBottom: 4 },
  offlineDesc: { fontSize: 13, color: '#78350f', textAlign: 'center', lineHeight: 18 },
  donorIdLabel: { fontSize: 10, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', marginTop: 12 },
  donorIdValue: { fontSize: 14, fontWeight: '700', color: '#374151', textAlign: 'center', marginTop: 3 },
  offlineNote: { fontSize: 11, color: AMBER, textAlign: 'center', marginTop: 6, fontStyle: 'italic' },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  tipNum: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  tipNumText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  tipText: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 19 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  shareBtn: { flex: 1, borderWidth: 1.5, borderColor: RED, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  shareBtnText: { color: RED, fontWeight: '700', fontSize: 14 },
  doneBtn: { flex: 1, backgroundColor: RED, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  doneBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  footer: { textAlign: 'center', fontSize: 11, color: '#9ca3af', lineHeight: 16 },
});
