import { addDays, addWeeks, addMonths, parseISO, isBefore, differenceInDays, format } from 'date-fns';
import type { BasicInfo, ScreeningAnswers, EligibilityResult } from '@/types/donor';

function parseDate(s: string): Date | null {
  if (!s) return null;
  try { return parseISO(s); } catch { return null; }
}

export function formatDisplayDate(iso: string): string {
  const d = parseDate(iso);
  return d ? format(d, 'dd MMM yyyy') : '';
}

function defer(
  date: Date | null, reason: string,
  opts: { months?: number; weeks?: number; days?: number }
): EligibilityResult | null {
  if (!date) return null;
  const now = new Date();
  const eligible = opts.months ? addMonths(date, opts.months)
    : opts.weeks ? addWeeks(date, opts.weeks)
    : addDays(date, opts.days ?? 0);
  return isBefore(now, eligible)
    ? { status: 'TEMP_DEFERRED', reason, eligibleReturnDate: eligible.toISOString() }
    : null;
}

export function calculateEligibility(info: BasicInfo, ans: ScreeningAnswers): EligibilityResult {
  const now = new Date();

  // Age
  const maxAge = info.isFirstTimeDonor ? 60 : 65;
  if (info.age < 18) return { status: 'PERMANENTLY_REJECTED', reason: 'Donors must be at least 18 years old.' };
  if (info.age > maxAge) return { status: 'PERMANENTLY_REJECTED', reason: `Maximum eligible age is ${maxAge} years.` };
  if (info.donationType === 'APHERESIS' && info.age > 60) return { status: 'PERMANENTLY_REJECTED', reason: 'Apheresis donors must be 18–60 years old.' };

  // Weight
  const minW = info.donationType === 'APHERESIS' ? 50 : 45;
  if (info.weightKg < minW) return { status: 'PERMANENTLY_REJECTED', reason: `Minimum weight is ${minW} kg. Recorded: ${info.weightKg} kg.` };
  const eligibleVolume = info.weightKg <= 55 ? 350 : 450;

  // Donation interval
  if (!info.isFirstTimeDonor && info.lastDonationDate) {
    const last = parseDate(info.lastDonationDate);
    if (last) {
      const minDays = info.gender === 'FEMALE' ? 120 : 90;
      if (info.donationType === 'WHOLE_BLOOD' && differenceInDays(now, last) < minDays) {
        return { status: 'TEMP_DEFERRED', reason: `Minimum interval is ${minDays} days. Last donation: ${format(last, 'dd MMM yyyy')}.`, eligibleReturnDate: addDays(last, minDays).toISOString() };
      }
    }
  }

  // Wellness
  if (!ans.feelingHealthy) return { status: 'TEMP_DEFERRED', reason: 'You must be feeling healthy to donate.' };
  if (!ans.hadMealWithin4Hours) return { status: 'TEMP_DEFERRED', reason: 'Please eat a meal within 4 hours before donating.' };
  if (!ans.hadAdequateSleep) return { status: 'TEMP_DEFERRED', reason: 'Adequate sleep is required before donating.' };
  if (ans.isNightShiftWithoutSleep) return { status: 'TEMP_DEFERRED', reason: 'Night shift workers must sleep before donating.' };

  // Permanent conditions
  const permanent: [boolean, string][] = [
    [ans.hasAsthmaOnSteroids, 'Asthma on steroids is a permanent deferral condition.'],
    [ans.hasCardiovascularDisease, 'Active cardiovascular disease is a permanent deferral condition.'],
    [ans.hasDiabetesInsulin, 'Insulin-dependent diabetes with complications is a permanent deferral condition.'],
    [ans.hasHighRiskBehavior || ans.hasHIV, 'High-risk behaviour for HIV/AIDS or HIV-positive status is a permanent deferral condition.'],
    [ans.hasSTI, 'History of STI (Syphilis, Gonorrhea) is a permanent deferral condition.'],
    [ans.hasChronicKidneyDisease, 'Chronic Kidney Disease is a permanent deferral condition.'],
    [ans.hasLiverFailure, 'Liver failure is a permanent deferral condition.'],
    [ans.hasLeprosy, 'Leprosy or Leishmaniasis is a permanent deferral condition.'],
    [ans.hasAutoimmune, 'Autoimmune disease (SLE, RA) is a permanent deferral condition.'],
    [ans.hasBleedingDisorder, 'Bleeding disorders are a permanent deferral condition.'],
    [ans.hasPolycythemia, 'Polycythemia Vera is a permanent deferral condition.'],
    [ans.hadOrganTransplant, 'Organ or stem cell transplant is a permanent deferral condition.'],
  ];
  for (const [cond, reason] of permanent) {
    if (cond) return { status: 'PERMANENTLY_REJECTED', reason };
  }

  // Jaundice
  if (ans.hadJaundice) {
    const jt = ans.jaundiceType;
    if (!jt || jt === 'UNKNOWN' || jt === 'HBV' || jt === 'HCV')
      return { status: 'PERMANENTLY_REJECTED', reason: `Jaundice of ${jt === 'HBV' ? 'Hepatitis B' : jt === 'HCV' ? 'Hepatitis C' : 'unknown'} cause is a permanent deferral.` };
    if (jt === 'HEP_A_E') { const r = defer(parseDate(ans.jaundiceDate), 'Hepatitis A/E requires 12-month deferral.', { months: 12 }); if (r) return r; }
  }

  // Temporary deferrals
  const tempChecks: [boolean, string, Parameters<typeof defer>[2], string][] = [
    [ans.hadTattooOrPiercing, ans.tattooDate, { months: 12 }, 'Tattooing/piercing requires a 12-month deferral.'],
    [ans.hadCosmeticInvasive, ans.cosmeticDate, { months: 12 }, 'Invasive cosmetic procedures require a 12-month deferral.'],
    [ans.spouseHadTransfusion, ans.spouseTransfusionDate, { months: 12 }, 'Spouse transfusion requires a 12-month deferral.'],
    [ans.hadToothExtraction, ans.toothExtractionDate, { months: 6 }, 'Tooth extraction requires a 6-month deferral.'],
    [ans.hadDentalSurgery, ans.dentalSurgeryDate, { months: 6 }, 'Dental surgery requires a 6-month deferral.'],
    [ans.hadMinorSurgery, ans.minorSurgeryDate, { months: 6 }, 'Minor surgery requires a 6-month deferral.'],
    [ans.hadMajorSurgery, ans.majorSurgeryDate, { months: 12 }, 'Major surgery requires a 12-month deferral.'],
    [ans.hadTyphoid, ans.typhoidDate, { months: 12 }, 'Typhoid requires a 12-month deferral.'],
    [ans.hadMalaria, ans.malariaDate, { months: 3 }, 'Malaria requires a 3-month deferral.'],
    [ans.hadDengue, ans.dengueDate, { months: 6 }, 'Dengue requires a 6-month deferral.'],
    [ans.hadChikungunya, ans.chikungunyaDate, { months: 6 }, 'Chikungunya requires a 6-month deferral.'],
    [ans.hadZika, ans.zikaDate, { months: 4 }, 'Zika Virus requires a 4-month deferral.'],
    [ans.hadMeaslesMumpsChicken, ans.measlesDate, { weeks: 2 }, 'Measles/Mumps/Chickenpox requires a 2-week deferral.'],
    [ans.hadKidneyInfection, ans.kidneyInfectionDate, { months: 6 }, 'Kidney infection requires a 6-month deferral.'],
    [ans.hadUTI, ans.utiDate, { days: 14 }, 'UTI requires a 14-day deferral.'],
    [ans.hadCovid19Vaccine, ans.covid19VaccineDate, { days: 14 }, 'COVID-19 vaccine requires a 14-day deferral.'],
    [ans.hadLiveVaccine, ans.liveVaccineDate, { days: 28 }, 'Live vaccine requires a 28-day deferral.'],
    [ans.hadAntiRabies, ans.antiRabiesDate, { months: 12 }, 'Anti-rabies vaccination requires a 12-month deferral.'],
    [ans.hadHepBIg, ans.hepBIgDate, { months: 12 }, 'Hepatitis B Immunoglobulin requires a 12-month deferral.'],
  ];
  for (const [cond, dateStr, opts, reason] of tempChecks) {
    if (cond) { const r = defer(parseDate(dateStr), reason, opts); if (r) return r; }
  }

  // Female-specific
  if (info.gender === 'FEMALE') {
    if (ans.isPregnant) return { status: 'TEMP_DEFERRED', reason: 'Pregnant donors are not eligible. Return 12 months after delivery.' };
    if (ans.recentDelivery) { const r = defer(parseDate(ans.deliveryDate), 'Must wait 12 months after delivery.', { months: 12 }); if (r) return r; }
    if (ans.recentAbortion) { const r = defer(parseDate(ans.abortionDate), 'Must wait 6 months after abortion.', { months: 6 }); if (r) return r; }
    if (ans.isLactating) return { status: 'TEMP_DEFERRED', reason: 'Donors who are breastfeeding are not eligible.' };
    if (ans.isMenstruating) return { status: 'TEMP_DEFERRED', reason: 'Not eligible during menstruation or within 5 days of period start.' };
    if (ans.lastPeriodDate) {
      const lp = parseDate(ans.lastPeriodDate);
      if (lp && differenceInDays(new Date(), lp) <= 5) return { status: 'TEMP_DEFERRED', reason: 'Not eligible within 5 days of menstrual period start.' };
    }
  }

  // Occupational
  if (ans.isHighRiskOccupation && ans.nextDutyWithin24Hours)
    return { status: 'TEMP_DEFERRED', reason: 'Cannot donate within 24 hours of next duty shift (air crew, emergency services, etc.).' };

  return { status: 'FIT', eligibleVolume };
}
