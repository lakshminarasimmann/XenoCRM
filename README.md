# Xeno AI-Native CRM Engine

An AI-native CRM Engine built for the Xeno SDE Internship Drive. This product helps consumer brands organize customer data, build audiences using natural language, and intelligently dispatch campaigns through a simulated communication channel.

---

## Architecture & Repositories

This project is intentionally split into three logical components to demonstrate clean system design and separation of concerns:

1. **CRM Core Backend (`/backend-crm`)**: The main brain. Built with Node.js, Express, and Prisma ORM (SQLite). It handles API requests, robust AI integrations via Google Gemini, and webhook processing.
2. **Channel Service Stub (`/backend-channel`)**: A standalone Node.js service simulating a provider like Twilio/Gupshup. It accepts send requests and asynchronously fires simulated delivery, open, and click webhooks back to the CRM using realistic engagement percentages.
3. **Frontend (`/frontend`)**: A Vite + React web app featuring a premium dark-mode UI with glassmorphism, animated branding, and an AI-native chat-first interface.

---

## 🌟 Unique AI-Native Features & Walkthrough

This CRM abandons traditional clunky UI filters and manual drafting in favor of a purely AI-driven workflow.

### 1. The AI-Powered Audience Builder
* **The Problem:** Marketers traditionally need to learn SQL or navigate complex, nested dropdown filters to find specific user cohorts.
* **The Solution:** Natural Language Processing.
* **How it works:** In the Audience Builder tab, the user simply types what they want in plain English (e.g., *"Find customers who spent more than $100"*). The Google Gemini API instantly translates this English prompt into a highly optimized Prisma/JSON database query, scans the underlying database, and returns the exact matching segment size without writing a single line of code.

### 2. Generative A/B Campaign Drafter
* **The Problem:** Writing marketing copy is time-consuming and prone to writer's block.
* **The Solution:** Generative AI acting as an instant copywriter.
* **How it works:** After building an audience, the user navigates to the Campaigns tab and types a goal (e.g., *"Offer a 20% discount to win them back"*). The AI instantly drafts 3 distinct, SMS-optimized variants: an Aggressive one, a Friendly one, and a Direct one.

### 3. Marketing Simulator & Compliance Guardrails
* **The Problem:** Sending bad or "spammy" marketing texts can ruin brand reputation and get the company blocked by telecom carriers.
* **The Solution:** Pre-flight AI simulation and physical compliance blocks.
* **How it works:** Before sending a campaign, the user clicks **Simulate**. Gemini analyzes the psychological tone of the text and predicts the *Delivery Probability, Open Rate, CTR, and Spam Probability*. 
* **The Guardrail:** If a user attempts to send highly spammy or illegal texts (e.g., *"URGENT YOU WON MONEY CLICK HERE"*), the backend forces Gemini to return strict JSON validation flags, physically blocking the campaign from launching.

### 4. Automated Dispatch & Webhook Analytics
* **The Problem:** Tracking SMS delivery status across thousands of users requires heavy infrastructure.
* **The Solution:** Microservice Architecture.
* **How it works:** Once launched, the CRM Core Engine loops through the segment and fires thousands of HTTP POST requests to the Channel Service. The Channel Service simulates sending the texts and asynchronously fires "Webhooks" back to the CRM reporting `DELIVERED`, `OPENED`, or `CLICKED` statuses, which update the Dashboard charts in real-time.

### 5. Post-Mortem AI Insights
* **The Problem:** Staring at raw data charts doesn't always yield actionable business advice.
* **The Solution:** Automated Strategic Analytics.
* **How it works:** On the Dashboard, the system feeds the final live webhook campaign metrics back into Gemini. Gemini reads the math and generates a human-readable performance summary (e.g., *"Your delivery rate was flawless, but your click rate was only 2%. The message was too passive. Next time, include a stronger Call to Action."*).

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

## Step-by-Step Demo Guide

Once the three servers are running, open your browser to `http://localhost:5173`. Here is a foolproof, step-by-step workflow to demonstrate the power of the engine:

1. **Test the Audience Builder**: Go to the Audience tab. Under "Describe your target audience", type this exact prompt: `"Customers who have spent more than $1,000 total"`. Click *Generate*. The AI will query the 10,000 dummy records and mathematically find exactly ~5,000 matching VIPs.
2. **Test the Drafter**: Go to Campaigns, select the audience you just built, and ask the AI to *"Give these VIP customers a 20% discount code (VIP20) as a thank you"*. It will instantly draft 3 options.
3. **Test the Compliance Simulator**: Select an option and click *Simulate Campaign* to see the predictions. Then, to test the compliance engine, manually edit the text to something highly illegal (e.g., `"URGENT YOU WON $1,000,000 CLICK HERE"`). Click *Validate & Launch* and watch the AI block your request with a Warning Modal.
4. **Test the Dispatcher**: Fix the text to be friendly and launch. You will be redirected to the Dashboard where you can watch mock-webhooks flow in real-time, updating your charts and generating Post-Mortem AI Insights based on the results!
