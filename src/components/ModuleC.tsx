'use client';

import { useState } from 'react';
import type { ConsentData } from '@/types/donor';

interface Props {
  donorName: string;
  onNext: (data: ConsentData) => void;
  onBack: () => void;
}

const DECLARATION = `I, the undersigned, voluntarily donate my blood for therapeutic purposes.
I declare that all information provided in this form is true and correct to the best of my knowledge.
I understand that if found to be untrue, I will be held responsible for any consequences.

I consent to my blood being tested for HIV, Hepatitis B, Hepatitis C, Syphilis, Malaria, and other
transfusion-transmissible infections (TTIs) as per the Drugs and Cosmetics Act and Rules, 1945.

I have been counselled about HIV/AIDS and understand the modes of transmission. I affirm that I am
not at high risk for HIV/AIDS or other TTIs. I understand that my blood will be discarded if found
reactive on TTI testing.

I give consent for the use of my blood and blood components for transfusion to needy patients,
and also for testing purposes as required under law.`;

export default function ModuleC({ donorName, onNext, onBack }: Props) {
  const [wantTestResults, setWantTestResults] = useState(true);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [signedName, setSignedName] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!declarationAccepted) {
      setError('You must accept the declaration to proceed.');
      return;
    }
    if (!signedName.trim()) {
      setError('Please enter your full name as your digital signature.');
      return;
    }
    if (signedName.trim().toLowerCase() !== donorName.trim().toLowerCase()) {
      setError(`Name must match your registered name: "${donorName}"`);
      return;
    }
    setError('');
    onNext({
      wantTestResults,
      declarationAccepted,
      signedName: signedName.trim(),
      consentTimestamp: new Date().toISOString(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Declaration */}
      <div className="section-card">
        <h3 className="section-title">
          <span className="w-7 h-7 bg-srm-100 text-srm-800 rounded-full flex items-center justify-center text-xs font-bold">1</span>
          Declaration of the Donor
        </h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-700 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto">
          {DECLARATION}
        </div>
        <label className="flex items-start gap-3 mt-4 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 w-4 h-4 accent-srm-800"
            checked={declarationAccepted}
            onChange={e => setDeclarationAccepted(e.target.checked)}
          />
          <span className="text-sm text-gray-700">
            I have read, understood, and agree to the declaration above. I voluntarily consent to
            donate blood and to TTI testing of my blood sample.
          </span>
        </label>
      </div>

      {/* HIV / Test Results Consent */}
      <div className="section-card">
        <h3 className="section-title">
          <span className="w-7 h-7 bg-srm-100 text-srm-800 rounded-full flex items-center justify-center text-xs font-bold">2</span>
          Informed Consent for HIV & TTI Testing
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Your blood sample will be screened for HIV, Hepatitis B, Hepatitis C, Syphilis, and
          Malaria as per mandatory guidelines. Test results are kept confidential.
        </p>
        <div>
          <p className="form-label">Do you wish to be informed of your test results?</p>
          <div className="radio-group mt-2">
            <label className="radio-option">
              <input type="radio" name="testResults" checked={wantTestResults} onChange={() => setWantTestResults(true)} />
              <span className="text-sm font-medium text-green-700">Yes — Please inform me</span>
            </label>
            <label className="radio-option">
              <input type="radio" name="testResults" checked={!wantTestResults} onChange={() => setWantTestResults(false)} />
              <span className="text-sm font-medium text-gray-600">No — I prefer not to be informed</span>
            </label>
          </div>
          {wantTestResults && (
            <p className="text-xs text-blue-600 mt-2 bg-blue-50 rounded p-2">
              Results will be communicated to you confidentially. Any reactive result will trigger
              post-test counselling by our team.
            </p>
          )}
        </div>
      </div>

      {/* Digital Signature */}
      <div className="section-card">
        <h3 className="section-title">
          <span className="w-7 h-7 bg-srm-100 text-srm-800 rounded-full flex items-center justify-center text-xs font-bold">3</span>
          Digital Signature
        </h3>
        <p className="text-xs text-gray-500 mb-3">
          Type your full name exactly as registered to electronically sign this consent. This
          constitutes your legal signature under the Information Technology Act, 2000.
        </p>
        <div>
          <label className="form-label">
            Full Name (as electronic signature) *
          </label>
          <input
            className="form-input font-medium"
            value={signedName}
            onChange={e => setSignedName(e.target.value)}
            placeholder={`Type "${donorName}" to sign`}
          />
          <p className="text-xs text-gray-400 mt-1">Registered name: <strong>{donorName}</strong></p>
        </div>
        <div className="mt-3 bg-srm-50 border border-srm-200 rounded-lg p-3 text-xs text-srm-800">
          <strong>Timestamp:</strong> {new Date().toLocaleString('en-IN', {
            dateStyle: 'long',
            timeStyle: 'medium',
          })}
        </div>
        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-secondary flex-1">
          ← Back
        </button>
        <button type="submit" className="btn-primary flex-1">
          Submit Registration →
        </button>
      </div>
    </form>
  );
}
