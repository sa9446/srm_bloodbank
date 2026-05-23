import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function checkAuth(req: Request): boolean {
  const pw = req.headers.get('x-admin-password');
  return pw === (process.env.ADMIN_PASSWORD ?? 'srm@blood2024');
}

export async function POST(req: Request) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    donorId, donationDate, heightCm, weightKg, haemoglobin,
    temperature, pulse, bpSystolic, bpDiastolic,
    finalStatus, comments, bloodUnitNumber, bagSegmentNumber,
    volumeCollected, examinedBy,
  } = body;

  if (!donorId || !finalStatus) {
    return NextResponse.json({ error: 'donorId and finalStatus are required.' }, { status: 400 });
  }

  const exam = await prisma.medicalExam.upsert({
    where: { donorId },
    create: {
      donorId, donationDate: donationDate ?? new Date().toISOString().split('T')[0],
      heightCm: heightCm ?? 0, weightKg: weightKg ?? 0,
      haemoglobin: haemoglobin ?? 0, temperature: temperature ?? 37.0,
      pulse: pulse ?? 72, bpSystolic: bpSystolic ?? 120, bpDiastolic: bpDiastolic ?? 80,
      finalStatus, comments: comments ?? '', bloodUnitNumber: bloodUnitNumber ?? '',
      bagSegmentNumber: bagSegmentNumber ?? '', volumeCollected: volumeCollected ?? 0,
      examinedBy: examinedBy ?? '',
    },
    update: {
      donationDate: donationDate ?? new Date().toISOString().split('T')[0],
      heightCm: heightCm ?? 0, weightKg: weightKg ?? 0,
      haemoglobin: haemoglobin ?? 0, temperature: temperature ?? 37.0,
      pulse: pulse ?? 72, bpSystolic: bpSystolic ?? 120, bpDiastolic: bpDiastolic ?? 80,
      finalStatus, comments: comments ?? '', bloodUnitNumber: bloodUnitNumber ?? '',
      bagSegmentNumber: bagSegmentNumber ?? '', volumeCollected: volumeCollected ?? 0,
      examinedBy: examinedBy ?? '',
    },
  });

  return NextResponse.json(exam, { status: 201 });
}
