import React, { useState } from 'react';
import { OptimizationResult } from '../types/energy';
import { EnergyFlowDiagram } from './EnergyFlowDiagram';
import { DashboardCharts } from './DashboardCharts';
import {
  Zap,
  Sun,
  BatteryCharging,
  TrendingDown,
  Clock,
  Sparkles,
  Sliders,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

interface EnergyDashboardProps {
  result: OptimizationResult;
  onOpenConfig: () => void;
  onReoptimize: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const EnergyDashboard: React.FC<EnergyDashboardProps> = ({
  result,
  onOpenConfig,
  onReoptimize,
  onNavigateToTab,
}) => {
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days'>('today');
  const [selectedHour, setSelectedHour] = useState<number>(12); // Default to midday

  const {
    factoryConfig,
    totalDemandKwh,
    totalSolarGenKwh,
    totalGridPurchasedKwh,
    finalBatterySocKwh,
    baselineTotalCost,
    optimizedTotalCost,
    totalSavingsInr,
    savingsPercentage,
    solarSelfConsumptionRate,
    gridIndependenceRate,
    keyTakeaways,
  } = result;

  // Multiplier for 7-day or 30-day view
  const multiplier = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 1;
  const timeLabel = timeRange === 'today' ? 'Today (24h)' : timeRange === '7days' ? 'Last 7 Days' : 'Last 30 Days';

  const currentBatterySocPercent = Math.round(
    (finalBatterySocKwh / factoryConfig.batteryCapacityKwh) * 100
  );

  return (
    <div className="space-y-6">
      {/* 1. TOP NOTICE & TIME SELECTOR BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl glass-panel">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            SIMULATED DEMO DATA ACTIVE
          </div>
          <span className="text-xs text-slate-300 hidden sm:inline">
            Active Plant: <strong className="text-white">{factoryConfig.name}</strong>
          </span>
        </div>

        {/* Controls: Time Selector & Config Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                timeRange === 'today'
                  ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Today (24h)
            </button>
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                timeRange === '7days'
                  ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30days')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                timeRange === '30days'
                  ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              30 Days
            </button>
          </div>

          <button
            onClick={onOpenConfig}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            Factory Setup
          </button>
        </div>
      </div>

      {/* 2. SIX CORE KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* KPI 1: Demand */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Total Demand</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">
              {(totalDemandKwh * multiplier).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">kWh ({timeLabel})</div>
          </div>
          <div className="text-[10px] text-emerald-400 mt-2 font-medium flex items-center gap-1">
            <span>100% Demand Met</span>
          </div>
        </div>

        {/* KPI 2: Solar Generation */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Solar Generated</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              {(totalSolarGenKwh * multiplier).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">kWh generation</div>
          </div>
          <div className="text-[10px] text-amber-300 mt-2 font-medium">
            {solarSelfConsumptionRate}% Self-consumed
          </div>
        </div>

        {/* KPI 3: Grid Consumed */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Grid Electricity</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-purple-300 font-mono">
              {(totalGridPurchasedKwh * multiplier).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">kWh imported</div>
          </div>
          <div className="text-[10px] text-purple-400 mt-2 font-medium">
            Shaved {((result.baselineGridPurchasedKwh - totalGridPurchasedKwh) * multiplier).toLocaleString()} kWh
          </div>
        </div>

        {/* KPI 4: Battery SOC */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Battery Charge</span>
            <BatteryCharging className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
              {currentBatterySocPercent}%
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              {finalBatterySocKwh} / {factoryConfig.batteryCapacityKwh} kWh
            </div>
          </div>
          <div className="text-[10px] text-cyan-300 mt-2 font-medium">
            {gridIndependenceRate}% Independence
          </div>
        </div>

        {/* KPI 5: Current Cost */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Optimized Cost</span>
            <span className="text-xs font-bold text-slate-400">₹</span>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">
              ₹{(optimizedTotalCost * multiplier).toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              vs ₹{(baselineTotalCost * multiplier).toLocaleString('en-IN')} base
            </div>
          </div>
          <div className="text-[10px] text-emerald-400 mt-2 font-medium">
            TOU Arbitrage applied
          </div>
        </div>

        {/* KPI 6: Estimated Savings */}
        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 shadow-lg shadow-emerald-500/10 flex flex-col justify-between ring-1 ring-emerald-500/20">
          <div className="flex items-center justify-between text-emerald-300 text-xs mb-1.5">
            <span className="font-semibold">Net Savings</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              ₹{(totalSavingsInr * multiplier).toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-emerald-300 font-mono mt-0.5">
              {savingsPercentage}% Cost Cut
            </div>
          </div>
          <div className="text-[10px] text-emerald-200 mt-2 font-medium">
            +{(result.carbonOffsetKg * multiplier).toLocaleString()} kg CO₂ cut
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE ENERGY FLOW GRAPHIC */}
      <EnergyFlowDiagram
        hourlyRecords={result.hourly}
        currentHour={selectedHour}
        onHourChange={setSelectedHour}
        factoryName={factoryConfig.name}
      />

      {/* 4. RECHARTS COMPONENT */}
      <DashboardCharts result={result} timeRange={timeRange} />

      {/* 5. AI KEY TAKEAWAYS CARD */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Optimization Highlights & Insights Summary
            </h3>
          </div>
          <button
            onClick={() => onNavigateToTab('insights')}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
          >
            View All Insights <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {keyTakeaways.map((takeaway, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-slate-200 leading-relaxed">{takeaway}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
