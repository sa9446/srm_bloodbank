import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function checkAuth(req: Request): boolean {
  const pw = req.headers.get('x-admin-password');
  return pw === (process.env.ADMIN_PASSWORD ?? 'srm@blood2024');
}

export async function GET(req: Request) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const donors = await prisma.donor.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      fullName: true,
      mobile: true,
      gender: true,
      age: true,
      weightKg: true,
      donationType: true,
      eligibilityStatus: true,
      deferralReason: true,
      eligibleReturnDate: true,
      eligibleVolume: true,
      medicalExam: {
        select: {
          id: true,
          finalStatus: true,
          haemoglobin: true,
          bloodUnitNumber: true,
          volumeCollected: true,
        },
      },
    },
  });

  return NextResponse.json(donors);
}
