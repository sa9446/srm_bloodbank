# Blood Donation Camp Registration App
### SRM Medical College Hospital & Research Centre

A complete web application for Blood Donation Camp donor registration, eligibility screening, consent collection, and medical officer examination — built for the June 5 camp.

---

## Features

| Module | What it does |
|--------|-------------|
| **Module A** — Registration | Personal details, vitals, instant eligibility pre-checks |
| **Module B** — Questionnaire | 10-section medical screening covering all Gazette of India deferral rules |
| **Module C** — Consent | Digital declaration with timestamped e-signature |
| **Result screen** | Instant FIT / TEMP_DEFERRED / PERMANENTLY_REJECTED verdict with eligible return date |
| **Donor QR code** | A unique QR generated per donor after registration — staff scan it at the desk to pull up their record |
| **Donor card** | Public page at `/donor/<id>` that shows name, status, exam results when QR is scanned |
| **Admin portal** | `/admin` — donor list, medical exam form, stats, CSV export |

---

## Running Locally

### 1. Clone and install
```bash
git clone https://github.com/sa9446/srm_bloodbank.git
cd srm_bloodbank
npm install
```

### 2. Set up environment
```bash
cp .env.example .env
```
Open `.env` and set a strong `ADMIN_PASSWORD`. Never commit this file.

### 3. Set up the database
```bash
npm run db:push
```
Creates a local `prisma/dev.db` SQLite file — no external database needed.

### 4. Start the app
```bash
npm run dev
```
Open **http://localhost:3000**

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values.

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SQLite path — keep as `file:./dev.db` for local use |
| `ADMIN_PASSWORD` | Staff portal login — **change before going live** |
| `NEXT_PUBLIC_APP_URL` | Full URL of the app — used by the static QR generator script |

`.env` is git-ignored and will never be committed. Only `.env.example` (with placeholders) lives in the repo.

---

## Staff Portal

Visit `/admin` and log in with the password you set in `.env`.

### Features
- Live stats: total / FIT / Deferred / Rejected donor counts
- Filter donor list by eligibility status
- Enter medical examination data per donor (Hb, BP, Pulse, Temperature)
- Log blood unit numbers and volume collected
- Set final FIT / DEFERRAL / REJECT status
- Export all donor data as CSV

---

## QR Codes

### Per-donor QR (automatic)
After a donor completes registration, a unique QR code is shown on their result screen. Staff scan it at the desk — it opens `/donor/<id>` with the donor's full record, eligibility status, and exam results.

No manual steps needed; this works automatically as long as the app is running.

### Camp entrance QR (manual, one-time)
To generate a printable QR for the camp entrance that links to the registration form:

```bash
# Local network (run on the laptop hosting the app)
node scripts/generate-qr.js http://<your-laptop-ip>:3000

# Deployed app
node scripts/generate-qr.js https://your-deployed-url.com
```

This creates:
- `public/registration-qr.png` — embed in flyers or WhatsApp
- `public/qr-code.html` — print this and put it at the entrance

To find your laptop's local IP on Windows:
```
ipconfig
```
Look for **IPv4 Address** under your Wi-Fi adapter (e.g. `192.168.1.5`).

---

## Running at the Camp (Local Network)

If you are not deploying to the internet and just want phones at the camp to access the app over Wi-Fi:

1. Connect your laptop to the camp Wi-Fi
2. Find your laptop IP with `ipconfig`
3. Run the app: `npm run build && npm start`
4. Generate the entrance QR: `node scripts/generate-qr.js http://<your-ip>:3000`
5. Print `public/qr-code.html`
6. Donors scan the entrance QR → register → get their personal QR → staff scan at desk

All data stays on your laptop. No internet required.

---

## Deploying to the Internet

> **Note:** Vercel does not support SQLite (no persistent disk). Use **Railway** or **Render** instead — both support SQLite and offer a free tier.

### Railway (recommended)
1. Push this repo to GitHub (already done)
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
3. Select `srm_bloodbank`
4. Add environment variables from your `.env` under the Railway project settings
5. Railway gives you a public URL — use it for the entrance QR

### Render
Same process — connect GitHub repo, set env vars, deploy.

---

## Deployment Checklist

- [ ] `ADMIN_PASSWORD` changed from the default in production env vars
- [ ] `NEXT_PUBLIC_APP_URL` set to the live URL
- [ ] `npm run db:push` run on the server (Railway/Render do this automatically if you add it to the build command)
- [ ] Entrance QR generated pointing to the live URL
- [ ] Entrance QR printed and placed at camp

---

## Eligibility Rules

### Module A — Immediate checks
- Age: 18–65 (18–60 for first-time donors; 18–60 for Apheresis)
- Weight: ≥45 kg (≥50 kg for Apheresis)
- Eligible volume: 350 ml if ≤55 kg, 450 ml if >55 kg
- Donation interval: ≥90 days (male) / ≥120 days (female) since last whole blood donation

### Module B — Temporary deferrals (return date shown to donor)

| Condition | Deferral period |
|-----------|----------------|
| Tattoo / piercing / cosmetic procedure | 12 months |
| Spouse received blood transfusion | 12 months |
| Jaundice — Hepatitis A or E | 12 months after recovery |
| Typhoid | 12 months after recovery |
| Major surgery | 12 months after recovery |
| Minor surgery / Dental surgery | 6 months after recovery |
| Dengue / Chikungunya | 6 months after recovery |
| Pyelonephritis (kidney infection) | 6 months after recovery |
| Zika Virus | 4 months after recovery |
| Malaria | 3 months after recovery |
| Measles / Mumps / Chickenpox / Rubella | 2 weeks after recovery |
| UTI / Cystitis | 14 days |
| COVID-19 vaccine | 14 days |
| Live vaccine (MMR, Yellow Fever) | 28 days |
| Anti-rabies / Hepatitis B Immunoglobulin | 12 months |
| Post-delivery | 12 months |
| Post-abortion / miscarriage | 6 months |
| Lactation | Entire period |
| Menstruation / within 5 days of period | Deferred |

### Module B — Permanent deferrals
- Jaundice of unknown cause, Hepatitis B, or Hepatitis C
- HIV / high-risk behaviour for HIV
- Sexually transmitted infections (Syphilis, Gonorrhea)
- Cardiovascular disease (MI, Angina, CAD, Hypertensive Heart Disease)
- Asthma requiring steroids
- Insulin-dependent Diabetes with multi-organ complications
- Chronic Kidney Disease / Renal Failure
- Liver failure / Cirrhosis
- Leprosy / Leishmaniasis
- Autoimmune diseases (SLE, Rheumatoid Arthritis)
- Bleeding disorders / Polycythemia Vera
- Organ or Stem Cell Transplant (received)

---

## Compliance

Built in accordance with:
- Gazette of India — Blood Donor Selection Criteria
- Drugs and Cosmetics Act, 1945
- IT Act, 2000 (electronic signatures)

Document reference: **SRM MOH & RO/BC‑01/019/VER 1.0‑OCT‑2023**
License No. **416/280**
