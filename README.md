# SRM Blood Donation Camp — Registration System
### SRM Medical College Hospital & Research Centre

A full-stack donor registration system for the Blood Donation Camp. Includes a **Next.js web app** for browser-based registration and an **Expo React Native mobile app** for Android/iOS.

---

## Repository Structure

```
srm_bloodbank/
├── src/                          Next.js web app
│   ├── app/                      App Router pages & API routes
│   │   ├── page.tsx              Home / welcome
│   │   ├── register/             4-step registration flow
│   │   ├── admin/                Staff portal
│   │   ├── donor/[id]/           Donor card (QR scan target)
│   │   └── api/                  REST endpoints (donors, QR, admin)
│   ├── components/               ModuleA/B/C, StepIndicator, EligibilityResult
│   ├── lib/                      eligibility.ts, prisma.ts
│   └── types/                    donor.ts (shared types)
├── prisma/
│   └── schema.prisma             Donor + MedicalExam models (SQLite)
├── scripts/
│   └── generate-qr.js            Camp entrance QR generator
├── blood-donation-mobile/        React Native (Expo) mobile app
│   ├── App.tsx                   Navigation + step state machine
│   ├── app.json                  Expo config (bundle ID, splash, icons)
│   ├── eas.json                  EAS Build profiles (APK + AAB)
│   └── src/
│       ├── screens/              HomeScreen, ModuleA/B/C, ResultScreen
│       ├── components/           StepIndicator, YesNoToggle
│       ├── lib/eligibility.ts    Same eligibility engine as web
│       └── types/donor.ts        Shared TypeScript types
├── APP_OVERVIEW.md               2-page brief on the full system
├── .env.example                  Environment variable template
└── README.md                     This file
```

---

## Web App

### Features

| Module | What it does |
|--------|-------------|
| **Module A** — Registration | Personal details, vitals, instant eligibility pre-checks |
| **Module B** — Questionnaire | 9-section medical screening (all Gazette of India deferral rules) |
| **Module C** — Consent | Digital declaration with timestamped e-signature |
| **Result screen** | Instant ELIGIBLE / TEMP_DEFERRED / PERMANENTLY_DEFERRED verdict |
| **Donor QR code** | Unique QR per donor — staff scan it to pull up the donor record |
| **Donor card** | `/donor/<id>` — name, status, exam results when QR is scanned |
| **Admin portal** | `/admin` — donor list, medical exam form, stats, CSV export |

### Quick Start

```bash
git clone https://github.com/sa9446/srm_bloodbank.git
cd srm_bloodbank
npm install
cp .env.example .env        # then edit .env with a real ADMIN_PASSWORD
npm run db:push             # creates prisma/dev.db
npm run dev                 # http://localhost:3000
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SQLite path — keep as `file:./dev.db` locally |
| `ADMIN_PASSWORD` | Staff portal login — **change before going live** |
| `NEXT_PUBLIC_APP_URL` | Full URL — used by the camp entrance QR script |

`.env` is git-ignored and will never be committed. Only `.env.example` lives in the repo.

### Admin Portal

Visit `/admin` and log in with your `ADMIN_PASSWORD`.

- Live stats (total / FIT / Deferred / Rejected)
- Filter donor list by eligibility status
- Enter medical exam data per donor (Hb, BP, Pulse, Temp)
- Log blood unit numbers and volume collected
- Set final FIT / DEFERRAL / REJECT status
- Export all data as CSV

### QR Codes

**Per-donor QR (automatic)**  
After registration, a unique QR is shown on the result screen. Staff scan it — it opens `/donor/<id>` with the full donor record.

**Camp entrance QR (one-time setup)**  
```bash
# On the laptop running the app, get your local IP first:
ipconfig   # look for IPv4 Address under Wi-Fi

# Then generate the entrance QR:
node scripts/generate-qr.js http://<your-ip>:3000
```
Creates `public/registration-qr.png` and `public/qr-code.html` — print and place at the camp entrance.

### Running at the Camp (Local Wi-Fi, No Internet)

1. Connect laptop to camp Wi-Fi
2. `npm run build && npm start`
3. `node scripts/generate-qr.js http://<your-ip>:3000`
4. Print `public/qr-code.html` and place at entrance
5. Donors scan → register → get personal QR → staff scan at desk

All data stays on the laptop.

### Deploying to the Internet

> **Note:** Vercel does not support SQLite. Use **Railway** or **Render** — both support persistent disk on free tier.

**Railway (recommended)**
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub → select `srm_bloodbank`
2. Add env vars from `.env` in Railway's project settings
3. Use the Railway public URL for the entrance QR

---

## Mobile App (`blood-donation-mobile/`)

