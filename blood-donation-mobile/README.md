# SRM Blood Donation Camp — Mobile App

React Native (Expo) companion app for the SRM Medical College Hospital & Research Centre Blood Donation Camp. Donors can register, complete the pre-screening questionnaire, give consent, and receive their eligibility result + QR code — all offline-capable.

## Quick Start

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android) to run on your device.

## Environment

Create `.env.local` (optional — app works offline without it):

```
EXPO_PUBLIC_API_URL=http://<your-laptop-ip>:3000
```

When set, completed registrations are saved to the web app's SQLite database and a persistent donor QR is generated. Without it the app falls back to a local-only mode (`LOCAL-` prefix IDs).

## Build APK (Android)

1. Install EAS CLI and log in:
   ```bash
   npm install -g eas-cli
   eas login
   ```
2. Build preview APK:
   ```bash
   eas build --platform android --profile preview
   ```
   EAS builds in the cloud (~10–15 min). Download the `.apk` from the link provided.

3. Install on device:
   ```bash
   adb install <downloaded-file>.apk
   ```
   Or share the EAS download link directly.

### Local APK (no EAS account)

```bash
npx expo run:android --variant release
```

Requires Android Studio + SDK installed locally.

## Project Structure

```
App.tsx                    — Navigation + multi-step form state machine
src/
  screens/
    HomeScreen.tsx         — Welcome / camp info
    ModuleAScreen.tsx      — Step 1: Personal info, demographics, donation details
    ModuleBScreen.tsx      — Step 2: Pre-screening questionnaire (9 sections)
    ModuleCScreen.tsx      — Step 3: Declaration & e-signature consent
    ResultScreen.tsx       — Step 4: Eligibility result + QR code
  components/
    StepIndicator.tsx      — Progress bar (steps 1-4)
    YesNoToggle.tsx        — YES/NO button pair
  lib/
    eligibility.ts         — Pure eligibility engine (same logic as web app)
  types/
    donor.ts               — Shared TypeScript types
```

## Four-Step Flow

| Step | Screen | Purpose |
|------|--------|---------|
| 1 | ModuleA | Name, DOB, weight, contact, donation type |
| 2 | ModuleB | 30+ medical history questions across 9 sections |
| 3 | ModuleC | Legal declaration + HIV consent + e-signature |
| 4 | Result | Eligibility verdict + QR code for staff scanning |

## Eligibility Engine

`src/lib/eligibility.ts` is a pure TypeScript function — no network call required. It mirrors the web app's rules exactly:

- **Age**: 18–65 years
- **Weight**: ≥ 45 kg
- **Donation interval**: ≥ 56 days (whole blood), ≥ 14 days (platelets)
- **Permanent deferrals**: HIV, Hepatitis, cancer, heart surgery, organ transplant, epilepsy, haemophilia
- **Temporary deferrals**: Malaria (3 months), jaundice (1 year), tattoo (6 months), recent surgery (6 months), pregnancy (1 year post-delivery), medication-dependent

## QR Code

The app uses `react-native-qrcode-svg` to render a QR code on-device. The QR value is:
- `srm-donor:<donorId>` when saved to the server
- `srm-donor-local:<id>` in offline mode

Staff scan the QR on a device pointing at `http://<server>/donor/<donorId>` to pull up the full donor record.

## Tech Stack

| Package | Purpose |
|---------|---------|
| Expo ~51 | Build toolchain |
| React Navigation (native-stack) | Screen navigation |
| react-native-qrcode-svg | On-device QR rendering |
| react-native-safe-area-context | Safe area handling |
| date-fns | Date arithmetic for deferrals |
| @react-native-async-storage | Offline storage |

## App Info

- **Bundle ID**: `com.srm.blooddonation`
- **Version**: 1.0.0
- **Min Android SDK**: 21 (Android 5.0+)
- **Splash / icon color**: `#9f1239` (SRM red)
