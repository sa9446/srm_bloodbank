#!/usr/bin/env node

const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const url = process.argv[2] || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const outputDir = path.join(__dirname, '..', 'public');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const opts = {
  width: 400,
  margin: 2,
  color: { dark: '#881337', light: '#FFFFFF' },
  errorCorrectionLevel: 'H',
};

// Generate PNG
QRCode.toFile(path.join(outputDir, 'registration-qr.png'), url, opts, err => {
  if (err) { console.error('Error generating PNG:', err); process.exit(1); }
  console.log('✅  QR code PNG  →  public/registration-qr.png');
});

// Generate standalone HTML page for printing
QRCode.toDataURL(url, opts)
  .then(dataUrl => {
    const stamp = new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Blood Donation Camp — Registration QR Code</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Arial', sans-serif; background: #fff5f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: white; border-radius: 16px; box-shadow: 0 4px 24px rgba(136,19,55,.15); padding: 40px 32px; max-width: 480px; width: 90%; text-align: center; border-top: 6px solid #881337; }
    .logo { font-size: 48px; margin-bottom: 12px; }
    h1 { color: #881337; font-size: 20px; font-weight: 900; line-height: 1.3; margin-bottom: 4px; }
    h2 { color: #333; font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    .dept { color: #666; font-size: 12px; margin-bottom: 24px; }
    .qr-wrap { background: #fff; border-radius: 12px; border: 3px solid #881337; display: inline-block; padding: 12px; margin-bottom: 20px; }
    img { display: block; }
    .cta { font-size: 15px; font-weight: 700; color: #881337; margin-bottom: 8px; }
    .url { font-family: monospace; font-size: 12px; background: #f0f0f0; padding: 6px 12px; border-radius: 6px; word-break: break-all; color: #555; margin-bottom: 20px; }
    .steps { text-align: left; background: #fff8f8; border-radius: 10px; padding: 16px; margin-bottom: 20px; }
    .steps p { font-size: 12px; color: #555; margin: 4px 0; }
    .step-num { display: inline-block; width: 20px; height: 20px; background: #881337; color: white; border-radius: 50%; font-size: 11px; font-weight: bold; text-align: center; line-height: 20px; margin-right: 6px; }
    footer { font-size: 10px; color: #aaa; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🩸</div>
    <h1>SRM Medical College Hospital<br>&amp; Research Centre</h1>
    <h2>Department of Transfusion Medicine &amp; Blood Centre</h2>
    <p class="dept">SRM Nagar, Potheri, Kattankulathur‑601203 | Lic. No. 416/280</p>

    <div class="qr-wrap">
      <img src="${dataUrl}" alt="Registration QR Code" width="300" height="300" />
    </div>

    <p class="cta">📱 Scan to Register for the Blood Donation Camp</p>
    <p class="url">${url}</p>

    <div class="steps">
      <p><span class="step-num">1</span> Scan the QR code with your phone camera</p>
      <p><span class="step-num">2</span> Complete the online registration form (5 mins)</p>
      <p><span class="step-num">3</span> Show your result at the registration desk</p>
    </div>

    <footer>Generated on ${stamp} | SRM MCH &amp; RC Blood Centre</footer>
  </div>
</body>
</html>`;

    fs.writeFileSync(path.join(outputDir, 'qr-code.html'), html);
    console.log('✅  QR code HTML →  public/qr-code.html');
    console.log('');
    console.log('📌  Print public/qr-code.html and place it at the camp entrance.');
    console.log(`🔗  Registration URL: ${url}`);
  })
  .catch(err => {
    console.error('Error generating data URL:', err);
  });
