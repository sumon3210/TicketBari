# 🎟️ TicketBari - Premium Online Ticket Booking Platform

An ultra-premium, full-stack Online Ticket Booking Platform built using the modern **MERN stack paradigm** (Express, React, Node.js). Designed carefully to captivate recruiters and technical leads through pristine UI/UX alignment, absolute code fidelity, dynamic user roles, Stripe transaction processing, and deep system architecture.

---

## 🚀 Live URL
*   **Development Access Link:** [TicketBari Dev Platform](https://ais-dev-bwrq67n3dopl4daldi3iw4-882823174199.asia-southeast1.run.app)
*   **Shared Preview Link:** [TicketBari Shared Preview](https://ais-pre-bwrq67n3dopl4daldi3iw4-882823174199.asia-southeast1.run.app)

---

## 🎯 Project Purpose
**TicketBari** is built to bridge the gap between transit carrier operators and travelers across Bangladesh. Our vision is to eliminate the archaic queues for Bus, Train, Launch, and Flight routes by establishing a single-screen real-time inventory directory that supports instant vendor approvals and secure Stripe billing.

---

## 💎 Primary Recruiter-Captivating Highlights
*   **Complete Adaptive Dark/Light Mode Engine:** Fully native system styling variables with instantaneous CSS transition curves. No flashing or layout shifts.
*   **Stripe Merchant Simulated Checkout:** A completely styled credit card terminal implementing real cryptographic validations, dynamic bill computations, and particle canvas celebrations on success.
*   **Triple-Role Operations Terminal (User, Vendor, Admin Panels):**
    *   **Travelers:** Check countdown departures, cancel temporary pending reservations, buy tickets securely, and read printable billing transactions.
    *   **Vendors:** Register carrier operators readonly, list transport assets, update/delete items, approve/reject travelers' seats, and see dynamic Earnings charts.
    *   **Administrators:** Approve vendor rosters, flag fraudulent accounts (locks listings immediately), and promote featured routes to home advertisers (max 6 checked dynamically).

---

## 🛠️ Key Features
1.  **Dynamic Station Finder Search:** From ➔ To live inventory filter with Transport carrier type categories and Sort Budgets toggle.
2.  **Departure Countdown Timer:** Real-time javascript epoch calculations leading up to exact trip minutes. Hidden instantaneously if bookings get rejected.
3.  **Fraud Audit Guardrails:** If a vendor gets marked as Fraud, all associated routes vanish from client listings instantaneously and operational dashboard permissions get restricted.
4.  **Automatic Seating Reducer:** Once Stripe secure invoices clear, the server database transaction subtracts available seating seats safely.
5.  **Secure JWT Authentication:** Tokenized local cookie payload state authorization guarding core REST API routes cleanly.
6.  **Seamless State Restorations:** Logged-in credentials saved inside secure local storages. Refreshing a dashboard route will NOT throw a 404 or redirect unless a signature expires.

---

## 📦 Installed NPM Packages
*   `react` & `react-dom` — Core Single Page frontend engine
*   `react-router-dom` — Dynamic Client Router (with fallback 404 controllers)
*   `motion` (from `motion/react`) — Advanced hardware-accelerated SVG entry animations
*   `lucide-react` — Comprehensive iconography kit
*   `recharts` — Advanced custom SVG charting visualization for Vendor Revenues
*   `canvas-confetti` — Delightful celebrate particles trigger
*   `express` — High-speed API router backend
*   `jsonwebtoken` — Cryptographic User Authentication Tokens
*   `bcryptjs` — Blowfish password hashing
*   `dotenv` — Environment configuration keys wrapper

---

## 🛠️ Environment Variables Configuration

To run TicketBari locally or deploy to standard production platforms, you must configure the following key-value variables inside `.env`:

```env
# Server Ingress Port (Default: 3000)
PORT=3000

# JSON Web Token Secret signature
JWT_SECRET="SUPER_CRYPTOGRAPHIC_SECURE_TOKEN_SIGNATURE_KEY"

# MongoDB Database URI Credentials 
# (Currently abstracts into data/db.json during local developer testing for immediate zero-config previews!)
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/ticketbari"
```

---

## 🏁 Deployed Build, Run & Development Guides

### 1. Developer Live Sandbox
Instantly spin up BOTH the express backend database proxy server alongside Vite asset compiling:
```bash
npm run dev
```

### 2. Standalone Production Build
Vite compiles the React asset package to `/dist`, and esbuild packs the Express backend down into a single, lightning-efficient static CommonJS `dist/server.cjs` file, eliminating CORS, file path, and relative ES module complaints on Cloud Run container deployments:
```bash
npm run build
```

### 3. Production Boot
Directly boot the compiled Node instance:
```bash
npm run start
```
