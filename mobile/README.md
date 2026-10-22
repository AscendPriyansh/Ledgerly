# MiniLedger Mobile — Premium Fintech Lending & Debt Tracker

A modern, production-minded React Native application built with **Expo**, **Expo Router**, and **TypeScript** for tracking money lent to friends, managing due dates, monitoring overdue balances, and recording full repayments.

---

## 📱 Features

- **Auth & Onboarding**:
  - Secure phone login with E.164 phone validation (`+91...`).
  - 6-digit OTP verification flow with resend countdown timer.
  - Development mode support for server-side mock OTPs.
  - Secure token persistence using `expo-secure-store` (never AsyncStorage).
- **Fintech Dashboard**:
  - Net Outstanding balance hero card with repayment ratio progress bar.
  - Total Lent & Total Repaid financial breakdown.
  - Overdue debt indicator with coral red accents and clear warning badges.
  - Quick "+ Lend" action and compact recent loans section.
  - Authentic INR currency formatting (`₹1,200.00`).
- **Comprehensive Loan Management**:
  - Real-time search by friend's name or amount.
  - Filter chips: `All`, `Pending`, `Overdue`, and `Repaid` with live counts.
  - Sort by: `Due Date` (earliest first), `Newest`, or `Amount` (highest first).
  - Dedicated individual loan detail view with financial history breakdown.
- **Lending & Repayment Flows**:
  - Add Loan modal with quick amount presets (`+₹500`, `+₹1,000`, `+₹2,000`, `+₹5,000`).
  - Interactive due date picker with fast shortcuts (`+7 Days`, `+15 Days`, `+1 Month`) and full calendar grid.
  - One-tap "Mark as Repaid" settlement flow with confirmation dialog and mutation invalidation.
- **Settings & Diagnostics**:
  - View authenticated account phone number.
  - Live server connection health monitor against `/api/health`.
  - Secure logout flow with confirmation prompt, clearing SecureStore and cache.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: React Native 0.88, Expo SDK 58, Expo Router
- **Language**: TypeScript 5.9+ (Strict Mode)
- **State Management & Caching**: TanStack React Query v5
- **Form Handling & Validation**: React Hook Form + Zod
- **Storage**: `expo-secure-store`
- **Icons**: `lucide-react-native` with `react-native-svg`
- **Styling**: React Native `StyleSheet` with centralized design tokens (`Colors`, `Spacing`, `Radii`, `Typography`)
- **Gradients & Feedback**: `expo-linear-gradient`, `expo-haptics`

---

## 📋 Prerequisites

- **Node.js**: `v20.x` or `v22.x`
- **npm**: `v9.x` or higher
- **Expo Go** or an iOS Simulator / Android Emulator

---

## 🚀 Installation & Setup

1. **Navigate to the mobile directory**:
   ```bash
   cd mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure the environment**:
   Copy the example environment configuration:
   ```bash
   cp .env.example .env
   ```

   Open `.env` and set `EXPO_PUBLIC_API_URL` based on your target device (see below).

---

## 🌐 Configuring `EXPO_PUBLIC_API_URL`

Because mobile devices and emulators connect to networks differently, configure `EXPO_PUBLIC_API_URL` to match your environment:

| Platform / Environment | Recommended `EXPO_PUBLIC_API_URL` | Notes |
|---|---|---|
| **iOS Simulator** | `http://localhost:4000` | Localhost maps directly to Mac host |
| **Android Emulator** | `http://10.0.2.2:4000` | `10.0.2.2` routes to host machine `127.0.0.1` |
| **Web Browser** | `http://localhost:4000` | Browser runs locally on the computer |
| **Physical Phone (Expo Go)** | `http://192.168.x.x:4000` | Replace with your computer's local Wi-Fi IP address |

> **Note**: If using a physical phone on Wi-Fi, ensure your phone and computer are on the exact same Wi-Fi network and your firewall allows traffic on port `4000`.

