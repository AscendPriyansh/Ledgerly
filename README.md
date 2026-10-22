# 🌿 MiniLedger 2.0 — Premium Personal Lending & Debt Analytics

> **A Duolingo-delight inspired, production-grade fintech application for tracking peer-to-peer personal loans, monitoring repayments, visualizing lending portfolio health, and fostering respectful debt settlement.**

[![React Native](https://img.shields.io/badge/React_Native-0.88-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo_SDK-58-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9%2B-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Cloud-336791.svg)](https://neon.tech/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📑 Table of Contents

1. [Executive Summary & Product Pitch](#-executive-summary--product-pitch)
2. [Key Highlights & Visual Polish](#-key-highlights--visual-polish)
3. [Architecture & System Design](#-architecture--system-design)
4. [Implemented Features Catalog](#-implemented-features-catalog)
5. [Database Schema & API Contracts](#-database-schema--api-contracts)
6. [Design System & Dual-Theme Engine](#-design-system--dual-theme-engine)
7. [Getting Started & Local Setup](#-getting-started--local-setup)
8. [Testing & Quality Assurance](#-testing--quality-assurance)
9. [Human Pitch & 3-Minute Demo Walkthrough Guide](#-human-pitch--3-minute-demo-walkthrough-guide)

---

## 💡 Executive Summary & Product Pitch

### The Problem
Lending money to friends, family, or colleagues is awkward, emotionally fraught, and easily forgotten. Traditional expense splitters (e.g., Splitwise) are built for shared group dinners, not one-on-one lending with specific repayment dates. Personal spreadsheets are clunky, forgotten on laptops, and lack timely reminders. As a result, lenders either endure awkward follow-ups or quietly write off money they worked hard to earn.

### The Solution: MiniLedger 2.0
**MiniLedger 2.0** turns informal lending into a structured, transparent, and delight-driven experience:
- **Financial Clarity**: A hero overview displaying Total Lent, Total Repaid, Net Outstanding, and Overdue balances at a glance.
- **Visual Analytics**: Interactive SVG Portfolio Donut charts and 6 vs 12-month lending trend bar charts.
- **Friendly & Respectful**: Pre-composed, customizable repayment reminder messages ready to share via WhatsApp, SMS, or Telegram with zero awkwardness.
- **Duolingo-Level Delight**: A charming leaf mascot (**Leafy**), rewarding celebration micro-interactions, responsive haptic feedback, and a dual-theme design system (**Dark Navy Fintech** & **Light Slate & Emerald**).

---

## ✨ Key Highlights & Visual Polish

| Feature | Description |
|---|---|
| 🌿 **Leafy Mascot & Personality** | An original brand mascot featured in onboarding, empty states, and milestone celebrations, delivering encouraging fintech microcopy without feeling juvenile. |
| 🌓 **Dual-Theme Engine** | Full **Dark Mode** (deep navy `#090D14` and emerald `#34E0A1`) and **Light Mode** (crisp slate `#F8FAFC` and jade `#059669`) with instant toggling and persistence. |
| 📊 **Interactive SVG Analytics** | Custom responsive SVG Portfolio Donut Chart (Repaid vs Outstanding vs Overdue) and Monthly Trends Bar Chart with dynamic 6M/12M range filtering. |
| ⚡ **Actionable Insights** | "Attention Needed" feed highlighting loans due within 7 days, overdue borrowers, and top balance holders. |
| 👤 **Full User Profile** | Avatar mascot selector (8 choices), custom avatar URLs, editable name, bio, and lifetime lending metrics synced to PostgreSQL. |
| 🔒 **Enterprise-Grade Security** | Passwordless phone OTP authentication, signed JWT tokens, and secure device credential storage via `expo-secure-store`. |

---

## 🏛️ Architecture & System Design

MiniLedger is designed as a modular **monorepo** consisting of an Expo + React Native mobile client and an Express + Prisma + PostgreSQL server:

```
┌─────────────────────────────────────────────────────────────┐
│                   MINILEDGER MOBILE CLIENT                   │
│   (Expo SDK 58, React Native 0.88, Expo Router, TypeScript) │
├──────────────────────────────┬──────────────────────────────┤
│  State & Network Layer       │  UI & Interaction Layer      │
│  - TanStack React Query v5   │  - Dual-Theme System (Context)│
│  - React Hook Form + Zod     │  - Lucide Vector Icons (SVG) │
│  - Expo SecureStore          │  - Expo Haptics & LinearGrad │
└──────────────┬───────────────┴──────────────┬───────────────┘
               │ RESTful API (Bearer JWT)     │
               ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXPRESS REST API SERVER                   │
│         (Node.js v20+, TypeScript, Express, Zod)            │
├─────────────────────────────────────────────────────────────┤
│  Middleware: CORS, JWT Auth Guard, Zod Request Validator    │
│  Controllers: Auth, User Profile, Loans, Summary Analytics │
└──────────────────────────────┬──────────────────────────────┘
                               │ Prisma ORM
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 NEON POSTGRESQL DATABASE                    │
│   Tables: User, Loan, Repayment (with relational integrity) │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 Implemented Features Catalog

### 1. Dashboard & Financial Intelligence
- **Hero Financial Card**: High-contrast card with real-time computation of **Total Lent**, **Total Repaid**, **Net Outstanding Balance**, and **Overdue Balance** with authentic Indian digit grouping (`₹1,25,000`).
- **Portfolio Donut Chart**:
  - Distinguishes **Repaid Amount**, **Outstanding (Healthy)**, and **Overdue (Late)**.
  - Guarantees overdue balances are treated as a subset of outstanding—never double counted.
  - Interactive legend showing values and portfolio percentages.
- **Monthly Lending & Repayment Trends Bar Chart**:
  - Groups lending by loan creation month and repayments by their actual recorded payment timestamp.
  - Quick toggle between **Last 6 Months** and **Last 12 Months**.
- **"Attention Needed" Priority Feed**:
  - Direct alert badges for loans requiring immediate attention.
  - Countdown indicators: *"Rahul's loan is overdue by 4 days"* or *"Due in 2 days"*.

### 2. Comprehensive Loan Management
- **Instant Search**: Filter by friend's name or note in real-time.
- **Status Filter Chips**: `All`, `Pending`, `Overdue`, and `Repaid` with live badge counts.
- **Multi-criteria Sorting**:
  - Sort by **Due Date** (nearest deadline first).
  - Sort by **Newest** (recently recorded).
  - Sort by **Largest Outstanding Amount**.
- **Loan Detail Screen**:
  - Principal amount, recorded repayments, remaining balance, and due date countdown.
  - Complete **Repayment Timeline** showing dates, amounts, and settlement status.
  - Note display for personal loan context.

### 3. Creation, Repayment & Polite Reminders
- **Fast "+ Add Loan" Modal**:
  - Quick amount increments: `+₹500`, `+₹1,000`, `+₹2,000`, `+₹5,000`.
  - Date picker shortcuts: `+7 Days`, `+15 Days`, `+1 Month`, or custom calendar selection.
  - Optional borrower notes.
- **One-Tap Mark as Repaid**:
  - Confirmation sheet preventing accidental settlements.
  - Rewarding celebration feedback with Leafy mascot and haptic pulses.
- **Polite Shareable Reminders**:
  - Generates courteous, non-aggressive reminder messages with loan details and due date.
  - Opens the native OS Share Sheet (WhatsApp, SMS, Telegram, Mail).

### 4. User Profile & Personalization
- **Profile Management (`app/(app)/profile.tsx`)**:
  - **Mascot Avatar Picker**: Choose between 8 mascots (Leafy, Owl, Fox, Tiger, Panda, Lion, Astro, Gem) or paste a custom avatar URL.
  - **Editable User Information**: Update Name, Bio, and Email.
  - **Lifetime Activity Counter**: Displays total recorded loans and account membership date.
- **Appearance & Theme Switcher**:
  - Accessible directly in Settings and Profile.
  - Three distinct settings: **Dark Mode**, **Light Mode**, or **Follow System**.

---

## 🗄️ Database Schema & API Contracts

### Prisma Schema (`server/prisma/schema.prisma`)

```prisma
model User {
  id         String      @id @default(cuid())
  phone      String      @unique
  name       String?
  avatarUrl  String?
  email      String?
  bio        String?
  loans      Loan[]
  repayments Repayment[]
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
}

model Loan {
  id          String      @id @default(cuid())
  userId      String
  friendName  String
  amount      Float
  dueDate     DateTime
  note        String?
  status      LoanStatus  @default(PENDING) // PENDING, REPAID, OVERDUE
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  repayments  Repayment[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Repayment {
  id          String   @id @default(cuid())
  loanId      String
  userId      String
  amount      Float
  loan        Loan     @relation(fields: [loanId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
}
```

### Core API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/health` | Service health status check | No |
| `POST` | `/api/auth/request-otp` | Sends/logs 6-digit verification code | No |
| `POST` | `/api/auth/verify-otp` | Validates OTP and returns JWT token | No |
| `GET` | `/api/user/profile` | Fetches user profile and lending stats | Yes |
| `PATCH` | `/api/user/profile` | Updates name, bio, and avatarUrl | Yes |
| `GET` | `/api/loans` | Retrieves all loans (search & filter enabled) | Yes |
| `POST` | `/api/loans` | Records a new loan | Yes |
| `GET` | `/api/loans/:id` | Detailed loan view with repayment records | Yes |
| `PATCH` | `/api/loans/:id/repay` | Marks a loan fully repaid & logs transaction | Yes |
| `GET` | `/api/summary` | Aggregated metrics for charts and hero cards | Yes |

---

## 🎨 Design System & Dual-Theme Engine

All UI elements adhere to a unified tokenized design system (`mobile/src/constants/theme.ts`):

```
                   DARK MODE (Fintech Navy)       LIGHT MODE (Slate & Emerald)
Primary Accent:    #34E0A1 (Vibrant Mint)         #059669 (Deep Emerald)
Background:        #090D14 (Midnight Navy)        #F8FAFC (Ultra-clean Slate)
Surface Card:      #111A26 (Deep Slate Surface)   #FFFFFF (Pure Card Surface)
Border:            #1C2A3A (Subtle Indigo Tint)   #E2E8F0 (Crisp Border)
Danger / Overdue:  #FF6370 (Coral Alert)          #E11D48 (Vivid Crimson)
Text Primary:      #F8FAFC (Pure White)           #0F172A (Deep Slate)
```

The app wraps all screens inside a `ThemeProvider` context which automatically synchronizes status bar colors, stack navigation headers, tab bars, and SVG chart fills.

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Node.js**: v20.x or v22.x
- **npm**: v9.x or higher
- **Expo Go** (Android/iOS) or a web browser

### Step 1: Clone & Configure Server

```bash
cd server
npm install

# Configure environment (copy .env.example if creating new)
# .env contains DATABASE_URL (Neon PostgreSQL) and JWT_SECRET

# Verify database connection and apply migrations
npx prisma db push

# Start the server (runs on http://localhost:4000)
npm run dev
```

### Step 2: Configure & Launch Mobile

```bash
cd mobile
npm install

# .env is already configured with your production Render backend:
# EXPO_PUBLIC_API_URL=https://ledgerly-gah5.onrender.com

# Start the Expo development server
npm start
```

Press:
- `w` to run directly in your Web Browser.
- `a` to run on an attached Android Emulator / Device.
- `i` to run on an iOS Simulator.
- Or scan the terminal QR code using **Expo Go** on your physical phone!

### Step 3: Mock OTP Login
1. On the app login screen, enter any valid phone number (e.g. `+91 98765 43210`).
2. Tap **Continue**.
3. Check the server terminal output for the generated OTP:
   ```text
   [MOCK OTP] +919876543210: 433698 (expires in 5 minutes)
   ```
4. Enter the 6-digit code in the app to authenticate.

---

## 🧪 Testing & Quality Assurance

Both the mobile application and backend server feature comprehensive automated test suites and strict TypeScript verification:

```bash
# Test & Typecheck Backend
cd server
npm run typecheck   # 0 TypeScript errors
npm test            # 6 Vitest tests passing (Health, Auth, Profile, Loans, Summary)

# Test & Typecheck Mobile
cd mobile
npm run typecheck   # 0 TypeScript errors
npm test            # 17 Vitest tests passing (Formatters, Overdue Logic, Zod Schemas)
```

---

## 🎙️ Human Pitch & 3-Minute Demo Walkthrough Guide

Use this script when presenting MiniLedger 2.0 to recruiters, stakeholders, or in an assignment demonstration video:

### 1. Opening Hook (0:00 – 0:30)
> *"We’ve all been in that awkward situation where we lend money to a friend or colleague, only for weeks to pass in silence. You don’t want to ruin the friendship by sounding aggressive, but you also don’t want to lose your hard-earned money. That’s why we created **MiniLedger 2.0**—a personal lending tracker that combines the sophistication of modern fintech with the friendly delight of Duolingo."*

### 2. The Dashboard & Analytics (0:30 – 1:15)
> *"Right on the home screen, our hero financial card gives users total transparency: Total Lent, Total Repaid, and the Net Outstanding balance. Below that, our custom SVG Portfolio Donut chart breaks down healthy versus overdue debt with zero double-counting. We also include a 6-month and 12-month lending trend chart, and an 'Attention Needed' feed that immediately surfaces loans due in the next 7 days or overdue balances."*

### 3. Adding a Loan & The Duolingo Delight (1:15 – 1:55)
> *"Adding a loan takes less than ten seconds. Quick preset buttons like +₹1,000 or +₹2,000, combined with one-tap date shortcuts like '+15 Days', make data entry effortless. When a loan is repaid, tapping 'Mark as Repaid' doesn't just trigger an API mutation—it rewards the user with haptic feedback, celebratory badges, and our friendly leaf mascot, Leafy."*

### 4. Polite Reminders & Profile Customization (1:55 – 2:30)
> *"Instead of robotic dunning messages, MiniLedger generates polite, pre-composed reminder texts that can be sent directly via WhatsApp or SMS with one tap. Users can also customize their profile, select from 8 fun mascot avatars, and switch between our deep navy Dark Mode and clean emerald Light Mode."*

### 5. Architectural Polish & Wrap-up (2:30 – 3:00)
> *"Under the hood, MiniLedger is built with Expo SDK 58, React Native 0.88, TanStack Query for optimal server-state caching, React Hook Form with Zod validation, and an Express backend backed by Prisma and Neon PostgreSQL. Both the client and server boast 100% passing automated test suites and strict TypeScript coverage. MiniLedger turns awkward money talks into transparent, stress-free lending."*

---

## 👨‍💻 Tech Stack Summary

- **Mobile Client**: Expo SDK 58, React Native 0.88, Expo Router, TypeScript, TanStack Query v5, React Hook Form, Zod, Lucide Icons, Expo Haptics, React Native SVG.
- **Backend Server**: Node.js v22, Express, TypeScript, Prisma ORM, Neon PostgreSQL, JWT Auth, Supertest, Vitest.
- **Design Principles**: Duolingo-level delight, Indian digit grouping (`₹`), Accessible contrast ratios, Mobile-first responsive layouts.

---
*MiniLedger 2.0 — Developed with passion, polish, and precision.*
