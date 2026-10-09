# ShaktiGrid AI — AI-Powered Industrial Energy Optimization Platform

> **Smart Energy. Lower Costs. A Greener Future.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-22b5bf?style=flat&logo=recharts&logoColor=white)](https://recharts.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)

---

## ⚡ 1. Project Overview

**ShaktiGrid AI** is a software-only industrial energy management and optimization platform. It helps manufacturing plants, textile mills, cold storage hubs, and commercial facilities dramatically slash electricity bills and minimize grid carbon footprints.

Traditional factories suffer from:
- Expensive Time-of-Use (TOU) peak tariff penalties (₹11–13/kWh during evening peak shifts).
- Curtailed or clipped rooftop solar energy during midday lunch dips.
- Inefficient unmanaged battery charging that degrades battery health.
- Lack of load-shifting foresight for non-critical batch operations.

**ShaktiGrid AI** solves this with an automated mathematical linear dispatch solver that models 24-hour factory demand, PV generation curves, BESS charge states, and tariff structures in real-time.

---

## 🚀 2. Quick Start

### Frontend (React + TypeScript + Vite)
```bash
# 1. Install Node dependencies (already installed)
npm install

# 2. Start the local Vite development server
npm run dev
```
Navigate to: **[http://localhost:5173/](http://localhost:5173/)**

### Optional Python Backend & Optimizer
```bash
# 1. Install Python requirements (in your .venv)
pip install -r requirements.txt

# 2. Run standalone optimization CLI test:
python backend/optimizer.py

# 3. (Optional) Run FastAPI REST server:
python backend/server.py
```

---

## ⏱️ 3. Three-Minute Hackathon Demo Script

For judging and presentation, follow this 7-step flow:

1. **Open Dashboard with Sample Factory Data:**
   - Launch the platform on the default plant: *Apex Precision Metal Casting Unit 4*.
   - Point out the 6 core KPI cards: **1,850 kWh demand**, **920 kWh solar**, **BESS SOC %**, and **₹2,920 daily savings (31.5% cost reduction)**.
   - Show the live **Energy Flow Architecture** diagram and scrub the 24-hour timeline slider.

2. **Examine Baseline Electricity Cost:**
   - Scroll to the **Hourly Electricity Cost Comparison** chart.
   - Show how the grey baseline unmanaged cost spikes heavily during evening hours (18:00 - 22:00) due to peak tariff penalties.

3. **Change Factory Inputs or Tariffs:**
   - Click the **"Factory Setup"** button in the header.
   - Switch to **"Surat Weaving & Silk Textiles Mill"** or **"Vikas Cold Storage"** with 1 click, or adjust solar kWp and battery capacity.

4. **Run AI Optimization Engine:**
   - Click **"Run AI Optimization"**.
   - The linear dispatch solver recalculates energy balance, battery C-rates, and tariff arbitrage in milliseconds.

5. **Display the Recommended Hourly Energy Schedule:**
   - Navigate to the **"AI Optimizer"** tab.
   - Filter by **"Peak Tariff"** or **"Battery Active"** hours.
   - Highlight the **AI Optimizer Rationale** column explaining why each specific dispatch decision was made (e.g. Off-peak pre-charging, midday solar storage, evening peak shaving).
   - Click **"Export Schedule (CSV)"** to show enterprise audit readiness.

6. **Compare Costs and Estimated Savings:**
   - Navigate to the **"Reports"** tab.
   - Compare the 4 scenarios: *100% Grid Reliance*, *Unmanaged Solar*, *Unmanaged Battery*, and *ShaktiGrid AI*.
   - Toggle between **Daily, Weekly, Monthly, and Annual** projections.

7. **Explain Actionable Energy Waste Insights:**
   - Navigate to the **"Waste Detection"** tab.
   - Show the detected anomalies (e.g., *High Peak-Hours Grid Import*, *Solar Curtailment Alert*, *Flexible Load Shifting Opportunity*).
   - Show the supporting telemetry data, confidence score (e.g., 96%), and estimated rupee impact.

---

## 🏛️ 4. Architecture & Technical Design

```
shaktigridai/
├── src/
│   ├── types/
│   │   └── energy.ts             # Strict TypeScript interfaces & data models
│   ├── utils/
│   │   ├── presets.ts            # Realistic Indian factory presets (Casting, Textile, etc.)
│   │   └── optimizer.ts          # Core 24h deterministic linear dispatch engine
│   ├── components/
│   │   ├── Navbar.tsx            # Header, tab navigation, demo trigger
│   │   ├── LandingPage.tsx       # Hero, features, how it works, impact metrics
│   │   ├── EnergyDashboard.tsx   # 6 KPI cards, time range filter, Recharts
│   │   ├── EnergyFlowDiagram.tsx # Interactive 24-hour animated SVG energy flow
│   │   ├── DashboardCharts.tsx   # Area/Line power curve, Donut mix, Bar cost chart
│   │   ├── FactoryConfigModal.tsx# Multi-tab form with presets and validation
│   │   ├── OptimizerView.tsx     # 24-hour dispatch schedule table & CSV export
│   │   ├── WasteDetectionView.tsx# Anomaly detection cards with severity & impact
│   │   ├── AiAdvisorView.tsx     # Grounded interactive energy assistant
│   │   ├── ReportsView.tsx       # 4 scenario models with multi-year ROI
│   │   └── DemoTourModal.tsx     # Interactive 3-minute hackathon walkthrough tour
│   ├── App.tsx                   # Main state container & tab router
│   ├── index.css                 # Dark industrial design tokens & glassmorphism
│   └── main.tsx                  # React 19 root
├── backend/
│   ├── optimizer.py              # Pure Python mathematical solver
│   └── server.py                 # FastAPI REST API
├── requirements.txt              # Python dependencies
└── package.json                  # React + Vite dependencies
```

---

## ⚖️ 5. Ethical & Prototype Disclosure

This application is a **hackathon prototype**. All energy generation profiles, factory demand curves, and financial savings are mathematically simulated using standard industrial benchmarks. No physical hardware connection or paid API keys are required.
