# Blood Donation Camp Registration App
### SRM Medical College Hospital & Research Centre

A complete, production-ready web application for Blood Donation Camp donor registration, eligibility screening, consent collection, and medical officer examination entry.

---

## Features

| Module | Description |
|--------|-------------|
| **Module A** — Registration | Personal details, demographics, vitals with real-time eligibility pre-checks |
| **Module B** — Questionnaire | 10-section pre-screening questionnaire covering all Gazette of India criteria |
| **Module C** — Consent | Digital declaration sign-off with timestamped e-signature |
| **Result** | Instant FIT / TEMP_DEFERRED / PERMANENTLY_REJECTED verdict with return date |
| **Admin Portal** | Staff dashboard: donor list, medical examination form, CSV export |
| **QR Code** | Auto-generated PNG + printable HTML page |

---

## Tech Stack

- **Frontend / Backend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS (SRM red theme)
- **Database**: SQLite via Prisma (zero-config, no server needed)
- **Fallback**: localStorage (app works immediately without DB setup)

---

## Quick Start

### 1. Install dependencies
```bash
cd blood-donation-app
npm install
```

### 2. Set up the database
```bash
npm run db:push
```
This creates a local `prisma/dev.db` SQLite file. No PostgreSQL or any server needed.

### 3. Start the app
```bash
npm run dev
```
Open **http://localhost:3000** in your browser.

---

## Generate the QR Code

After deploying (or for local testing):

```bash
# For local testing
npm run generate-qr

# For your deployed URL
node scripts/generate-qr.js https://your-deployed-url.com
```

This creates:
- `public/registration-qr.png` — Use in flyers, posters, WhatsApp
- `public/qr-code.html` — **Print this** and place at the camp entrance

---

## Staff Portal (Admin)

Visit `/admin` and log in with the password in `.env`:

```
Default password: srm@blood2024
```

Change it in `.env`:
```
ADMIN_PASSWORD="your-strong-password"
```

### Admin Features
- Live dashboard: total / FIT / Deferred / Rejected counts
- Filter donors by eligibility status
- Enter medical examination data (Hb, BP, Pulse, Temperature)
- Log blood unit numbers and volumes
- Set final FIT / DEFERRAL / REJECT status
- Export all donor data as CSV

---

## Eligibility Rules Implemented

### Immediate Checks (Module A)
- Age: 18–65 (18–60 for first-timers; 18–60 for Apheresis)
- Weight: ≥45 kg whole blood, ≥50 kg Apheresis
- Eligible volume: 350 ml (≤55 kg) or 450 ml (>55 kg)
- Interval: ≥90 days (male) / ≥120 days (female) since last donation

### Temporary Deferrals (Module B — with return dates)
| Condition | Deferral |
|-----------|---------|
| Tattoo / Piercing / Cosmetic | 12 months |
| Spouse received transfusion | 12 months |
| Jaundice (Hep A/E) | 12 months after recovery |
| Typhoid | 12 months after recovery |
| Major surgery | 12 months after recovery |
| Minor surgery / Dental | 6 months after recovery |
| Dengue / Chikungunya | 6 months after recovery |
| Malaria | 3 months after recovery |
| Zika Virus | 4 months after recovery |
| Measles / Mumps / Chickenpox | 2 weeks after recovery |
| Pyelonephritis | 6 months after recovery |
| UTI / Cystitis | 14 days |
| COVID-19 vaccine | 14 days |
| Live vaccine (MMR, Yellow Fever) | 28 days |
| Anti-rabies / Hep B Immunoglobulin | 12 months |
| Post-delivery | 12 months |
| Post-abortion | 6 months |
| Lactation | Entire period |
| Menstruation / within 5 days | Defer |

### Permanent Deferrals
- Jaundice (unknown / HBV / HCV)
- HIV / High-risk behaviour
- STI (Syphilis, Gonorrhea)
- Cardiovascular disease (MI, Angina, CAD)
- Asthma on steroids
- Insulin-dependent Diabetes with complications
- Chronic Kidney / Liver Failure
- Leprosy / Leishmaniasis
- Autoimmune (SLE, RA)
- Bleeding disorders / Polycythemia Vera
- Organ / Stem Cell Transplant

---

## Deployment (Before June 5)

### Option 1 — Vercel (Recommended, Free)
```bash
npm install -g vercel
vercel deploy
```
Note: Switch to Turso or PlanetScale (free SQLite/MySQL in the cloud) for persistent storage on Vercel.

### Option 2 — Railway / Render (keeps SQLite)
Both support Node.js with persistent filesystem. Upload the repo and set env vars.

### Option 3 — Local Network at Camp
Run on a laptop and share via Wi-Fi hotspot:
```bash
npm run build && npm start
```
Set `NEXT_PUBLIC_APP_URL=http://<your-laptop-IP>:3000` and generate the QR code pointing to that IP.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `file:./dev.db` | SQLite path |
| `ADMIN_PASSWORD` | `srm@blood2024` | Staff portal password |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Used by QR code generator |

---

## License & Compliance

Built in compliance with:
- **Gazette of India** — Blood Donor Selection Criteria
- **Drugs and Cosmetics Act, 1945**
- **IT Act, 2000** — Electronic signatures

Document Reference: **SRM MOH & RO/BC‑01/019/VER 1.0‑OCT‑2023**
