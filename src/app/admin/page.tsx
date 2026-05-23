'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Donor {
  id: string;
  createdAt: string;
  fullName: string;
  mobile: string;
  gender: string;
  age: number;
  weightKg: number;
  donationType: string;
  eligibilityStatus: string;
  deferralReason: string;
  eligibleVolume: number;
  medicalExam?: { id: string; finalStatus: string; haemoglobin: number; bloodUnitNumber: string; volumeCollected: number } | null;
}

interface ExamForm {
  donationDate: string;
  heightCm: string;
  weightKg: string;
  haemoglobin: string;
  temperature: string;
  pulse: string;
  bpSystolic: string;
  bpDiastolic: string;
  finalStatus: string;
  comments: string;
  bloodUnitNumber: string;
  bagSegmentNumber: string;
  volumeCollected: string;
  examinedBy: string;
}

const BLANK_EXAM: ExamForm = {
  donationDate: new Date().toISOString().split('T')[0],
  heightCm: '', weightKg: '', haemoglobin: '', temperature: '37.0',
  pulse: '', bpSystolic: '', bpDiastolic: '',
  finalStatus: 'FIT', comments: '', bloodUnitNumber: '',
  bagSegmentNumber: '', volumeCollected: '', examinedBy: '',
};

type Filter = 'ALL' | 'FIT' | 'TEMP_DEFERRED' | 'PERMANENTLY_REJECTED';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [storedPw, setStoredPw] = useState('');

  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Filter>('ALL');

  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [examForm, setExamForm] = useState<ExamForm>(BLANK_EXAM);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const fetchDonors = useCallback(async (pw: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/donors', { headers: { 'x-admin-password': pw } });
      if (res.ok) setDonors(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthed(true);
      setStoredPw(password);
      setAuthError('');
      fetchDonors(password);
    } else {
      setAuthError('Incorrect password. Please try again.');
    }
  }

  async function handleExamSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDonor) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch('/api/admin/medical-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': storedPw },
        body: JSON.stringify({ donorId: selectedDonor.id, ...examForm,
          heightCm: parseFloat(examForm.heightCm) || 0,
          weightKg: parseFloat(examForm.weightKg) || 0,
          haemoglobin: parseFloat(examForm.haemoglobin) || 0,
          temperature: parseFloat(examForm.temperature) || 37.0,
          pulse: parseInt(examForm.pulse) || 0,
          bpSystolic: parseInt(examForm.bpSystolic) || 0,
          bpDiastolic: parseInt(examForm.bpDiastolic) || 0,
          volumeCollected: parseInt(examForm.volumeCollected) || 0,
        }),
      });
      if (res.ok) {
        setSaveMsg('✅ Medical exam saved successfully.');
        fetchDonors(storedPw);
      } else {
        setSaveMsg('❌ Failed to save. Please try again.');
      }
    } catch {
      setSaveMsg('❌ Network error. Please try again.');
    }
    setSaving(false);
  }

  function openExam(donor: Donor) {
    setSelectedDonor(donor);
    setSaveMsg('');
    setExamForm({
      ...BLANK_EXAM,
      weightKg: String(donor.weightKg),
      volumeCollected: String(donor.eligibleVolume),
    });
    window.scrollTo(0, 0);
  }

  function exportCSV() {
    const headers = ['ID', 'Name', 'Mobile', 'Gender', 'Age', 'Weight', 'Type', 'Eligibility', 'Registered', 'Exam Status', 'Hb', 'Blood Unit'];
    const rows = donors.map(d => [
      d.id.slice(-8), d.fullName, d.mobile, d.gender, d.age, d.weightKg,
      d.donationType, d.eligibilityStatus,
      new Date(d.createdAt).toLocaleDateString('en-IN'),
      d.medicalExam?.finalStatus ?? 'Pending',
      d.medicalExam?.haemoglobin ?? '',
      d.medicalExam?.bloodUnitNumber ?? '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `donors_${new Date().toISOString().split('T')[0]}.csv`; a.click();
  }

  const filtered = donors.filter(d => filter === 'ALL' || d.eligibilityStatus === filter);

  if (!authed) {
    return (
      <main className="min-h-screen bg-srm-900 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🏥</div>
            <h1 className="text-xl font-bold text-srm-900">Staff Portal</h1>
            <p className="text-xs text-gray-500 mt-1">SRM MCH & RC — Blood Donation Camp</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="form-label">Admin Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter staff password"
                autoFocus
              />
            </div>
            {authError && <p className="text-red-600 text-xs">{authError}</p>}
            <button type="submit" className="btn-primary w-full">Login →</button>
          </form>
          <Link href="/" className="block text-center text-xs text-gray-400 mt-4 hover:text-srm-700">
            ← Back to Registration
          </Link>
        </div>
      </main>
    );
  }

  if (selectedDonor) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="bg-srm-900 text-white px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-xs text-srm-300">Medical Examination Form</p>
              <p className="text-sm font-bold">{selectedDonor.fullName}</p>
            </div>
            <button onClick={() => setSelectedDonor(null)} className="text-srm-300 hover:text-white text-xs">
              ← All Donors
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Donor info */}
          <div className="section-card mb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              {[
                ['Name', selectedDonor.fullName], ['Mobile', selectedDonor.mobile],
                ['Gender', selectedDonor.gender], ['Age', `${selectedDonor.age} yrs`],
                ['Weight', `${selectedDonor.weightKg} kg`], ['Type', selectedDonor.donationType],
                ['Eligibility', selectedDonor.eligibilityStatus], ['Eligible Vol.', `${selectedDonor.eligibleVolume} ml`],
              ].map(([l, v]) => (
                <div key={l}>
                  <p className="text-xs text-gray-500">{l}</p>
                  <p className={`font-semibold ${v === 'FIT' ? 'text-green-600' : v === 'TEMP_DEFERRED' ? 'text-amber-600' : v === 'PERMANENTLY_REJECTED' ? 'text-red-600' : 'text-gray-800'}`}>{v}</p>
                </div>
              ))}
            </div>
            {selectedDonor.deferralReason && (
              <p className="text-xs text-amber-700 bg-amber-50 rounded p-2 mt-3">{selectedDonor.deferralReason}</p>
            )}
          </div>

          {/* Exam Form */}
          <form onSubmit={handleExamSubmit} className="space-y-4">
            <div className="section-card">
              <h3 className="section-title"><span>🩺</span> Physical Examination</h3>
              <div className="grid grid-cols-2 gap-3">
                <ExField label="Date of Donation" type="date" val={examForm.donationDate} onChange={v => setExamForm(p => ({ ...p, donationDate: v }))} />
                <ExField label="Examined By" val={examForm.examinedBy} onChange={v => setExamForm(p => ({ ...p, examinedBy: v }))} placeholder="Dr. / Staff Name" />
                <ExField label="Height (cm)" type="number" val={examForm.heightCm} onChange={v => setExamForm(p => ({ ...p, heightCm: v }))} placeholder="e.g., 170" />
                <ExField label="Weight (kg)" type="number" val={examForm.weightKg} onChange={v => setExamForm(p => ({ ...p, weightKg: v }))} />
                <ExField label="Haemoglobin (g/dL) *" type="number" step="0.1" val={examForm.haemoglobin} onChange={v => setExamForm(p => ({ ...p, haemoglobin: v }))} placeholder="≥12.5 required" required />
                <ExField label="Temperature (°C)" type="number" step="0.1" val={examForm.temperature} onChange={v => setExamForm(p => ({ ...p, temperature: v }))} placeholder="~37.0" />
                <ExField label="Pulse (bpm)" type="number" val={examForm.pulse} onChange={v => setExamForm(p => ({ ...p, pulse: v }))} placeholder="60–100 Regular" />
                <div>
                  <label className="form-label">Blood Pressure (mmHg)</label>
                  <div className="flex gap-2">
                    <input className="form-input" type="number" value={examForm.bpSystolic} onChange={e => setExamForm(p => ({ ...p, bpSystolic: e.target.value }))} placeholder="Systolic" />
                    <span className="self-center text-gray-400">/</span>
                    <input className="form-input" type="number" value={examForm.bpDiastolic} onChange={e => setExamForm(p => ({ ...p, bpDiastolic: e.target.value }))} placeholder="Diastolic" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Normal: 100–140 / 60–90 mmHg</p>
                </div>
              </div>
            </div>

            <div className="section-card">
              <h3 className="section-title"><span>🩸</span> Donation Logistics</h3>
              <div className="grid grid-cols-2 gap-3">
                <ExField label="Blood Unit Number" val={examForm.bloodUnitNumber} onChange={v => setExamForm(p => ({ ...p, bloodUnitNumber: v }))} placeholder="Unit barcode/ID" />
                <ExField label="Bag Segment Number" val={examForm.bagSegmentNumber} onChange={v => setExamForm(p => ({ ...p, bagSegmentNumber: v }))} />
                <div>
                  <label className="form-label">Volume Collected (ml)</label>
                  <select className="form-input" value={examForm.volumeCollected} onChange={e => setExamForm(p => ({ ...p, volumeCollected: e.target.value }))}>
                    <option value="">— Select —</option>
                    <option value="350">350 ml</option>
                    <option value="450">450 ml</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="section-card">
              <h3 className="section-title"><span>📝</span> Final Assessment</h3>
              <div>
                <label className="form-label">Final Outcome *</label>
                <select
                  className="form-input font-semibold"
                  value={examForm.finalStatus}
                  onChange={e => setExamForm(p => ({ ...p, finalStatus: e.target.value }))}
                  required
                >
                  <option value="FIT">✅ FIT — Donation Accepted</option>
                  <option value="DEFERRAL">⏳ DEFERRAL — Temporarily Deferred</option>
                  <option value="REJECT">❌ REJECT — Permanently Rejected</option>
                </select>
              </div>
              <div className="mt-3">
                <label className="form-label">Comments / Notes</label>
                <textarea className="form-input resize-none" rows={3} value={examForm.comments} onChange={e => setExamForm(p => ({ ...p, comments: e.target.value }))} placeholder="Any observations, instructions, or notes…" />
              </div>
            </div>

            {saveMsg && (
              <div className={`rounded-lg p-3 text-sm ${saveMsg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {saveMsg}
              </div>
            )}

            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving…' : 'Save Medical Examination'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-srm-900 text-white px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-srm-300">SRM MCH & RC — Blood Donation Camp</p>
            <p className="text-sm font-bold">Staff Portal — Donor Dashboard</p>
          </div>
          <div className="flex gap-3 items-center">
            <button onClick={exportCSV} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
              Export CSV
            </button>
            <button onClick={() => fetchDonors(storedPw)} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
              Refresh
            </button>
            <button onClick={() => setAuthed(false)} className="text-srm-300 hover:text-white text-xs">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {([
            ['Total', donors.length, 'bg-blue-50 text-blue-700', 'ALL'],
            ['Fit', donors.filter(d => d.eligibilityStatus === 'FIT').length, 'bg-green-50 text-green-700', 'FIT'],
            ['Deferred', donors.filter(d => d.eligibilityStatus === 'TEMP_DEFERRED').length, 'bg-amber-50 text-amber-700', 'TEMP_DEFERRED'],
            ['Rejected', donors.filter(d => d.eligibilityStatus === 'PERMANENTLY_REJECTED').length, 'bg-red-50 text-red-700', 'PERMANENTLY_REJECTED'],
          ] as [string, number, string, Filter][]).map(([label, count, cls, f]) => (
            <button
              key={label}
              onClick={() => setFilter(f)}
              className={`rounded-xl p-4 text-left transition-all ${cls} ${filter === f ? 'ring-2 ring-offset-1 ring-current' : ''}`}
            >
              <p className="text-2xl font-black">{count}</p>
              <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
            </button>
          ))}
        </div>

        {/* Donor list */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading donors…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No donors registered yet.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(d => (
              <div key={d.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                <div className={`w-2 h-12 rounded-full flex-shrink-0 ${d.eligibilityStatus === 'FIT' ? 'bg-green-400' : d.eligibilityStatus === 'TEMP_DEFERRED' ? 'bg-amber-400' : 'bg-red-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900 truncate">{d.fullName}</p>
                      <p className="text-xs text-gray-500">{d.mobile} &bull; {d.gender} &bull; {d.age} yrs &bull; {d.weightKg} kg</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      d.eligibilityStatus === 'FIT' ? 'bg-green-100 text-green-700' : d.eligibilityStatus === 'TEMP_DEFERRED' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {d.eligibilityStatus === 'FIT' ? 'FIT' : d.eligibilityStatus === 'TEMP_DEFERRED' ? 'DEFERRED' : 'REJECTED'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-400">{new Date(d.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    {d.medicalExam ? (
                      <span className={`text-xs px-2 py-0.5 rounded ${d.medicalExam.finalStatus === 'FIT' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        Exam: {d.medicalExam.finalStatus} {d.medicalExam.bloodUnitNumber && `| Unit: ${d.medicalExam.bloodUnitNumber}`}
                      </span>
                    ) : (
                      d.eligibilityStatus === 'FIT' && (
                        <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded">Exam Pending</span>
                      )
                    )}
                  </div>
                </div>
                {d.eligibilityStatus === 'FIT' && (
                  <button onClick={() => openExam(d)} className="btn-primary text-xs px-3 py-2 flex-shrink-0">
                    {d.medicalExam ? 'Edit Exam' : 'Medical Exam'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function ExField({
  label, type = 'text', val, onChange, placeholder, required, step,
}: {
  label: string; type?: string; val: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; step?: string;
}) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <input className="form-input" type={type} step={step} value={val} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} />
    </div>
  );
}
