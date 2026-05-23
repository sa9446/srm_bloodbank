'use client';

const STEPS = [
  { label: 'Registration', icon: '👤' },
  { label: 'Questionnaire', icon: '📋' },
  { label: 'Consent', icon: '✍️' },
  { label: 'Result', icon: '✅' },
];

export default function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-between w-full mb-6 px-1">
      {STEPS.map((step, idx) => {
        const num = idx + 1;
        const done = num < current;
        const active = num === current;
        return (
          <div key={step.label} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${done ? 'bg-green-500 text-white' : active ? 'bg-srm-800 text-white ring-4 ring-srm-200' : 'bg-gray-200 text-gray-500'}`}
              >
                {done ? '✓' : step.icon}
              </div>
              <span
                className={`text-xs mt-1 font-medium whitespace-nowrap
                  ${active ? 'text-srm-800' : done ? 'text-green-600' : 'text-gray-400'}`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-4 transition-colors
                  ${done ? 'bg-green-400' : 'bg-gray-200'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
