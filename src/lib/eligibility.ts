import {
  addDays,
  addWeeks,
  addMonths,
  parseISO,
  isBefore,
  differenceInDays,
  format,
} from 'date-fns';
import type { BasicInfo, ScreeningAnswers, EligibilityResult } from '@/types/donor';

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  try {
    return parseISO(dateStr);
  } catch {
    return null;
  }
}

export function formatDisplayDate(isoStr: string): string {
  const d = parseDate(isoStr);
  if (!d) return '';
  return format(d, 'dd MMM yyyy');
}

function deferral(
  date: Date | null,
  reason: string,
  opts: { months?: number; weeks?: number; days?: number }
): EligibilityResult | null {
  if (!date) return null;
  const now = new Date();
  let eligible: Date;
  if (opts.months) eligible = addMonths(date, opts.months);
  else if (opts.weeks) eligible = addWeeks(date, opts.weeks);
  else eligible = addDays(date, opts.days ?? 0);

  if (isBefore(now, eligible)) {
    return {
      status: 'TEMP_DEFERRED',
      reason,
      eligibleReturnDate: eligible.toISOString(),
    };
  }
  return null;
}

export function calculateEligibility(
  info: BasicInfo,
  ans: ScreeningAnswers
): EligibilityResult {
  const now = new Date();

  // ── Age ──────────────────────────────────────────────────────────────────
  const maxAge = info.isFirstTimeDonor ? 60 : 65;
  if (info.age < 18)
    return { status: 'PERMANENTLY_REJECTED', reason: 'Donors must be at least 18 years old.' };
  if (info.age > maxAge)
    return {
      status: 'PERMANENTLY_REJECTED',
      reason: `${info.isFirstTimeDonor ? 'First-time donors' : 'Donors'} must not exceed ${maxAge} years of age.`,
    };
  if (info.donationType === 'APHERESIS' && info.age > 60)
    return { status: 'PERMANENTLY_REJECTED', reason: 'Apheresis donors must be 18–60 years old.' };

  // ── Weight ────────────────────────────────────────────────────────────────
  const minWeight = info.donationType === 'APHERESIS' ? 50 : 45;
  if (info.weightKg < minWeight)
    return {
      status: 'PERMANENTLY_REJECTED',
      reason: `Minimum weight for ${info.donationType === 'APHERESIS' ? 'apheresis' : 'whole blood'} donation is ${minWeight} kg. Recorded weight: ${info.weightKg} kg.`,
    };

  const eligibleVolume = info.weightKg <= 55 ? 350 : 450;

  // ── Donation interval ─────────────────────────────────────────────────────
  if (!info.isFirstTimeDonor && info.lastDonationDate) {
    const last = parseDate(info.lastDonationDate);
    if (last) {
      const minDays = info.gender === 'FEMALE' ? 120 : 90;
      const daysSince = differenceInDays(now, last);
      if (info.donationType === 'WHOLE_BLOOD' && daysSince < minDays) {
        const eligible = addDays(last, minDays);
        return {
          status: 'TEMP_DEFERRED',
          reason: `The minimum interval between whole blood donations is ${minDays} days for ${info.gender === 'FEMALE' ? 'female' : 'male'} donors. Last donation: ${format(last, 'dd MMM yyyy')}.`,
          eligibleReturnDate: eligible.toISOString(),
        };
      }
    }
  }

  // ── General wellness ──────────────────────────────────────────────────────
  if (!ans.feelingHealthy)
    return { status: 'TEMP_DEFERRED', reason: 'You must be feeling healthy to donate. Please return when you are well.' };
  if (!ans.hadMealWithin4Hours)
    return { status: 'TEMP_DEFERRED', reason: 'Please eat a meal within 4 hours before donating blood.' };
  if (!ans.hadAdequateSleep)
    return { status: 'TEMP_DEFERRED', reason: 'Adequate sleep is required before blood donation.' };
  if (ans.isNightShiftWithoutSleep)
    return { status: 'TEMP_DEFERRED', reason: 'Night shift workers must have adequate sleep before donating.' };

  // ── Permanent conditions ──────────────────────────────────────────────────
  if (ans.hasAsthmaOnSteroids)
    return { status: 'PERMANENTLY_REJECTED', reason: 'Asthma requiring steroid treatment is a permanent deferral condition.' };
  if (ans.hasCardiovascularDisease)
    return { status: 'PERMANENTLY_REJECTED', reason: 'Active or chronic cardiovascular disease (Myocardial Infarction, Angina, CAD, Hypertensive Heart Disease) is a permanent deferral condition.' };
  if (ans.hasDiabetesInsulin)
    return { status: 'PERMANENTLY_REJECTED', reason: 'Insulin-dependent diabetes with multi-organ complications is a permanent deferral condition.' };
  if (ans.hasHighRiskBehavior || ans.hasHIV)
    return { status: 'PERMANENTLY_REJECTED', reason: 'High-risk behaviour for HIV/AIDS or HIV-positive status is a permanent deferral condition.' };
  if (ans.hasSTI)
    return { status: 'PERMANENTLY_REJECTED', reason: 'History of sexually transmitted infections (Syphilis, Gonorrhea) is a permanent deferral condition.' };
  if (ans.hasChronicKidneyDisease)
    return { status: 'PERMANENTLY_REJECTED', reason: 'Chronic Kidney Disease or Renal Failure is a permanent deferral condition.' };
  if (ans.hasLiverFailure)
    return { status: 'PERMANENTLY_REJECTED', reason: 'Liver failure is a permanent deferral condition.' };
  if (ans.hasLeprosy)
    return { status: 'PERMANENTLY_REJECTED', reason: 'Leprosy or Leishmaniasis is a permanent deferral condition.' };
  if (ans.hasAutoimmune)
    return { status: 'PERMANENTLY_REJECTED', reason: 'Autoimmune diseases (SLE, Rheumatoid Arthritis) are permanent deferral conditions.' };
  if (ans.hasBleedingDisorder)
    return { status: 'PERMANENTLY_REJECTED', reason: 'Bleeding disorders are a permanent deferral condition.' };
  if (ans.hasPolycythemia)
    return { status: 'PERMANENTLY_REJECTED', reason: 'Polycythemia Vera is a permanent deferral condition.' };
  if (ans.hadOrganTransplant)
    return { status: 'PERMANENTLY_REJECTED', reason: 'History of organ or stem cell transplant is a permanent deferral condition.' };

  // ── Jaundice ──────────────────────────────────────────────────────────────
  if (ans.hadJaundice) {
    const jt = ans.jaundiceType;
    if (!jt || jt === 'UNKNOWN' || jt === 'HBV' || jt === 'HCV')
      return {
        status: 'PERMANENTLY_REJECTED',
        reason: `Jaundice of ${jt === 'HBV' ? 'Hepatitis B' : jt === 'HCV' ? 'Hepatitis C' : 'unknown'} cause is a permanent deferral condition.`,
      };
    if (jt === 'HEP_A_E') {
      const r = deferral(parseDate(ans.jaundiceDate), 'Hepatitis A or E jaundice requires a 12-month deferral following recovery.', { months: 12 });
      if (r) return r;
    }
  }

  // ── Tattoo / Piercing / Cosmetic ──────────────────────────────────────────
  if (ans.hadTattooOrPiercing) {
    const r = deferral(parseDate(ans.tattooDate), 'Tattooing, body piercing, or acupuncture requires a 12-month deferral.', { months: 12 });
    if (r) return r;
  }
  if (ans.hadCosmeticInvasive) {
    const r = deferral(parseDate(ans.cosmeticDate), 'Invasive cosmetic procedures require a 12-month deferral.', { months: 12 });
    if (r) return r;
  }
  if (ans.spouseHadTransfusion) {
    const r = deferral(parseDate(ans.spouseTransfusionDate), 'Spouse/partner receiving a blood transfusion requires a 12-month deferral.', { months: 12 });
    if (r) return r;
  }

  // ── Dental ────────────────────────────────────────────────────────────────
  if (ans.hadToothExtraction) {
    const r = deferral(parseDate(ans.toothExtractionDate), 'Tooth extraction requires a 6-month deferral.', { months: 6 });
    if (r) return r;
  }
  if (ans.hadDentalSurgery) {
    const r = deferral(parseDate(ans.dentalSurgeryDate), 'Dental surgery under anesthesia requires a 6-month deferral after recovery.', { months: 6 });
    if (r) return r;
  }

  // ── Surgery ───────────────────────────────────────────────────────────────
  if (ans.hadMinorSurgery) {
    const r = deferral(parseDate(ans.minorSurgeryDate), 'Minor surgery requires a 6-month deferral after recovery.', { months: 6 });
    if (r) return r;
  }
  if (ans.hadMajorSurgery) {
    const r = deferral(parseDate(ans.majorSurgeryDate), 'Major surgery requires a 12-month deferral after recovery.', { months: 12 });
    if (r) return r;
  }

  // ── Infections ────────────────────────────────────────────────────────────
  const infectionChecks: Array<[boolean, string, Parameters<typeof deferral>[2], string]> = [
    [ans.hadTyphoid,           ans.typhoidDate,         { months: 12 }, 'Typhoid requires a 12-month deferral following full recovery.'],
    [ans.hadMalaria,           ans.malariaDate,         { months: 3  }, 'Malaria requires a 3-month deferral following full recovery.'],
    [ans.hadDengue,            ans.dengueDate,          { months: 6  }, 'Dengue fever requires a 6-month deferral following full recovery.'],
    [ans.hadChikungunya,       ans.chikungunyaDate,     { months: 6  }, 'Chikungunya requires a 6-month deferral following full recovery.'],
    [ans.hadZika,              ans.zikaDate,            { months: 4  }, 'Zika Virus requires a 4-month deferral following full recovery.'],
    [ans.hadMeaslesMumpsChicken, ans.measlesDate,       { weeks: 2   }, 'Measles, Mumps, Chickenpox, or Rubella requires a 2-week deferral following full recovery.'],
    [ans.hadKidneyInfection,   ans.kidneyInfectionDate, { months: 6  }, 'Acute Kidney Infection (Pyelonephritis) requires a 6-month deferral after complete recovery.'],
    [ans.hadUTI,               ans.utiDate,             { days: 14   }, 'UTI/Cystitis requires a 14-day deferral.'],
  ];
  for (const [cond, dateStr, opts, reason] of infectionChecks) {
    if (cond) {
      const r = deferral(parseDate(dateStr), reason, opts);
      if (r) return r;
    }
  }

  // ── Vaccines ──────────────────────────────────────────────────────────────
  if (ans.hadCovid19Vaccine) {
    const r = deferral(parseDate(ans.covid19VaccineDate), 'COVID-19 vaccination requires a 14-day deferral.', { days: 14 });
    if (r) return r;
  }
  if (ans.hadLiveVaccine) {
    const r = deferral(parseDate(ans.liveVaccineDate), 'Live vaccine (e.g., Yellow Fever, MMR) requires a 28-day deferral.', { days: 28 });
    if (r) return r;
  }
  if (ans.hadAntiRabies) {
    const r = deferral(parseDate(ans.antiRabiesDate), 'Anti-rabies vaccination requires a 12-month deferral.', { months: 12 });
    if (r) return r;
  }
  if (ans.hadHepBIg) {
    const r = deferral(parseDate(ans.hepBIgDate), 'Hepatitis B Immunoglobulin requires a 12-month deferral.', { months: 12 });
    if (r) return r;
  }

  // ── Female-specific ───────────────────────────────────────────────────────
  if (info.gender === 'FEMALE') {
    if (ans.isPregnant)
      return { status: 'TEMP_DEFERRED', reason: 'Pregnant donors are not eligible. Please return 12 months after delivery.' };
    if (ans.recentDelivery) {
      const r = deferral(parseDate(ans.deliveryDate), 'Donors who have recently delivered must wait 12 months before donating.', { months: 12 });
      if (r) return r;
    }
    if (ans.recentAbortion) {
      const r = deferral(parseDate(ans.abortionDate), 'Donors who have had a recent abortion must wait 6 months before donating.', { months: 6 });
      if (r) return r;
    }
    if (ans.isLactating)
      return { status: 'TEMP_DEFERRED', reason: 'Donors who are breastfeeding (lactating) are not eligible during the lactation period.' };
    if (ans.isMenstruating)
      return { status: 'TEMP_DEFERRED', reason: 'Donors are not eligible during menstruation or within 5 days of the start of their period.' };
    if (ans.lastPeriodDate) {
      const lp = parseDate(ans.lastPeriodDate);
      if (lp && differenceInDays(now, lp) <= 5)
        return { status: 'TEMP_DEFERRED', reason: 'Donors are not eligible within 5 days after the start of their menstrual period.' };
    }
  }

  // ── Occupational ──────────────────────────────────────────────────────────
  if (ans.isHighRiskOccupation && ans.nextDutyWithin24Hours)
    return {
      status: 'TEMP_DEFERRED',
      reason: 'Air crew, long-distance drivers, emergency personnel, and strenuous-occupation workers cannot donate within 24 hours of their next duty shift. Please return after completing your duty period.',
    };

  // ── All checks passed ─────────────────────────────────────────────────────
  return { status: 'FIT', eligibleVolume };
}
