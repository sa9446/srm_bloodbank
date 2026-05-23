import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-srm-900 to-srm-700 flex flex-col items-center justify-start px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-lg text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-4">
          <span className="text-4xl">🩸</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white leading-tight">
          SRM Medical College Hospital<br />& Research Centre
        </h1>
        <p className="text-srm-200 text-sm mt-1 font-medium">
          Department of Transfusion Medicine & Blood Centre
        </p>
        <p className="text-srm-300 text-xs mt-1">
          SRM Nagar, Potheri, Kattankulathur‑601203<br />
          Chengalpattu District, Tamil Nadu, India
        </p>
        <p className="text-srm-400 text-xs mt-1">
          Lic. No. 416/280 &nbsp;|&nbsp; Doc Ref: SRM MOH & RO/BC‑01/019/VER 1.0‑OCT‑2023
        </p>
      </div>

      {/* Camp Banner */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
        <div className="bg-srm-800 px-6 py-4 text-white text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-srm-200 mb-1">
            You Are Invited To
          </p>
          <h2 className="text-2xl font-black">BLOOD DONATION CAMP</h2>
          <p className="text-srm-200 text-sm mt-1">Register Online — Fast &amp; Paperless</p>
        </div>

        <div className="p-6 space-y-4">
          <InfoRow icon="📋" label="What to expect">
            A quick eligibility screening followed by a health check by our medical officers.
          </InfoRow>
          <InfoRow icon="⏱️" label="Time needed">
            Approximately 30–45 minutes including rest after donation.
          </InfoRow>
          <InfoRow icon="✅" label="Requirements">
            Age 18–65 &bull; Weight ≥ 45 kg &bull; Feeling healthy &bull; Eaten within 4 hrs
          </InfoRow>
          <InfoRow icon="🏥" label="Blood types accepted">
            All ABO &amp; Rh groups. Whole Blood &amp; Apheresis (Platelets/Plasma).
          </InfoRow>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-3">
          <Link href="/register" className="btn-primary text-center block rounded-xl py-4 text-lg">
            Register to Donate
          </Link>
          <Link
            href="/admin"
            className="text-center text-xs text-gray-400 hover:text-srm-700 transition-colors"
          >
            Medical Staff Portal →
          </Link>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-srm-400 text-xs text-center max-w-xs">
        Your data is stored securely and used only for this donation camp in compliance with
        Indian blood transfusion guidelines (Gazette of India).
      </p>
    </main>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="text-2xl leading-none mt-0.5">{icon}</span>
      <div>
        <p className="text-xs font-semibold text-srm-800 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-600 mt-0.5">{children}</p>
      </div>
    </div>
  );
}
