import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ScreeningAnswers, Gender, JaundiceType } from '@/types/donor';
import StepIndicator from '@/components/StepIndicator';
import YesNoToggle from '@/components/YesNoToggle';

const RED = '#9f1239';

const BLANK: ScreeningAnswers = {
  feelingHealthy: true, hadMealWithin4Hours: true, hadAdequateSleep: true, isNightShiftWithoutSleep: false,
  isHighRiskOccupation: false, nextDutyWithin24Hours: false,
  hadJaundice: false, jaundiceType: '', jaundiceDate: '',
  hadTattooOrPiercing: false, tattooDate: '', hadCosmeticInvasive: false, cosmeticDate: '',
  spouseHadTransfusion: false, spouseTransfusionDate: '',
  hadToothExtraction: false, toothExtractionDate: '', hadDentalSurgery: false, dentalSurgeryDate: '',
  hadMinorSurgery: false, minorSurgeryDate: '', hadMajorSurgery: false, majorSurgeryDate: '',
  hadTyphoid: false, typhoidDate: '', hadMalaria: false, malariaDate: '',
  hadDengue: false, dengueDate: '', hadChikungunya: false, chikungunyaDate: '',
  hadZika: false, zikaDate: '', hadMeaslesMumpsChicken: false, measlesDate: '',
  hadKidneyInfection: false, kidneyInfectionDate: '', hadUTI: false, utiDate: '',
  hadCovid19Vaccine: false, covid19VaccineDate: '', hadLiveVaccine: false, liveVaccineDate: '',
  hadAntiRabies: false, antiRabiesDate: '', hadHepBIg: false, hepBIgDate: '',
  hasAsthmaOnSteroids: false, hasCardiovascularDisease: false, hasDiabetesInsulin: false,
  hasHighRiskBehavior: false, hasHIV: false, hasSTI: false, hasChronicKidneyDisease: false,
  hasLiverFailure: false, hasLeprosy: false, hasAutoimmune: false, hasBleedingDisorder: false,
  hasPolycythemia: false, hadOrganTransplant: false,
  isPregnant: false, recentDelivery: false, deliveryDate: '', recentAbortion: false, abortionDate: '',
  isLactating: false, isMenstruating: false, lastPeriodDate: '',
};

type BKey = keyof { [K in keyof ScreeningAnswers as ScreeningAnswers[K] extends boolean ? K : never]: true };
type SKey = keyof { [K in keyof ScreeningAnswers as ScreeningAnswers[K] extends string ? K : never]: true };

interface Props { gender: Gender; onNext: (d: ScreeningAnswers) => void; onBack: () => void; }

