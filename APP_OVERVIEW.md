# SRM Blood Donation Camp — App Overview

## What It Is
A digital registration and screening system for the SRM Medical College Hospital & Research Centre Blood Donation Camp. Donors register on their phone, complete a medical questionnaire, sign a consent form, and receive an instant eligibility verdict plus a unique personal QR code. Camp staff scan that QR at the desk to pull up the donor record instantly.

---

## Two Apps

| | Web App | Mobile App |
|---|---|---|
| **Repo** | `sa9446/srm_bloodbank` | `sa9446/srm_bloodbank_mobile` |
| **Run** | `npm run dev` → localhost:3000 | `npx expo start` |
| **APK** | N/A | `npx eas build -p android --profile preview` |
| **Stack** | Next.js 14 + Tailwind + Prisma + SQLite | React Native + Expo |

---

## Key Credentials

| What | Value | Where to change |
|---|---|---|
| Staff portal password | set in `.env` → `ADMIN_PASSWORD` | `.env` file (never committed) |
| Default password | `srm@blood2024` | `.env` → change before go-live |
| DB | SQLite at `prisma/dev.db` | `.env` → `DATABASE_URL` |
| Admin URL | `/admin` | — |

---

## Registration Flow (4 Steps)

```
Step 1 — Module A (Registration)
  • Name, Father's name, Occupation, Address, Mobile, Email
  • Gender, Marital status, DOB (auto-calculates age), Weight
  • Donation type: Whole Blood / Apheresis
  • First-time donor? Last donation date?
  • Instant hard-stop checks: age, weight, donation interval

Step 2 — Module B (Medical Questionnaire — 10 sections)
  • General health today (feeling well, meal, sleep)
  • Occupation safety (air crew, emergency services)
  • Jaundice / hepatitis history
  • Tattoos, piercings, cosmetic procedures
  • Dental procedures
  • Surgeries
  • Infections (Typhoid, Malaria, Dengue, Zika, etc.)
  • Vaccines (COVID-19, live vaccines, anti-rabies)
  • Chronic/permanent conditions (HIV, cardiovascular, kidney, etc.)
  • Female-specific (pregnancy, delivery, lactation, menstruation)

Step 3 — Module C (Consent)
  • Full donor declaration text (legal)
  • HIV/TTI testing consent
  • "Do you want your test results?" toggle
  • Typed name as e-signature + timestamp (IT Act 2000)

Step 4 — Result
  • FIT → proceed to medical desk
  • TEMP_DEFERRED → reason + exact eligible return date
  • PERMANENTLY_REJECTED → reason + guidance
  • Unique QR code generated per donor (downloadable PNG)
```

---

## Eligibility Engine (`src/lib/eligibility.ts`)

All logic lives here. Takes `BasicInfo` + `ScreeningAnswers`, returns one of:

- **FIT** + eligible volume (350 ml if ≤55 kg, 450 ml if >55 kg)
- **TEMP_DEFERRED** + human-readable reason + ISO eligible return date
- **PERMANENTLY_REJECTED** + reason

Key rules enforced:
- Age 18–65 (18–60 first-time; 18–60 apheresis)
- Weight ≥45 kg (≥50 kg apheresis)
- Interval ≥90 days male / ≥120 days female
- 30+ deferral conditions with exact periods (3 days to permanent)

---

## Per-Donor QR Code

- Generated at `/api/qr/[donorId]` — server-side PNG, SRM red, H error correction
- Encodes `/donor/[id]` — the donor card page
- Donor card shows: name, status, eligibility volume, exam results when filled by staff
- Staff scan → instant lookup, no paper needed

---

## Staff Portal (`/admin`)

Protected by `ADMIN_PASSWORD`. Features:
- Live stats: Total / FIT / Deferred / Rejected
- Donor list with filter by status
- Medical exam form per donor: Hb, BP, Pulse, Temperature, Blood Unit No., Volume
- Final status: FIT / DEFERRAL / REJECT
- CSV export of all donors

---

## Architecture

```
Frontend (Next.js pages/components)
    ↓ fetch
API Routes (/api/donors, /api/admin/*, /api/qr/*)
    ↓ Prisma ORM
SQLite (prisma/dev.db)
```

All code is TypeScript. Shared types in `src/types/donor.ts`.
Eligibility logic is pure functions — no DB, no side effects, fully testable.

---

## Running Locally

```bash
npm install
cp .env.example .env        # set ADMIN_PASSWORD
npm run db:push             # creates dev.db
npm run dev                 # http://localhost:3000
```

## QR Code for Camp Entrance

```bash
node scripts/generate-qr.js http://<your-laptop-ip>:3000
# then print public/qr-code.html
```

---

## Compliance
Gazette of India — Blood Donor Criteria | Drugs & Cosmetics Act 1945 | IT Act 2000
Doc Ref: SRM MOH & RO/BC-01/019/VER 1.0-OCT-2023 | Lic. No. 416/280
