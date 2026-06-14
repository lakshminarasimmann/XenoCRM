# Xeno AI-Native CRM Engine

An AI-native CRM Engine built for the Xeno SDE Internship Drive. This product helps consumer brands organize customer data, build audiences using natural language, and intelligently dispatch campaigns through a simulated communication channel.

---

## Architecture & Repositories

This project is intentionally split into three logical components to demonstrate clean system design and separation of concerns:

1. **CRM Core Backend (`/backend-crm`)**: The main brain. Built with Node.js, Express, and Prisma ORM (SQLite). It handles API requests, robust AI integrations via Google Gemini, and webhook processing.
2. **Channel Service Stub (`/backend-channel`)**: A standalone Node.js service simulating a provider like Twilio/Gupshup. It accepts send requests and asynchronously fires simulated delivery, open, and click webhooks back to the CRM using realistic engagement percentages.
3. **Frontend (`/frontend`)**: A Vite + React web app featuring a premium dark-mode UI with glassmorphism, animated branding, and an AI-native chat-first interface.

---

## 🌟 Unique AI-Native Features

*   **Natural Language to SQL**: In the Audience Builder, you don't use complex dropdowns. You type *"Find customers who spent more than $100"*, and the Google Gemini API translates that directly into a highly optimized Prisma database query.
*   **Generative A/B Campaigns**: Simply give the AI a goal (e.g., *"Offer a 20% discount to win them back"*). The AI will act as your copywriter and generate 3 distinct SMS variants (Aggressive, Friendly, Direct).
*   **AI Campaign Simulator & Guardrails**: Before dispatching, users can click "Simulate Campaign". Gemini analyzes the message content and audience statistics to estimate Delivery Probability, Open Rate, CTR, and Spam Probability.
    * *Compliance Engine*: If a user attempts to send highly spammy or illegal texts, the backend forces Gemini to return strict JSON validation flags, blocking the campaign from launching to protect brand reputation.
*   **Post-Mortem AI Insights**: Instead of just staring at charts, the Dashboard feeds live webhook campaign metrics (Sent, Delivered, Opened, Clicked) back into Gemini to generate a human-readable performance summary and actionable strategic advice for the next campaign.
*   **Massive Demo Dataset**: The database comes pre-loaded with **10,000 unique dummy customers** (generated via Faker) with randomized spending habits and order histories, allowing you to instantly test complex high-volume filters.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- A Google Gemini API Key

### 1. Setup CRM Backend & 10,000 Dummy Records
```bash
cd backend-crm
npm install

# IMPORTANT: Add your Gemini API Key to the .env file
# GEMINI_API_KEY="your-api-key-here"

npx prisma generate
npx prisma db push

# This script uses Faker to inject 10,000 unique dummy records into your local SQLite DB.
# It takes about 5-10 seconds to process all batches.
npx tsx prisma/seed.ts

npm run dev # Starts on port 3000
```

### 2. Setup Channel Service (The Twilio Simulator)
```bash
cd backend-channel
npm install
npm run dev # Starts on port 3001
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev # Starts on port 5173
```

---

## Testing & Validation Guide

Once the three servers are running, open your browser to `http://localhost:5173`. Here is a guaranteed workflow to test the engine:

1. **Test the Audience Builder**: Go to the Audience tab and type `"Customers who have spent more than $1,000 total"`. The AI will query the 10,000 dummy records and find exactly ~5,000 matching VIPs.
2. **Test the Drafter**: Go to Campaigns, select the audience, and ask the AI to *"Give them a VIP20 discount code"*. It will instantly draft 3 options.
3. **Test the Compliance Simulator**: Select an option and click *Simulate*. Then, manually edit the text to something highly illegal (e.g., `"URGENT YOU WON MONEY CLICK HERE"`). Click *Validate & Launch* and watch the AI physically block your request.
4. **Test the Dispatcher**: Fix the text to be friendly and launch. You will be redirected to the Dashboard where you can watch mock-webhooks flow in real-time, updating your charts and generating Post-Mortem AI Insights.