A React Native app built with Expo. Donors can register, complete the questionnaire, give consent, and receive their eligibility result with a QR code — offline-capable with optional backend sync.

**Latest APK build:** `v1.0.0` — built and verified on EAS (build `9c811047`)

### Run on Device (Development)

```bash
cd blood-donation-mobile
npm install
npx expo start
```
Scan the QR with **Expo Go** on your phone.

### Connect to the Web App Backend

Create `blood-donation-mobile/.env.local`:
```
EXPO_PUBLIC_API_URL=http://<your-laptop-ip>:3000
```
When set, completed registrations are posted to the web app's SQLite database. The result screen then fetches and displays the donor's QR image from the server (`/api/qr/<donorId>`). Without it the app runs fully offline — donors see their Donor ID and can show it to staff manually.

### Build APK for Android

1. Install EAS CLI (one time):
   ```bash
   npm install -g eas-cli
   eas login          # free Expo account required
   ```
2. Build:
   ```bash
   cd blood-donation-mobile
   eas build --platform android --profile preview
   ```
   EAS builds in the cloud (~10 min) and returns a direct `.apk` download link.

3. Install on device — download the `.apk` and open it on Android, or:
   ```bash
   adb install <file>.apk
   ```

> **Note:** The `eas.json` `preview` profile produces an APK (sideloadable). The `production` profile produces an AAB for Google Play submission.

### Mobile App Flow

| Step | Screen | Purpose |
|------|--------|---------|
| 1 | ModuleAScreen | Name, DOB, weight, contact, donation type |
| 2 | ModuleBScreen | 9-section pre-screening questionnaire |
| 3 | ModuleCScreen | Legal declaration + HIV consent + e-signature |
| 4 | ResultScreen | Eligibility verdict + server-fetched QR code |

### Architecture Notes

- **No native QR library** — QR image is fetched from the web server (`/api/qr/[donorId]`) and displayed with React Native's built-in `<Image>` component. Eliminates native module complexity.
- **Offline fallback** — if the server is unreachable, registration completes locally with a `LOCAL-` prefixed ID and the donor ID is shown in place of the QR.
- **Shared eligibility engine** — `src/lib/eligibility.ts` is identical to the web app's version; all eligibility logic runs on-device without any network call.

---

## Eligibility Engine

Both apps share the same pure TypeScript eligibility function (`src/lib/eligibility.ts` / `blood-donation-mobile/src/lib/eligibility.ts`) — no network call required. Rules are evaluated in this order:

### Immediate checks (Module A)
- Age: 18–65 years
- Weight: ≥ 45 kg (eligible volume: 350 ml if ≤55 kg, 450 ml if >55 kg)
- Donation interval: ≥ 56 days since last whole blood donation

### Temporary deferrals (return date shown to donor)

| Condition | Deferral |
|-----------|----------|
| Tattoo / piercing / cosmetic procedure | 12 months |
| Spouse received transfusion | 12 months |
| Hepatitis A / E jaundice | 12 months after recovery |
| Typhoid | 12 months after recovery |
| Major surgery | 12 months after recovery |
| Minor / dental surgery | 6 months after recovery |
| Dengue / Chikungunya | 6 months after recovery |
| Kidney infection (Pyelonephritis) | 6 months after recovery |
| Zika Virus | 4 months after recovery |
| Malaria | 3 months after recovery |
| Measles / Mumps / Chickenpox / Rubella | 2 weeks after recovery |
| UTI / Cystitis | 14 days |
| COVID-19 / live vaccine | 14–28 days |
| Post-delivery | 12 months |
| Post-abortion / miscarriage | 6 months |
| Lactation | Entire period |
| Menstruation / within 5 days | Deferred |

### Permanent deferrals
HIV, Hepatitis B/C, Syphilis, heart disease, insulin-dependent diabetes with complications, chronic kidney/liver disease, leprosy, autoimmune diseases, bleeding disorders, organ transplant (received), cancer.

---

## Compliance

Built in accordance with:
- Gazette of India — Blood Donor Selection Criteria
- Drugs and Cosmetics Act, 1945
- IT Act, 2000 (electronic signatures)

**Document ref:** SRM MOH & RO/BC‑01/019/VER 1.0‑OCT‑2023  
**License No.:** 416/280

---

## Deployment Checklist

- [ ] `ADMIN_PASSWORD` changed from default in production env vars
- [ ] `NEXT_PUBLIC_APP_URL` set to the live URL
- [ ] `npm run db:push` run on server (or added to build command)
- [ ] Entrance QR generated pointing to the live URL and printed
- [ ] Mobile app `EXPO_PUBLIC_API_URL` pointed at the live server (if used with backend)
