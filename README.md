# MiniLedger 1.0

MiniLedger is a personal lending and debt tracking application built with React Native and Node.js. It helps users manage loans, track repayments, monitor outstanding and overdue balances, and share polite repayment reminders.

The application features a financial dashboard with portfolio analytics, loan management, repayment tracking, user profile customization, and dark and light themes.

## Tech Stack

- **Mobile:** React Native, Expo, Expo Router, TypeScript
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Authentication:** JWT with mock phone OTP verification
- **Validation:** Zod

## Run Locally

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL database (or a Neon PostgreSQL connection)
- Expo Go or an Android emulator for running the mobile app

### 1. Clone the Repository

```bash
git clone https://github.com/AscendPriyansh/Ledgerly.git
cd Ledgerly
```

### 2. Set Up the Backend

```bash
cd server
npm install
```

Configure your environment variables in a `.env` file:

```env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_secret_key"
```

Initialize the database and start the backend:

```bash
npx prisma db push
npm run dev
```

The backend runs on `http://localhost:4000`, unless configured otherwise.

### 3. Set Up the Mobile App

Open a new terminal from the project root:

```bash
cd mobile
npm install
```

Configure the API URL in the mobile environment configuration. For a local backend, use the appropriate URL for your device:

```env
EXPO_PUBLIC_API_URL=http://localhost:4000
```

For a physical device, replace `localhost` with your computer's local network IP address. Ensure both devices are on the same network and your firewall allows the connection.

Start Expo:

```bash
npm start
```

- Press `a` to open the app in an Android emulator.
- Press `w` to open the web version, if supported.
- Scan the QR code with Expo Go to run it on a physical device.

### 4. Sign In

The application uses mock OTP authentication for development. Request an OTP from the login screen and check the backend terminal for the generated verification code.

## License

MIT
