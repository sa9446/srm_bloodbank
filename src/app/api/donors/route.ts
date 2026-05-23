import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { BasicInfo, ScreeningAnswers, ConsentData, EligibilityResult } from '@/types/donor';

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      basicInfo: BasicInfo;
      screeningAnswers: ScreeningAnswers;
      consentData: ConsentData;
      eligibilityResult: EligibilityResult;
    };

    const { basicInfo: b, screeningAnswers: s, consentData: c, eligibilityResult: r } = body;

    const donor = await prisma.donor.create({
      data: {
        fullName: b.fullName,
        fatherName: b.fatherName,
        occupation: b.occupation,
        address: b.address,
        mobile: b.mobile,
        email: b.email,
        gender: b.gender,
        maritalStatus: b.maritalStatus,
        dob: b.dob,
        age: b.age,
        weightKg: b.weightKg,
        donationType: b.donationType,
        isFirstTimeDonor: b.isFirstTimeDonor,
        lastDonationDate: b.lastDonationDate,
        eligibleVolume: r.eligibleVolume ?? 0,
        screeningAnswers: JSON.stringify(s),
        eligibilityStatus: r.status,
        deferralReason: r.reason ?? '',
        eligibleReturnDate: r.eligibleReturnDate ?? '',
        wantTestResults: c.wantTestResults,
        declarationAccepted: c.declarationAccepted,
        signedName: c.signedName,
        consentTimestamp: c.consentTimestamp,
      },
    });

    return NextResponse.json({ id: donor.id }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/donors]', err);
    return NextResponse.json({ error: 'Failed to save donor.' }, { status: 500 });
  }
}
