import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(
  req: Request,
  { params }: { params: { donorId: string } }
) {
  const origin = new URL(req.url).origin;
  const donorUrl = `${origin}/donor/${params.donorId}`;

  const buffer = await QRCode.toBuffer(donorUrl, {
    width: 300,
    margin: 2,
    color: { dark: '#881337', light: '#FFFFFF' },
    errorCorrectionLevel: 'H',
  });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