export default function ModuleBScreen({ gender, onNext, onBack }: Props) {
  const [ans, setAns] = useState<ScreeningAnswers>(BLANK);
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true });

  function setB(k: BKey, v: boolean) { setAns(p => ({ ...p, [k]: v })); }
  function setS(k: SKey, v: string) { setAns(p => ({ ...p, [k]: v })); }
  function toggle(i: number) { setOpen(p => ({ ...p, [i]: !p[i] })); }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topBar}>
        <Text style={s.topBarText}>SRM Blood Donation Camp</Text>
      </View>
      <StepIndicator current={2} />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

        <Accordion title="1. General Health Today" open={!!open[0]} onToggle={() => toggle(0)}>
          <YesNoToggle label="Feeling healthy today?" value={ans.feelingHealthy} onChange={v => setB('feelingHealthy', v)} />
          <YesNoToggle label="Had a meal in the last 4 hours?" value={ans.hadMealWithin4Hours} onChange={v => setB('hadMealWithin4Hours', v)} />
          <YesNoToggle label="Got adequate sleep last night (≥6 hrs)?" value={ans.hadAdequateSleep} onChange={v => setB('hadAdequateSleep', v)} />
          <YesNoToggle label="Night shift worker who has NOT slept since shift?" value={ans.isNightShiftWithoutSleep} onChange={v => setB('isNightShiftWithoutSleep', v)} warning />
        </Accordion>

        <Accordion title="2. Occupation Safety" open={!!open[1]} onToggle={() => toggle(1)}>
          <YesNoToggle label="Air crew / long-distance driver / emergency personnel?" value={ans.isHighRiskOccupation} onChange={v => setB('isHighRiskOccupation', v)} />
          {ans.isHighRiskOccupation && (
            <YesNoToggle label="Next duty shift within 24 hours?" value={ans.nextDutyWithin24Hours} onChange={v => setB('nextDutyWithin24Hours', v)} warning />
          )}
        </Accordion>

        <Accordion title="3. Jaundice / Hepatitis" open={!!open[2]} onToggle={() => toggle(2)}>
          <YesNoToggle label="Ever had jaundice?" value={ans.hadJaundice} onChange={v => setB('hadJaundice', v)} warning />
          {ans.hadJaundice && <>
            <Text style={s.subLabel}>Cause of jaundice:</Text>
            {([['UNKNOWN','Unknown cause'],['HBV','Hepatitis B (permanent)'],['HCV','Hepatitis C (permanent)'],['HEP_A_E','Hepatitis A or E'],['GALLSTONE','Gall stones'],['NEONATAL','Neonatal']] as [JaundiceType,string][]).map(([v, l]) => (
              <TouchableOpacity key={v} style={[s.optBtn, ans.jaundiceType === v && s.optActive]} onPress={() => setAns(p => ({ ...p, jaundiceType: v }))}>
                <Text style={[s.optTxt, ans.jaundiceType === v && s.optTxtActive]}>{l}</Text>
              </TouchableOpacity>
            ))}
            {ans.jaundiceType === 'HEP_A_E' && <DateField label="Date of recovery" value={ans.jaundiceDate} onChange={v => setS('jaundiceDate', v)} />}
          </>}
        </Accordion>

        <Accordion title="4. Skin Procedures" open={!!open[3]} onToggle={() => toggle(3)}>
          <YesNoToggle label="Tattoo, piercing, or acupuncture in last 12 months?" value={ans.hadTattooOrPiercing} onChange={v => setB('hadTattooOrPiercing', v)} warning />
          {ans.hadTattooOrPiercing && <DateField label="Date of procedure" value={ans.tattooDate} onChange={v => setS('tattooDate', v)} />}
          <YesNoToggle label="Invasive cosmetic procedure (Botox, fillers, etc.)?" value={ans.hadCosmeticInvasive} onChange={v => setB('hadCosmeticInvasive', v)} warning />
          {ans.hadCosmeticInvasive && <DateField label="Date of procedure" value={ans.cosmeticDate} onChange={v => setS('cosmeticDate', v)} />}
          <YesNoToggle label="Spouse / partner received blood transfusion?" value={ans.spouseHadTransfusion} onChange={v => setB('spouseHadTransfusion', v)} warning />
          {ans.spouseHadTransfusion && <DateField label="Date of transfusion" value={ans.spouseTransfusionDate} onChange={v => setS('spouseTransfusionDate', v)} />}
        </Accordion>

        <Accordion title="5. Dental & Surgery" open={!!open[4]} onToggle={() => toggle(4)}>
          <YesNoToggle label="Tooth extraction?" value={ans.hadToothExtraction} onChange={v => setB('hadToothExtraction', v)} warning />
          {ans.hadToothExtraction && <DateField label="Date" value={ans.toothExtractionDate} onChange={v => setS('toothExtractionDate', v)} />}
          <YesNoToggle label="Dental surgery under anaesthesia?" value={ans.hadDentalSurgery} onChange={v => setB('hadDentalSurgery', v)} warning />
          {ans.hadDentalSurgery && <DateField label="Date of recovery" value={ans.dentalSurgeryDate} onChange={v => setS('dentalSurgeryDate', v)} />}
          <YesNoToggle label="Minor surgery?" value={ans.hadMinorSurgery} onChange={v => setB('hadMinorSurgery', v)} warning />
          {ans.hadMinorSurgery && <DateField label="Date of recovery" value={ans.minorSurgeryDate} onChange={v => setS('minorSurgeryDate', v)} />}
          <YesNoToggle label="Major surgery?" value={ans.hadMajorSurgery} onChange={v => setB('hadMajorSurgery', v)} warning />
          {ans.hadMajorSurgery && <DateField label="Date of recovery" value={ans.majorSurgeryDate} onChange={v => setS('majorSurgeryDate', v)} />}
        </Accordion>

        <Accordion title="6. Recent Infections" open={!!open[5]} onToggle={() => toggle(5)}>
          {([
            ['hadTyphoid','typhoidDate','Typhoid (12 months)'],
            ['hadMalaria','malariaDate','Malaria (3 months)'],
            ['hadDengue','dengueDate','Dengue (6 months)'],
            ['hadChikungunya','chikungunyaDate','Chikungunya (6 months)'],
            ['hadZika','zikaDate','Zika Virus (4 months)'],
            ['hadMeaslesMumpsChicken','measlesDate','Measles/Mumps/Chickenpox/Rubella (2 weeks)'],
            ['hadKidneyInfection','kidneyInfectionDate','Kidney Infection / Pyelonephritis (6 months)'],
            ['hadUTI','utiDate','UTI / Cystitis (14 days)'],
          ] as [BKey, SKey, string][]).map(([bk, dk, lbl]) => (
            <View key={bk}>
              <YesNoToggle label={lbl} value={ans[bk] as boolean} onChange={v => setB(bk, v)} warning />
              {ans[bk] && <DateField label="Date of recovery" value={ans[dk] as string} onChange={v => setS(dk, v)} />}
            </View>
          ))}
        </Accordion>

        <Accordion title="7. Recent Vaccinations" open={!!open[6]} onToggle={() => toggle(6)}>
          <YesNoToggle label="COVID-19 vaccine in last 14 days?" value={ans.hadCovid19Vaccine} onChange={v => setB('hadCovid19Vaccine', v)} warning />
          {ans.hadCovid19Vaccine && <DateField label="Date of vaccine" value={ans.covid19VaccineDate} onChange={v => setS('covid19VaccineDate', v)} />}
          <YesNoToggle label="Live vaccine in last 28 days? (MMR, Yellow Fever)" value={ans.hadLiveVaccine} onChange={v => setB('hadLiveVaccine', v)} warning />
          {ans.hadLiveVaccine && <DateField label="Date of vaccine" value={ans.liveVaccineDate} onChange={v => setS('liveVaccineDate', v)} />}
          <YesNoToggle label="Anti-rabies vaccination in last 12 months?" value={ans.hadAntiRabies} onChange={v => setB('hadAntiRabies', v)} warning />
          {ans.hadAntiRabies && <DateField label="Date of vaccine" value={ans.antiRabiesDate} onChange={v => setS('antiRabiesDate', v)} />}
          <YesNoToggle label="Hepatitis B Immunoglobulin in last 12 months?" value={ans.hadHepBIg} onChange={v => setB('hadHepBIg', v)} warning />
          {ans.hadHepBIg && <DateField label="Date" value={ans.hepBIgDate} onChange={v => setS('hepBIgDate', v)} />}
        </Accordion>

        <Accordion title="8. Chronic Conditions" open={!!open[7]} onToggle={() => toggle(7)}>
          <Text style={s.warning}>Answering YES to any condition below may result in permanent deferral.</Text>
          {([
            ['hasAsthmaOnSteroids','Asthma requiring steroids'],
            ['hasCardiovascularDisease','Heart disease (MI, Angina, CAD)'],
            ['hasDiabetesInsulin','Diabetes requiring insulin with complications'],
            ['hasHighRiskBehavior','High-risk behaviour for HIV/AIDS'],
            ['hasHIV','HIV / AIDS positive'],
            ['hasSTI','STI (Syphilis, Gonorrhea)'],
            ['hasChronicKidneyDisease','Chronic Kidney Disease / Renal Failure'],
            ['hasLiverFailure','Liver failure / Cirrhosis'],
            ['hasLeprosy','Leprosy or Leishmaniasis'],
            ['hasAutoimmune','Autoimmune disease (SLE, RA)'],
            ['hasBleedingDisorder','Bleeding disorder (Haemophilia, ITP)'],
            ['hasPolycythemia','Polycythemia Vera'],
            ['hadOrganTransplant','Organ or Stem Cell Transplant'],
          ] as [BKey, string][]).map(([k, lbl]) => (
            <YesNoToggle key={k} label={lbl} value={ans[k] as boolean} onChange={v => setB(k, v)} warning />
          ))}
        </Accordion>

        {gender === 'FEMALE' && (
          <Accordion title="9. For Female Donors" open={!!open[8]} onToggle={() => toggle(8)}>
            <YesNoToggle label="Currently pregnant?" value={ans.isPregnant} onChange={v => setB('isPregnant', v)} warning />
            <YesNoToggle label="Delivered a baby in the last 12 months?" value={ans.recentDelivery} onChange={v => setB('recentDelivery', v)} warning />
            {ans.recentDelivery && <DateField label="Date of delivery" value={ans.deliveryDate} onChange={v => setS('deliveryDate', v)} />}
            <YesNoToggle label="Abortion / miscarriage in last 6 months?" value={ans.recentAbortion} onChange={v => setB('recentAbortion', v)} warning />
            {ans.recentAbortion && <DateField label="Date" value={ans.abortionDate} onChange={v => setS('abortionDate', v)} />}
            <YesNoToggle label="Currently breastfeeding?" value={ans.isLactating} onChange={v => setB('isLactating', v)} warning />
            <YesNoToggle label="Currently menstruating?" value={ans.isMenstruating} onChange={v => setB('isMenstruating', v)} warning />
            {!ans.isMenstruating && <DateField label="Date last period began (YYYY-MM-DD)" value={ans.lastPeriodDate} onChange={v => setS('lastPeriodDate', v)} />}
          </Accordion>
        )}

        <View style={s.btnRow}>
          <TouchableOpacity style={s.backBtn} onPress={onBack}><Text style={s.backBtnText}>← Back</Text></TouchableOpacity>
          <TouchableOpacity style={s.nextBtn} onPress={() => onNext(ans)}><Text style={s.nextBtnText}>Continue →</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Accordion({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <View style={s.card}>
      <TouchableOpacity style={s.accHeader} onPress={onToggle}>
        <Text style={s.accTitle}>{title}</Text>
        <Text style={s.accChevron}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && <View style={s.accBody}>{children}</View>}
    </View>
  );
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <View style={s.dateField}>
      <Text style={s.dateLabel}>{label}</Text>
      <TextInput style={s.dateInput} value={value} onChangeText={onChange} placeholder="YYYY-MM-DD" maxLength={10} keyboardType="numeric" />
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  topBar: { backgroundColor: RED, paddingHorizontal: 16, paddingVertical: 10 },
  topBarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  scroll: { flex: 1 },
  content: { padding: 12, paddingBottom: 32, gap: 10 },
  card: { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  accHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: '#fff' },
  accTitle: { fontSize: 13, fontWeight: '700', color: RED, flex: 1 },
  accChevron: { fontSize: 11, color: '#9ca3af' },
  accBody: { paddingHorizontal: 14, paddingBottom: 14 },
  subLabel: { fontSize: 12, color: '#374151', fontWeight: '600', marginTop: 8, marginBottom: 6 },
  optBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#f3f4f6', marginBottom: 6 },
  optActive: { backgroundColor: RED },
  optTxt: { fontSize: 13, color: '#374151' },
  optTxtActive: { color: '#fff', fontWeight: '600' },
  dateField: { marginLeft: 12, marginTop: 6, marginBottom: 4 },
  dateLabel: { fontSize: 11, color: '#6b7280', marginBottom: 4 },
  dateInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, fontSize: 13, color: '#111', width: 160 },
  warning: { fontSize: 12, color: '#92400e', backgroundColor: '#fef3c7', borderRadius: 8, padding: 10, marginBottom: 10, lineHeight: 18 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  backBtn: { flex: 1, borderWidth: 2, borderColor: RED, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  backBtnText: { color: RED, fontWeight: '700', fontSize: 14 },
  nextBtn: { flex: 1, backgroundColor: RED, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
