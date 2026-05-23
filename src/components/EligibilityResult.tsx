'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { EligibilityResult, BasicInfo } from '@/types/donor';
import { formatDisplayDate } from '@/lib/eligibility';

interface Props {
  result: EligibilityResult;
  donor: BasicInfo;
  donorId?: string;
}

export default function EligibilityResultCard({ result, donor, donorId }: Props) {
  const { status, reason, eligibleReturnDate, eligibleVolume } = result;

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      <div className={`rounded-xl p-5 text-center ${
        status === 'FIT'
          ? 'bg-green-50 border-2 border-green-400'
          : status === 'TEMP_DEFERRED'
          ? 'bg-amber-50 border-2 border-amber-400'
          : 'bg-red-50 border-2 border-red-400'
      }`}>
        <div className="text-4xl mb-2">
          {status === 'FIT' ? '✅' : status === 'TEMP_DEFERRED' ? '⏳' : '❌'}
        </div>
        <h2 className={`text-xl font-black mb-1 ${
          status === 'FIT' ? 'text-green-700' : status === 'TEMP_DEFERRED' ? 'text-amber-700' : 'text-red-700'
        }`}>
          {status === 'FIT'
            ? 'You are Eligible to Donate!'
            : status === 'TEMP_DEFERRED'
            ? 'Temporarily Deferred'
            : 'Not Eligible to Donate'}
        </h2>
        <p className={`text-sm font-medium ${
          status === 'FIT' ? 'text-green-600' : status === 'TEMP_DEFERRED' ? 'text-amber-600' : 'text-red-600'
        }`}>
          {status === 'FIT'
            ? 'Please proceed to the registration desk with your ID proof.'
            : status === 'TEMP_DEFERRED'
            ? 'You may donate after the deferral period ends.'
            : 'Based on your responses, you are permanently deferred from blood donation.'}
        </p>
      </div>

      {/* Donor Summary */}
      <div className="section-card">
        <h3 className="section-title">
          <span>📋</span> Registration Summary
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <SummaryRow label="Name" value={donor.fullName} />
          <SummaryRow label="Mobile" value={donor.mobile} />
          <SummaryRow label="Age / Gender" value={`${donor.age} yrs / ${donor.gender}`} />
          <SummaryRow label="Weight" value={`${donor.weightKg} kg`} />
          <SummaryRow label="Donation Type" value={donor.donationType === 'WHOLE_BLOOD' ? 'Whole Blood' : 'Apheresis'} />
          {status === 'FIT' && eligibleVolume && (
            <SummaryRow label="Eligible Volume" value={`${eligibleVolume} ml`} />
          )}
          {donorId && <SummaryRow label="Donor ID" value={donorId.slice(-8).toUpperCase()} />}
        </div>
      </div>

      {/* Reason / Instructions */}
      {reason && (
        <div className={`section-card border-l-4 ${
          status === 'TEMP_DEFERRED' ? 'border-amber-400' : 'border-red-400'
        }`}>
          <h3 className="section-title">
            <span>ℹ️</span> Reason for Deferral
          </h3>
          <p className="text-sm text-gray-700">{reason}</p>
          {eligibleReturnDate && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm font-semibold text-green-700">
                ✅ Eligible to donate from:{' '}
                <span className="text-lg">{formatDisplayDate(eligibleReturnDate)}</span>
              </p>
              <p className="text-xs text-green-600 mt-1">
                Please mark this date and return to our blood bank to donate.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Next Steps */}
      <div className="section-card">
        <h3 className="section-title"><span>📌</span> Next Steps</h3>
        {status === 'FIT' ? (
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex gap-2"><span className="text-green-500 font-bold">1.</span> Show this confirmation or your Donor ID at the registration desk.</li>
            <li className="flex gap-2"><span className="text-green-500 font-bold">2.</span> A medical officer will perform a quick physical check (haemoglobin, BP, pulse).</li>
            <li className="flex gap-2"><span className="text-green-500 font-bold">3.</span> Donation will take about 10–15 minutes. Rest afterwards and enjoy refreshments.</li>
            <li className="flex gap-2"><span className="text-green-500 font-bold">4.</span> Results of TTI screening will be sent to you as per your preference.</li>
          </ul>
        ) : status === 'TEMP_DEFERRED' ? (
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex gap-2"><span className="text-amber-500">•</span> Your deferral is temporary. You will be eligible to donate on the date shown above.</li>
            <li className="flex gap-2"><span className="text-amber-500">•</span> Thank you for your willingness to donate. Please return after the deferral period.</li>
            <li className="flex gap-2"><span className="text-amber-500">•</span> For any queries, contact our Blood Centre: Dept. of Transfusion Medicine, SRM MCH & RC.</li>
          </ul>
        ) : (
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex gap-2"><span className="text-red-500">•</span> We appreciate your willingness to donate, but cannot accept your donation at this time.</li>
            <li className="flex gap-2"><span className="text-red-500">•</span> Your safety and that of the recipient are our top priority.</li>
            <li className="flex gap-2"><span className="text-red-500">•</span> For further guidance, please speak with our medical officer at the camp.</li>
          </ul>
        )}
      </div>

      {/* Personal QR Code */}
      {donorId && !donorId.startsWith('LOCAL-') && (
        <div className="section-card text-center">
          <h3 className="section-title justify-center">
            <span>📱</span> Your Registration QR Code
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            Show this to the camp staff — they can scan it to instantly pull up your record.
          </p>
          <div className="inline-block border-4 border-srm-800 rounded-xl p-2 bg-white">
            <Image
              src={`/api/qr/${donorId}`}
              alt="Your donor QR code"
              width={200}
              height={200}
              unoptimized
              className="rounded-lg"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Donor ID: <span className="font-mono font-semibold">{donorId.slice(-10).toUpperCase()}</span>
          </p>
          <a
            href={`/api/qr/${donorId}`}
            download={`donor-qr-${donorId.slice(-8)}.png`}
            className="inline-block mt-3 text-xs text-srm-700 underline"
          >
            Download QR as PNG
          </a>
        </div>
      )}

      {/* Contact */}
      <div className="bg-srm-900 rounded-xl p-4 text-white text-center">
        <p className="font-semibold text-sm">SRM Medical College Hospital & Research Centre</p>
        <p className="text-srm-300 text-xs mt-1">
          Department of Transfusion Medicine & Blood Centre<br />
          SRM Nagar, Potheri, Kattankulathur‑601203, Tamil Nadu
        </p>
      </div>

      <Link href="/" className="btn-secondary w-full text-center block">
        ← Back to Home
      </Link>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-800 truncate">{value}</p>
    </div>
  );
}
