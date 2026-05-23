import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatDisplayDate } from '@/lib/eligibility';
import Image from 'next/image';

export default async function DonorCardPage({ params }: { params: { id: string } }) {
  const donor = await prisma.donor.findUnique({
    where: { id: params.id },
    include: { medicalExam: true },
  }).catch(() => null);

  if (!donor) notFound();

  const status = donor.eligibilityStatus as 'FIT' | 'TEMP_DEFERRED' | 'PERMANENTLY_REJECTED';

  const statusStyle = {
    FIT: { bg: 'bg-green-50 border-green-400', badge: 'bg-green-500 text-white', label: 'FIT TO DONATE', icon: '✅' },
    TEMP_DEFERRED: { bg: 'bg-amber-50 border-amber-400', badge: 'bg-amber-500 text-white', label: 'TEMPORARILY DEFERRED', icon: '⏳' },
    PERMANENTLY_REJECTED: { bg: 'bg-red-50 border-red-400', badge: 'bg-red-600 text-white', label: 'NOT ELIGIBLE', icon: '❌' },
  }[status];

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-start px-4 py-8">
      {/* Hospital header */}
      <div className="w-full max-w-sm bg-srm-900 text-white rounded-t-2xl px-5 py-4 text-center">
        <p className="text-xs text-srm-300 font-medium">SRM Medical College Hospital & Research Centre</p>
        <p className="text-xs text-srm-400">Dept. of Transfusion Medicine & Blood Centre</p>
      </div>

      {/* Donor card */}
      <div className="w-full max-w-sm bg-white rounded-b-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Status banner */}
        <div className={`border-2 m-4 rounded-xl p-4 text-center ${statusStyle.bg}`}>
          <div className="text-3xl mb-1">{statusStyle.icon}</div>
          <span className={`inline-block text-xs font-black px-3 py-1 rounded-full ${statusStyle.badge}`}>
            {statusStyle.label}
          </span>
          {status === 'FIT' && (
            <p className="text-green-700 text-xs mt-2 font-semibold">
              Eligible volume: <strong>{donor.eligibleVolume} ml</strong>
            </p>
          )}
        </div>

        {/* Donor details */}
        <div className="px-5 pb-4 space-y-3">
          <DRow label="Full Name" value={donor.fullName} bold />
          <DRow label="Donor ID" value={donor.id.slice(-10).toUpperCase()} mono />
          <div className="grid grid-cols-2 gap-3">
            <DRow label="Gender" value={donor.gender} />
            <DRow label="Age" value={`${donor.age} yrs`} />
            <DRow label="Weight" value={`${donor.weightKg} kg`} />
            <DRow label="Type" value={donor.donationType === 'WHOLE_BLOOD' ? 'Whole Blood' : 'Apheresis'} />
          </div>
          <DRow label="Mobile" value={donor.mobile} />
          <DRow label="Registered" value={new Date(donor.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} />

          {/* Deferral info */}
          {donor.deferralReason && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              <p className="font-semibold mb-1">Deferral Reason</p>
              <p>{donor.deferralReason}</p>
              {donor.eligibleReturnDate && (
                <p className="mt-2 font-bold text-green-700">
                  Eligible from: {formatDisplayDate(donor.eligibleReturnDate)}
                </p>
              )}
            </div>
          )}

          {/* Medical exam result */}
          {donor.medicalExam && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
              <p className="font-semibold mb-2">Medical Examination</p>
              <div className="grid grid-cols-2 gap-1.5">
                <MRow label="Hb" value={`${donor.medicalExam.haemoglobin} g/dL`} />
                <MRow label="Temp" value={`${donor.medicalExam.temperature}°C`} />
                <MRow label="Pulse" value={`${donor.medicalExam.pulse} bpm`} />
                <MRow label="BP" value={`${donor.medicalExam.bpSystolic}/${donor.medicalExam.bpDiastolic}`} />
                {donor.medicalExam.bloodUnitNumber && <MRow label="Unit No." value={donor.medicalExam.bloodUnitNumber} />}
                {donor.medicalExam.volumeCollected > 0 && <MRow label="Collected" value={`${donor.medicalExam.volumeCollected} ml`} />}
              </div>
              <p className={`mt-2 font-black text-sm ${donor.medicalExam.finalStatus === 'FIT' ? 'text-green-700' : 'text-red-700'}`}>
                Final: {donor.medicalExam.finalStatus}
              </p>
            </div>
          )}
        </div>

        {/* QR code (for printing / re-scanning) */}
        <div className="border-t border-gray-100 p-4 flex flex-col items-center">
          <Image
            src={`/api/qr/${donor.id}`}
            alt="Donor QR"
            width={120}
            height={120}
            className="rounded-lg"
            unoptimized
          />
          <p className="text-xs text-gray-400 mt-2 text-center">
            Scan to view this donor card
          </p>
        </div>
      </div>
    </main>
  );
}

function DRow({ label, value, bold, mono }: { label: string; value: string; bold?: boolean; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-sm text-gray-800 ${bold ? 'font-bold' : 'font-medium'} ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

function MRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-blue-500 font-semibold">{label}: </span>
      <span>{value}</span>
    </div>
  );
}
