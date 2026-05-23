'use client';

import { useState } from 'react';
import type { ScreeningAnswers, Gender, JaundiceType } from '@/types/donor';

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

const today = new Date().toISOString().split('T')[0];

interface Props {
  gender: Gender;
  onNext: (data: ScreeningAnswers) => void;
  onBack: () => void;
}

type BoolKey = {
  [K in keyof ScreeningAnswers]: ScreeningAnswers[K] extends boolean ? K : never;
}[keyof ScreeningAnswers];

type StrKey = {
  [K in keyof ScreeningAnswers]: ScreeningAnswers[K] extends string ? K : never;
}[keyof ScreeningAnswers];

export default function ModuleB({ gender, onNext, onBack }: Props) {
  const [ans, setAns] = useState<ScreeningAnswers>(BLANK);

  function setB(key: BoolKey, val: boolean) {
    setAns(p => ({ ...p, [key]: val }));
  }
  function setS(key: StrKey, val: string) {
    setAns(p => ({ ...p, [key]: val }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext(ans);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Section 1 — General Health */}
      <Section num={1} title="General Health Today">
        <YesNo label="Are you feeling healthy today?" val={ans.feelingHealthy} onChange={v => setB('feelingHealthy', v)} />
        <YesNo label="Have you had a meal within the last 4 hours?" val={ans.hadMealWithin4Hours} onChange={v => setB('hadMealWithin4Hours', v)} />
        <YesNo label="Did you get adequate sleep last night (at least 6 hours)?" val={ans.hadAdequateSleep} onChange={v => setB('hadAdequateSleep', v)} />
        <YesNo label="Are you a night-shift worker who has NOT slept since your shift ended?" val={ans.isNightShiftWithoutSleep} onChange={v => setB('isNightShiftWithoutSleep', v)} yesWarning />
      </Section>

      {/* Section 2 — Occupation */}
      <Section num={2} title="Occupation & Safety">
        <YesNo
          label="Do you work as air crew, long-distance driver, emergency/defence personnel, or in a physically strenuous role?"
          val={ans.isHighRiskOccupation}
          onChange={v => setB('isHighRiskOccupation', v)}
        />
        {ans.isHighRiskOccupation && (
          <YesNo
            label="Is your next duty shift within the next 24 hours?"
            val={ans.nextDutyWithin24Hours}
            onChange={v => setB('nextDutyWithin24Hours', v)}
            yesWarning
          />
        )}
      </Section>

      {/* Section 3 — Jaundice */}
      <Section num={3} title="Jaundice / Hepatitis History">
        <YesNo label="Have you ever had jaundice?" val={ans.hadJaundice} onChange={v => setB('hadJaundice', v)} yesWarning />
        {ans.hadJaundice && (
          <>
            <div>
              <label className="form-label">What was the cause of jaundice?</label>
              <select
                className="form-input"
                value={ans.jaundiceType}
                onChange={e => setS('jaundiceType', e.target.value as JaundiceType)}
              >
                <option value="">— Select —</option>
                <option value="UNKNOWN">Unknown cause</option>
                <option value="HBV">Hepatitis B Virus (HBV) — Permanent rejection</option>
                <option value="HCV">Hepatitis C Virus (HCV) — Permanent rejection</option>
                <option value="HEP_A_E">Hepatitis A or E — 12-month deferral</option>
                <option value="GALLSTONE">Gall Stones — Eligible</option>
                <option value="NEONATAL">Neonatal (at birth) — Eligible</option>
              </select>
            </div>
            {ans.jaundiceType === 'HEP_A_E' && (
              <DateField label="Date of full recovery from Hepatitis A/E" val={ans.jaundiceDate} onChange={v => setS('jaundiceDate', v)} />
            )}
          </>
        )}
      </Section>

      {/* Section 4 — Skin / Cosmetic */}
      <Section num={4} title="Skin Procedures & Transfusion Exposure">
        <YesNo
          label="Have you had a tattoo, body piercing, ear piercing, or acupuncture in the past 12 months?"
          val={ans.hadTattooOrPiercing}
          onChange={v => setB('hadTattooOrPiercing', v)}
          yesWarning
        />
        {ans.hadTattooOrPiercing && (
          <DateField label="Date of procedure" val={ans.tattooDate} onChange={v => setS('tattooDate', v)} />
        )}

        <YesNo
          label="Have you undergone invasive cosmetic procedures (Botox, fillers, implants) in the past 12 months?"
          val={ans.hadCosmeticInvasive}
          onChange={v => setB('hadCosmeticInvasive', v)}
          yesWarning
        />
        {ans.hadCosmeticInvasive && (
          <DateField label="Date of cosmetic procedure" val={ans.cosmeticDate} onChange={v => setS('cosmeticDate', v)} />
        )}

        <YesNo
          label="Has your spouse or partner received a blood transfusion in the past 12 months?"
          val={ans.spouseHadTransfusion}
          onChange={v => setB('spouseHadTransfusion', v)}
          yesWarning
        />
        {ans.spouseHadTransfusion && (
          <DateField label="Date of spouse's transfusion" val={ans.spouseTransfusionDate} onChange={v => setS('spouseTransfusionDate', v)} />
        )}
      </Section>

      {/* Section 5 — Dental */}
      <Section num={5} title="Dental Procedures">
        <YesNo label="Have you had a tooth extraction?" val={ans.hadToothExtraction} onChange={v => setB('hadToothExtraction', v)} yesWarning />
        {ans.hadToothExtraction && (
          <DateField label="Date of tooth extraction" val={ans.toothExtractionDate} onChange={v => setS('toothExtractionDate', v)} />
        )}
        <YesNo label="Have you had dental surgery under anaesthesia?" val={ans.hadDentalSurgery} onChange={v => setB('hadDentalSurgery', v)} yesWarning />
        {ans.hadDentalSurgery && (
          <DateField label="Date of full recovery from dental surgery" val={ans.dentalSurgeryDate} onChange={v => setS('dentalSurgeryDate', v)} />
        )}
      </Section>

      {/* Section 6 — Surgery */}
      <Section num={6} title="Surgical History">
        <YesNo label="Have you had minor surgery?" val={ans.hadMinorSurgery} onChange={v => setB('hadMinorSurgery', v)} yesWarning />
        {ans.hadMinorSurgery && (
          <DateField label="Date of full recovery from minor surgery" val={ans.minorSurgeryDate} onChange={v => setS('minorSurgeryDate', v)} />
        )}
        <YesNo label="Have you had major surgery?" val={ans.hadMajorSurgery} onChange={v => setB('hadMajorSurgery', v)} yesWarning />
        {ans.hadMajorSurgery && (
          <DateField label="Date of full recovery from major surgery" val={ans.majorSurgeryDate} onChange={v => setS('majorSurgeryDate', v)} />
        )}
      </Section>

      {/* Section 7 — Infections */}
      <Section num={7} title="Recent Infections / Illnesses">
        {([
          ['hadTyphoid', 'typhoidDate', 'Typhoid fever (12-month deferral)'],
          ['hadMalaria', 'malariaDate', 'Malaria (3-month deferral)'],
          ['hadDengue', 'dengueDate', 'Dengue fever (6-month deferral)'],
          ['hadChikungunya', 'chikungunyaDate', 'Chikungunya (6-month deferral)'],
          ['hadZika', 'zikaDate', 'Zika Virus (4-month deferral)'],
          ['hadMeaslesMumpsChicken', 'measlesDate', 'Measles, Mumps, Chickenpox, or Rubella (2-week deferral)'],
          ['hadKidneyInfection', 'kidneyInfectionDate', 'Acute Kidney Infection / Pyelonephritis (6-month deferral)'],
          ['hadUTI', 'utiDate', 'UTI / Cystitis (14-day deferral)'],
        ] as [BoolKey, StrKey, string][]).map(([bk, dk, lbl]) => (
          <div key={bk}>
            <YesNo label={`Have you had: ${lbl}?`} val={ans[bk] as boolean} onChange={v => setB(bk, v)} yesWarning />
            {ans[bk] && (
              <DateField label="Date of full recovery" val={ans[dk] as string} onChange={v => setS(dk, v)} />
            )}
          </div>
        ))}
      </Section>

      {/* Section 8 — Vaccines */}
      <Section num={8} title="Recent Vaccinations">
        <YesNo label="COVID-19 vaccine in the last 14 days?" val={ans.hadCovid19Vaccine} onChange={v => setB('hadCovid19Vaccine', v)} yesWarning />
        {ans.hadCovid19Vaccine && (
          <DateField label="Date of COVID-19 vaccination" val={ans.covid19VaccineDate} onChange={v => setS('covid19VaccineDate', v)} />
        )}
        <YesNo
          label="Live vaccine in the last 28 days? (e.g., Yellow Fever, MMR, Oral Typhoid)"
          val={ans.hadLiveVaccine}
          onChange={v => setB('hadLiveVaccine', v)}
          yesWarning
        />
        {ans.hadLiveVaccine && (
          <DateField label="Date of live vaccine" val={ans.liveVaccineDate} onChange={v => setS('liveVaccineDate', v)} />
        )}
        <YesNo label="Anti-rabies vaccination in the last 12 months?" val={ans.hadAntiRabies} onChange={v => setB('hadAntiRabies', v)} yesWarning />
        {ans.hadAntiRabies && (
          <DateField label="Date of anti-rabies vaccination" val={ans.antiRabiesDate} onChange={v => setS('antiRabiesDate', v)} />
        )}
        <YesNo label="Hepatitis B Immunoglobulin in the last 12 months?" val={ans.hadHepBIg} onChange={v => setB('hadHepBIg', v)} yesWarning />
        {ans.hadHepBIg && (
          <DateField label="Date of Hepatitis B Immunoglobulin" val={ans.hepBIgDate} onChange={v => setS('hepBIgDate', v)} />
        )}
      </Section>

      {/* Section 9 — Chronic / Permanent Conditions */}
      <Section num={9} title="Medical Conditions (Chronic / Permanent)">
        <p className="text-xs text-gray-500 mb-3 bg-gray-50 rounded p-2">
          Answering &quot;Yes&quot; to any of the following may result in permanent deferral from blood donation.
          Please answer honestly — your safety and the safety of the recipient depend on it.
        </p>
        {([
          ['hasAsthmaOnSteroids', 'Asthma requiring steroid/inhaler treatment'],
          ['hasCardiovascularDisease', 'Heart disease (Heart attack, Angina, CAD, Hypertensive Heart Disease)'],
          ['hasDiabetesInsulin', 'Diabetes requiring insulin with multi-organ complications'],
          ['hasHighRiskBehavior', 'High-risk behaviour for HIV/AIDS (multiple partners, IV drug use, etc.)'],
          ['hasHIV', 'HIV / AIDS positive'],
          ['hasSTI', 'Sexually Transmitted Infection (Syphilis, Gonorrhea)'],
          ['hasChronicKidneyDisease', 'Chronic Kidney Disease or Renal Failure'],
          ['hasLiverFailure', 'Liver failure / Cirrhosis'],
          ['hasLeprosy', 'Leprosy or Leishmaniasis'],
          ['hasAutoimmune', 'Autoimmune disease (SLE / Lupus, Rheumatoid Arthritis)'],
          ['hasBleedingDisorder', 'Bleeding disorder (Haemophilia, ITP)'],
          ['hasPolycythemia', 'Polycythemia Vera'],
          ['hadOrganTransplant', 'Organ or Stem Cell Transplant (received)'],
        ] as [BoolKey, string][]).map(([key, lbl]) => (
          <YesNo key={key} label={lbl} val={ans[key] as boolean} onChange={v => setB(key, v)} yesWarning />
        ))}
      </Section>

      {/* Section 10 — Female */}
      {gender === 'FEMALE' && (
        <Section num={10} title="For Female Donors Only">
          <YesNo label="Are you currently pregnant?" val={ans.isPregnant} onChange={v => setB('isPregnant', v)} yesWarning />
          <YesNo label="Have you delivered a baby in the last 12 months?" val={ans.recentDelivery} onChange={v => setB('recentDelivery', v)} yesWarning />
          {ans.recentDelivery && (
            <DateField label="Date of delivery" val={ans.deliveryDate} onChange={v => setS('deliveryDate', v)} />
          )}
          <YesNo label="Have you had an abortion / miscarriage in the last 6 months?" val={ans.recentAbortion} onChange={v => setB('recentAbortion', v)} yesWarning />
          {ans.recentAbortion && (
            <DateField label="Date of abortion / miscarriage" val={ans.abortionDate} onChange={v => setS('abortionDate', v)} />
          )}
          <YesNo label="Are you currently breastfeeding (lactating)?" val={ans.isLactating} onChange={v => setB('isLactating', v)} yesWarning />
          <YesNo label="Are you currently menstruating?" val={ans.isMenstruating} onChange={v => setB('isMenstruating', v)} yesWarning />
          {!ans.isMenstruating && (
            <DateField label="Date your last menstrual period began" val={ans.lastPeriodDate} onChange={v => setS('lastPeriodDate', v)} />
          )}
        </Section>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-secondary flex-1">
          ← Back
        </button>
        <button type="submit" className="btn-primary flex-1">
          Continue to Consent →
        </button>
      </div>
    </form>
  );
}

function Section({
  num,
  title,
  children,
}: {
  num: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="section-card">
      <h3 className="section-title">
        <span className="w-7 h-7 bg-srm-100 text-srm-800 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{num}</span>
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function YesNo({
  label,
  val,
  onChange,
  yesWarning,
}: {
  label: string;
  val: boolean;
  onChange: (v: boolean) => void;
  yesWarning?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <p className="text-sm text-gray-700 flex-1">{label}</p>
      <div className="flex gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`px-3 py-1 text-xs font-bold rounded transition-all
            ${val ? (yesWarning ? 'bg-amber-500 text-white' : 'bg-green-500 text-white') : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          YES
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`px-3 py-1 text-xs font-bold rounded transition-all
            ${!val ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          NO
        </button>
      </div>
    </div>
  );
}

function DateField({
  label,
  val,
  onChange,
}: {
  label: string;
  val: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="ml-4 mt-1">
      <label className="form-label text-xs text-gray-500">{label}</label>
      <input
        type="date"
        max={today}
        className="form-input text-sm py-1.5"
        value={val}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}
