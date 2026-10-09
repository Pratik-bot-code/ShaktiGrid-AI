import React, { useState } from 'react';
import { OptimizationResult, ScenarioComparison } from '../types/energy';
import { generateScenarioComparisons } from '../utils/optimizer';
import {
  Download,
  RotateCcw,
  Calendar,
  Layers,
  TrendingUp,
  Leaf,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

interface ReportsViewProps {
  result: OptimizationResult;
  onResetDefaults: () => void;
  onOpenConfig: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  result,
  onResetDefaults,
  onOpenConfig,
}) => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'annual'>('monthly');
  const scenarios = generateScenarioComparisons(result);

  const multiplier =
    timeframe === 'daily'
      ? 1
      : timeframe === 'weekly'
      ? 7
      : timeframe === 'monthly'
      ? 30
      : 365;

  const downloadFullReportCSV = () => {
    const headers = [
      'Scenario',
      'Grid Electricity (kWh)',
      'Solar Utilized (kWh)',
      'Battery Discharged (kWh)',
      'Period Cost (INR)',
      'Savings vs Grid Only (INR)',
      'CO2 Offset (kg)',
    ];

    const rows = scenarios.map((s) => [
      `"${s.name}"`,
      s.gridPurchasedKwh * multiplier,
      s.solarUtilizedKwh * multiplier,
      s.batteryThroughputKwh * multiplier,
      s.dailyCostInr * multiplier,
      s.savingsVsBaselineInr * multiplier,
      s.co2OffsetKg * multiplier,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [`ShaktiGrid AI Scenario Simulation Report - ${result.factoryConfig.name} (${timeframe.toUpperCase()})`,
        '',
        headers.join(','),
        ...rows.map((e) => e.join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ShaktiGrid_${result.factoryConfig.id}_${timeframe}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-wide">
              Scenario Modeling & Long-term Projections
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Compare 4 operating strategies across Daily, Weekly, Monthly, and Annual horizons for {result.factoryConfig.name}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Timeframe Selector */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {(['daily', 'weekly', 'monthly', 'annual'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                  timeframe === t
                    ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Export CSV */}
          <button
            onClick={downloadFullReportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          {/* Reset Defaults */}
          <button
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            title="Reset to benchmark default values"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
        </div>
      </div>

      {/* 4 Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {scenarios.map((scenario, idx) => {
          const isOptimized = idx === 3;
          const cost = scenario.dailyCostInr * multiplier;
          const gridKwh = scenario.gridPurchasedKwh * multiplier;
          const solarKwh = scenario.solarUtilizedKwh * multiplier;
          const savings = scenario.savingsVsBaselineInr * multiplier;
          const co2 = scenario.co2OffsetKg * multiplier;

          return (
            <div
              key={scenario.name}
              className={`p-5 rounded-2xl glass-panel border transition-all flex flex-col justify-between ${
                isOptimized
                  ? 'border-emerald-500/50 bg-emerald-950/20 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                  : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    {scenario.name}
                  </h3>
                  {isOptimized && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                  {scenario.tagline}
                </p>

                {/* Main Cost Figure */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 mb-4">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                    Estimated {timeframe} Electricity Cost
                  </div>
                  <div className="text-xl font-extrabold text-white font-mono mt-0.5">
                    ₹{cost.toLocaleString('en-IN')}
                  </div>
                  {savings > 0 && (
                    <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Saves ₹{savings.toLocaleString('en-IN')}
                    </div>
                  )}
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Grid Import:</span>
                    <span className="text-slate-200">{gridKwh.toLocaleString()} kWh</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Solar Used:</span>
                    <span className="text-amber-400">{solarKwh.toLocaleString()} kWh</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>CO₂ Offset:</span>
                    <span className="text-emerald-400 font-medium">{co2.toLocaleString()} kg</span>
                  </div>
                </div>
              </div>

              {/* Status Pill */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-center">
                {isOptimized ? (
                  <span className="text-emerald-300 font-semibold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Best Economic & Carbon ROI
                  </span>
                ) : (
                  <span className="text-slate-500">
                    High peak penalty exposure
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Projection Matrix Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          Multi-Year Financial Projections & Payback Estimate
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-slate-400 text-[11px] mb-1">Annual Savings Potential</div>
            <div className="text-2xl font-bold text-emerald-400">
              ₹{(result.totalSavingsInr * 365).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 font-sans mt-1">
              Based on 365 days continuous optimization run-rate
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-slate-400 text-[11px] mb-1">Annual Carbon Avoided</div>
            <div className="text-2xl font-bold text-cyan-400">
              {Math.round((result.carbonOffsetKg * 365) / 1000)} Metric Tons CO₂
            </div>
            <div className="text-[11px] text-slate-400 font-sans mt-1">
              Equivalent to planting ~{Math.round((result.carbonOffsetKg * 365) / 21)} mature trees
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-slate-400 text-[11px] mb-1">BESS Capex Amortization</div>
            <div className="text-2xl font-bold text-amber-400">
              ~2.4 Years
            </div>
            <div className="text-[11px] text-slate-400 font-sans mt-1">
              Estimated payback period for battery energy storage system
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
