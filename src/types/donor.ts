export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type MaritalStatus = 'SINGLE' | 'MARRIED';
export type DonationType = 'WHOLE_BLOOD' | 'APHERESIS';
export type JaundiceType = 'UNKNOWN' | 'HBV' | 'HCV' | 'HEP_A_E' | 'GALLSTONE' | 'NEONATAL';
export type EligibilityStatus = 'FIT' | 'TEMP_DEFERRED' | 'PERMANENTLY_REJECTED';

export interface BasicInfo {
  fullName: string;
  fatherName: string;
  occupation: string;
  address: string;
  mobile: string;
  email: string;
  gender: Gender;
  maritalStatus: MaritalStatus;
  dob: string;
  age: number;
  weightKg: number;
  donationType: DonationType;
  isFirstTimeDonor: boolean;
  lastDonationDate: string;
}

export interface ScreeningAnswers {
  feelingHealthy: boolean;
  hadMealWithin4Hours: boolean;
  hadAdequateSleep: boolean;
  isNightShiftWithoutSleep: boolean;

  isHighRiskOccupation: boolean;
  nextDutyWithin24Hours: boolean;

  hadJaundice: boolean;
  jaundiceType: JaundiceType | '';
  jaundiceDate: string;

  hadTattooOrPiercing: boolean;
  tattooDate: string;
  hadCosmeticInvasive: boolean;
  cosmeticDate: string;
  spouseHadTransfusion: boolean;
  spouseTransfusionDate: string;

  hadToothExtraction: boolean;
  toothExtractionDate: string;
  hadDentalSurgery: boolean;
  dentalSurgeryDate: string;

  hadMinorSurgery: boolean;
  minorSurgeryDate: string;
  hadMajorSurgery: boolean;
  majorSurgeryDate: string;

  hadTyphoid: boolean;
  typhoidDate: string;
  hadMalaria: boolean;
  malariaDate: string;
  hadDengue: boolean;
  dengueDate: string;
  hadChikungunya: boolean;
  chikungunyaDate: string;
  hadZika: boolean;
  zikaDate: string;
  hadMeaslesMumpsChicken: boolean;
  measlesDate: string;
  hadKidneyInfection: boolean;
  kidneyInfectionDate: string;
  hadUTI: boolean;
  utiDate: string;

  hadCovid19Vaccine: boolean;
  covid19VaccineDate: string;
  hadLiveVaccine: boolean;
  liveVaccineDate: string;
  hadAntiRabies: boolean;
  antiRabiesDate: string;
  hadHepBIg: boolean;
  hepBIgDate: string;

  hasAsthmaOnSteroids: boolean;
  hasCardiovascularDisease: boolean;
  hasDiabetesInsulin: boolean;
  hasHighRiskBehavior: boolean;
  hasHIV: boolean;
  hasSTI: boolean;
  hasChronicKidneyDisease: boolean;
  hasLiverFailure: boolean;
  hasLeprosy: boolean;
  hasAutoimmune: boolean;
  hasBleedingDisorder: boolean;
  hasPolycythemia: boolean;
  hadOrganTransplant: boolean;

  isPregnant: boolean;
  recentDelivery: boolean;
  deliveryDate: string;
  recentAbortion: boolean;
  abortionDate: string;
  isLactating: boolean;
  isMenstruating: boolean;
  lastPeriodDate: string;
}

export interface ConsentData {
  wantTestResults: boolean;
  declarationAccepted: boolean;
  signedName: string;
  consentTimestamp: string;
}

export interface EligibilityResult {
  status: EligibilityStatus;
  reason?: string;
  eligibleReturnDate?: string;
  eligibleVolume?: number;
}

export interface DonorRecord {
  id: string;
  createdAt: string;
  fullName: string;
  mobile: string;
  gender: string;
  age: number;
  weightKg: number;
  eligibilityStatus: string;
  deferralReason: string;
  eligibleReturnDate: string;
  eligibleVolume: number;
  medicalExam?: MedicalExamRecord | null;
}

export interface MedicalExamRecord {
  id: string;
  donationDate: string;
  haemoglobin: number;
  temperature: number;
  pulse: number;
  bpSystolic: number;
  bpDiastolic: number;
  finalStatus: string;
  comments: string;
  bloodUnitNumber: string;
  volumeCollected: number;
}
