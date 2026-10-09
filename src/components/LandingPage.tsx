import React from 'react';
import {
  Zap,
  TrendingDown,
  Sun,
  BatteryCharging,
  Cpu,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  Factory,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { EnergyFlowDiagram } from './EnergyFlowDiagram';
import { OptimizationResult } from '../types/energy';

interface LandingPageProps {
  onLaunchDashboard: () => void;
  onExploreFeatures: () => void;
  result: OptimizationResult;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchDashboard,
  onExploreFeatures,
  result,
}) => {
  return (
    <div className="space-y-24 py-6">
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 pb-12 overflow-hidden">
        {/* Glow ambient background orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-emerald-500/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>AI-Driven Industrial Energy Optimization</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300 font-normal">v2.4 Prototype</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Power Your Industry <br className="hidden sm:block" />
            <span className="gradient-text-emerald">Intelligently.</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            <strong className="text-white font-semibold">ShaktiGrid AI</strong> helps factories and commercial enterprises reduce electricity costs, eliminate peak tariff surcharges, and curtail energy waste by orchestrating rooftop solar, battery storage (BESS), and dynamic grid tariffs in real time.
          </p>

          {/* Tagline Pill */}
          <div className="text-xs sm:text-sm font-medium text-cyan-300/90 tracking-wide uppercase font-mono">
            Smart Energy. Lower Costs. A Greener Future.
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onLaunchDashboard}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              Launch Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreFeatures}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all hover:border-slate-600 cursor-pointer"
            >
              Explore AI Features
            </button>
          </div>

          {/* KPI Snapshot Pills */}
          <div className="pt-8 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>₹4.2L+ Avg Annual Factory Savings</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>32% - 45% Grid Independence</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Zero Hardware Required (Software AI)</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Energy Flow Diagram */}
        <div className="max-w-5xl mx-auto mt-12">
          <div className="text-center mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Interactive 24-Hour Energy Dispatch Model — Try Scrubbing the Timeline
            </span>
          </div>
          <EnergyFlowDiagram
            hourlyRecords={result.hourly}
            factoryName={result.factoryConfig.name}
          />
        </div>
      </section>

      {/* 2. CORE FEATURES SECTION */}
      <section id="features" className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-white">
            Engineered for Modern Industrial Plants
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Traditional factories run on dumb, reactive power meters. ShaktiGrid AI introduces autonomous mathematical optimization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Demand Prediction */}
          <div className="p-6 rounded-2xl glass-panel glass-panel-hover border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Demand Prediction</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Anticipates factory shift loads, heavy machinery startups, and thermal compressor surges 24 hours in advance with high accuracy.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-purple-300 font-mono">
              ✓ Multi-Shift Load Modeling
            </div>
          </div>

          {/* Card 2: Solar Optimization */}
          <div className="p-6 rounded-2xl glass-panel glass-panel-hover border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Sun className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Solar Self-Consumption</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Prioritizes direct clean solar consumption on factory machinery, preventing wasteful export at low feed-in tariffs.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-amber-300 font-mono">
              ✓ 98%+ Renewable Capture
            </div>
          </div>

          {/* Card 3: Battery Management */}
          <div className="p-6 rounded-2xl glass-panel glass-panel-hover border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                <BatteryCharging className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Battery TOU Arbitrage</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pre-charges BESS during cheap night hours (₹4.8/kWh) and aggressively discharges during peak penalty windows (₹12.2/kWh).
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-cyan-300 font-mono">
              ✓ Peak Tariff Shaving
            </div>
          </div>

          {/* Card 4: Cost Reduction */}
          <div className="p-6 rounded-2xl glass-panel glass-panel-hover border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <TrendingDown className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Cost & CO₂ Reduction</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Saves up to 35% on monthly electricity bills while shrinking industrial carbon emissions with certified accounting metrics.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-emerald-300 font-mono">
              ✓ Verified ₹ ROI Tracking
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
            Optimized Execution Pipeline
          </div>
          <h2 className="text-3xl font-extrabold text-white">How ShaktiGrid AI Works</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            From raw tariff schedules to minute-by-minute dispatch commands in four deterministic steps:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              step: '01',
              title: 'Telemetry Ingestion',
              desc: 'Configures factory load shapes, shift hours, solar array kWp, and utility tariff structure (Peak/Off-peak).',
            },
            {
              step: '02',
              title: 'Solar & Load Forecast',
              desc: 'Synthesizes expected hourly irradiance bell curve and process machinery power draws.',
            },
            {
              step: '03',
              title: 'Linear Dispatch Engine',
              desc: 'Executes mathematical optimization balancing energy conservation, C-rate limits, and battery DoD safety.',
            },
            {
              step: '04',
              title: 'Savings & Anomaly Actions',
              desc: 'Generates automated dispatch schedules, flags flexible load shifting, and tracks verified rupee savings.',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 relative">
              <span className="text-3xl font-black text-slate-800 font-mono block mb-2">
                {item.step}
              </span>
              <h4 className="text-sm font-bold text-white mb-1.5">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. IMPACT SECTION */}
      <section className="max-w-6xl mx-auto glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
              Proven Industrial Economics
            </span>
            <h2 className="text-3xl font-extrabold text-white leading-tight">
              Illustrative Savings for a Mid-Size Manufacturing Plant
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Based on a benchmark continuous foundry plant with 1,850 kWh daily demand, 220 kW solar, and 450 kWh BESS:
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Avoided ₹12.20/kWh peak tariff penalty charges between 18:00 - 22:00</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Zero grid power purchased during peak solar production (11:00 - 15:00)</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Contract demand shaved by 48 kW, protecting factory from utility surcharges</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Daily Electricity Savings</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                ₹{Math.round(result.totalSavingsInr).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-emerald-500 font-medium mt-1">
                {result.savingsPercentage}% overall cost cut
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Annual Savings Run-rate</div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                ₹{Math.round((result.totalSavingsInr * 365) / 100000).toFixed(1)}L
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Projected 365-day return
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Solar Self-Consumption</div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                {result.solarSelfConsumptionRate}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Minimal clipping waste
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">CO₂ Offset / Year</div>
              <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
                {Math.round((result.carbonOffsetKg * 365) / 1000)} T
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Metric tons of carbon avoided
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="border-t border-slate-800 pt-12 pb-8 text-xs text-slate-400 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white tracking-wide">ShaktiGrid AI</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Smart Energy. Lower Costs. A Greener Future. Next-generation energy intelligence platform for Indian industrial facilities.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-[11px]">Platform</h4>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={onLaunchDashboard} className="hover:text-emerald-400">Energy Dashboard</button></li>
              <li><button onClick={onExploreFeatures} className="hover:text-emerald-400">Demand Optimizer</button></li>
              <li><button onClick={onLaunchDashboard} className="hover:text-emerald-400">Waste Detection</button></li>
              <li><button onClick={onLaunchDashboard} className="hover:text-emerald-400">AI Energy Advisor</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-[11px]">Technology Stack</h4>
            <ul className="space-y-2 text-[11px] text-slate-400">
              <li>React 19 + TypeScript</li>
              <li>Tailwind CSS Design Tokens</li>
              <li>Recharts Industrial Visualizer</li>
              <li>Deterministic Linear Dispatch Engine</li>
              <li>FastAPI & Python 3.14 Compatible</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-[11px]">Hackathon & Ethics Notice</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              This application is a hackathon prototype demonstrating energy optimization algorithms. All telemetry data, savings calculations, and load profiles are mathematically simulated. No physical hardware connection is required.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px]">
          <div>
            © {new Date().getFullYear()} ShaktiGrid AI. Built for AI Energy Optimization Hackathon.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400 font-mono">Status: All Algorithms Active (100% Client-Side Ready)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