---

## 🖥️ Running the Backend & Mobile App Together

### Terminal 1: Backend Server

1. Navigate to `server/`:
   ```bash
   cd server
   ```
2. Ensure dependencies are installed and database is migrated:
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   ```
3. Start the server on port 4000:
   ```bash
   npm run dev
   ```
4. Verify backend health:
   ```bash
   curl http://localhost:4000/api/health
   # Returns: {"status":"ok","service":"miniledger-api"}
   ```

### Terminal 2: Mobile App

1. Navigate to `mobile/`:
   ```bash
   cd mobile
   ```
2. Start the Expo development server:
   ```bash
   npm start
   ```
3. Press:
   - `a` to launch on Android emulator
   - `i` to launch on iOS simulator
   - `w` to open in web browser for rapid testing
   - Scan the QR code using the Expo Go camera (iOS) or Expo Go app (Android)

---

## 🔑 How to Test Mock OTP Login

1. On the app welcome screen, enter any valid phone number (e.g. `+919876543210` or `9876543210`).
2. Tap **Continue**.
3. In the backend server terminal (Terminal 1), observe the logged line:
   ```text
   [MOCK OTP] +919876543210: 123456 (expires in 5 minutes)
   ```
4. Enter the 6-digit code shown in the log into the app's verification screen.
5. Tap **Verify & Enter**.
6. The app stores the JWT in `expo-secure-store` and transitions directly to your personal fintech dashboard.

---

## 🧪 Testing & Verification

Run the automated test suite and typechecks:

```bash
# Run TypeScript compilation check
npm run typecheck

# Run unit tests (Zod schemas, formatters, overdue logic)
npm test

# Run Expo configuration diagnostics
npx expo-doctor
```

---

## 📂 Project Structure

```
mobile/
├── app/
│   ├── _layout.tsx              # Root Layout: QueryClient, AuthProvider, Dark StatusBar
│   ├── index.tsx                # Startup / Auth Gate (reads SecureStore)
│   ├── (auth)/
│   │   ├── _layout.tsx          # Auth stack
│   │   ├── login.tsx            # Phone number input with Zod validation
│   │   └── verify-otp.tsx       # 6-digit OTP verification & resend countdown
│   └── (app)/
│       ├── _layout.tsx          # Protected route guard
│       ├── (tabs)/
│       │   ├── _layout.tsx      # Dark fintech tab bar (Home, Loans, Settings)
│       │   ├── index.tsx        # Dashboard: Summary card, quick actions, recent loans
│       │   ├── loans.tsx        # Loans list: Real-time search, filter chips, sort
│       │   └── settings.tsx     # Settings: Signed-in phone, API health, logout
│       └── loans/
│           ├── new.tsx          # Add loan modal: Amount chips & DatePicker
│           ├── [id].tsx         # Loan detail: Breakdown & overdue indicator
│           └── [id]/
│               └── repay.tsx    # Repayment confirmation flow (PATCH /repay)
├── src/
│   ├── api/
│   │   ├── client.ts            # Typed HTTP client, 401 handling, base URL detection
│   │   ├── auth.ts              # /api/auth/request-otp, /api/auth/verify-otp
│   │   ├── loans.ts             # /api/loans (list, create, repay)
│   │   ├── summary.ts           # /api/summary
│   │   └── health.ts            # /api/health
│   ├── components/              # Screen, Button, TextField, LoanCard, SummaryCard, StatusBadge, etc.
│   ├── constants/               # Colors, Spacing, Radii, Typography
│   ├── features/auth/           # AuthContext & token management
│   ├── hooks/                   # TanStack Query hooks (queries & mutations)
│   ├── lib/                     # SecureStore helpers, INR currency formatters, date utilities
│   ├── schemas/                 # Zod validation schemas
│   └── types/                   # TypeScript API DTOs and models
├── .env.example
├── app.json
├── package.json
└── tsconfig.json
```
