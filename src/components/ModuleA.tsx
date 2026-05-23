'use client';

import { useState } from 'react';
import type { BasicInfo, Gender, MaritalStatus, DonationType } from '@/types/donor';

interface Props {
  onNext: (data: BasicInfo) => void;
}

const today = new Date().toISOString().split('T')[0];
const minDOB = new Date(new Date().setFullYear(new Date().getFullYear() - 65)).toISOString().split('T')[0];
const maxDOB = new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0];

function calcAge(dob: string): number {
  if (!dob) return 0;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export default function ModuleA({ onNext }: Props) {
  const [form, setForm] = useState<BasicInfo>({
    fullName: '', fatherName: '', occupation: '', address: '',
    mobile: '', email: '', gender: 'MALE', maritalStatus: 'SINGLE',
    dob: '', age: 0, weightKg: 0, donationType: 'WHOLE_BLOOD',
    isFirstTimeDonor: false, lastDonationDate: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BasicInfo, string>>>({});

  function set<K extends keyof BasicInfo>(key: K, value: BasicInfo[K]) {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'dob') next.age = calcAge(value as string);
      return next;
    });
    setErrors(prev => ({ ...prev, [key]: '' }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof BasicInfo, string>> = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required.';
    if (!form.fatherName.trim()) e.fatherName = "Father's name is required.";
    if (!form.occupation.trim()) e.occupation = 'Occupation is required.';
    if (!form.address.trim()) e.address = 'Address is required.';
    if (!/^\d{10}$/.test(form.mobile)) e.mobile = 'Enter a valid 10-digit mobile number.';
    if (!form.dob) { e.dob = 'Date of birth is required.'; }
    else if (form.age < 18) { e.dob = 'You must be at least 18 years old.'; }
    else if (form.age > 65) { e.dob = 'Maximum eligible age is 65 years.'; }
    if (!form.weightKg || form.weightKg <= 0) e.weightKg = 'Weight is required.';
    else if (form.weightKg < 45) e.weightKg = 'Minimum weight to donate is 45 kg.';
    if (!form.isFirstTimeDonor && !form.lastDonationDate) {
      e.lastDonationDate = 'Please enter your last donation date.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onNext(form);
  }

  const isFemale = form.gender === 'FEMALE';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Personal Details */}
      <div className="section-card">
        <h3 className="section-title">
          <span className="w-7 h-7 bg-srm-100 text-srm-800 rounded-full flex items-center justify-center text-xs font-bold">1</span>
          Personal Details
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <Field label="Full Name *" error={errors.fullName}>
            <input className="form-input" value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="As per Aadhaar / ID proof" />
          </Field>
          <Field label="Father's / Husband's Name *" error={errors.fatherName}>
            <input className="form-input" value={form.fatherName} onChange={e => set('fatherName', e.target.value)} />
          </Field>
          <Field label="Occupation *" error={errors.occupation}>
            <input className="form-input" value={form.occupation} onChange={e => set('occupation', e.target.value)} placeholder="e.g., Engineer, Teacher, Student" />
          </Field>
          <Field label="Address *" error={errors.address}>
            <textarea className="form-input resize-none" rows={2} value={form.address} onChange={e => set('address', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Mobile Number *" error={errors.mobile}>
              <input className="form-input" type="tel" maxLength={10} value={form.mobile} onChange={e => set('mobile', e.target.value.replace(/\D/g, ''))} placeholder="10-digit number" />
            </Field>
            <Field label="Email ID">
              <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="optional" />
            </Field>
          </div>
        </div>
      </div>

      {/* Demographics */}
      <div className="section-card">
        <h3 className="section-title">
          <span className="w-7 h-7 bg-srm-100 text-srm-800 rounded-full flex items-center justify-center text-xs font-bold">2</span>
          Demographics
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <Field label="Gender *">
            <div className="radio-group">
              {(['MALE', 'FEMALE', 'OTHER'] as Gender[]).map(g => (
                <label key={g} className="radio-option">
                  <input type="radio" name="gender" value={g} checked={form.gender === g} onChange={() => set('gender', g)} />
                  <span className="text-sm">{g.charAt(0) + g.slice(1).toLowerCase()}</span>
                </label>
              ))}
            </div>
          </Field>
          <Field label="Marital Status *">
            <div className="radio-group">
              {(['SINGLE', 'MARRIED'] as MaritalStatus[]).map(s => (
                <label key={s} className="radio-option">
                  <input type="radio" name="marital" value={s} checked={form.maritalStatus === s} onChange={() => set('maritalStatus', s)} />
                  <span className="text-sm">{s.charAt(0) + s.slice(1).toLowerCase()}</span>
                </label>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date of Birth *" error={errors.dob}>
              <input className="form-input" type="date" max={maxDOB} min={minDOB} value={form.dob} onChange={e => set('dob', e.target.value)} />
              {form.age > 0 && <p className="text-xs text-gray-500 mt-1">Age: {form.age} years</p>}
            </Field>
            <Field label="Weight (kg) *" error={errors.weightKg}>
              <input className="form-input" type="number" min={40} max={200} step={0.5} value={form.weightKg || ''} onChange={e => set('weightKg', parseFloat(e.target.value) || 0)} placeholder="e.g., 65" />
              {form.weightKg >= 45 && (
                <p className="text-xs text-green-600 mt-1">
                  Eligible volume: <strong>{form.weightKg <= 55 ? '350' : '450'} ml</strong>
                </p>
              )}
            </Field>
          </div>
        </div>
      </div>

      {/* Donation Details */}
      <div className="section-card">
        <h3 className="section-title">
          <span className="w-7 h-7 bg-srm-100 text-srm-800 rounded-full flex items-center justify-center text-xs font-bold">3</span>
          Donation Details
        </h3>
        <div className="space-y-3">
          <Field label="Type of Donation *">
            <div className="radio-group flex-col sm:flex-row">
              {([
                ['WHOLE_BLOOD', 'Whole Blood (Standard)'],
                ['APHERESIS', 'Apheresis (Platelets / Plasma)'],
              ] as [DonationType, string][]).map(([v, lbl]) => (
                <label key={v} className="radio-option">
                  <input type="radio" name="donationType" value={v} checked={form.donationType === v} onChange={() => set('donationType', v)} />
                  <span className="text-sm">{lbl}</span>
                </label>
              ))}
            </div>
            {form.donationType === 'APHERESIS' && (
              <p className="text-xs text-blue-600 mt-1 bg-blue-50 rounded p-2">
                Apheresis: age 18–60, weight ≥ 50 kg, at least 48 hrs since last apheresis.
              </p>
            )}
          </Field>

          <Field label="">
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" className="mt-0.5" checked={form.isFirstTimeDonor} onChange={e => set('isFirstTimeDonor', e.target.checked)} />
              <span className="text-sm text-gray-700">This is my first time donating blood</span>
            </label>
          </Field>

          {!form.isFirstTimeDonor && (
            <Field label="Date of Last Donation *" error={errors.lastDonationDate}>
              <input className="form-input" type="date" max={today} value={form.lastDonationDate} onChange={e => set('lastDonationDate', e.target.value)} />
              {isFemale && (
                <p className="text-xs text-amber-600 mt-1">Female donors must wait at least 120 days between donations.</p>
              )}
            </Field>
          )}
        </div>
      </div>

      <button type="submit" className="btn-primary w-full">
        Continue to Health Questionnaire →
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {label && <label className="form-label">{label}</label>}
      {children}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
