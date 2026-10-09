import React, { useState } from 'react';
import { OptimizationResult } from '../types/energy';
import { Download, Filter, CheckCircle2, AlertTriangle, Battery, Sun, Zap, Info } from 'lucide-react';

interface OptimizerViewProps {
  result: OptimizationResult;
}

export const OptimizerView: React.FC<OptimizerViewProps> = ({ result }) => {
  const [filterMode, setFilterMode] = useState<'all' | 'solar' | 'peak' | 'battery'>('all');
  const { hourly, factoryConfig, totalSavingsInr, savingsPercentage, keyTakeaways } = result;

  const filteredRecords = hourly.filter((r) => {
    if (filterMode === 'solar') return r.availableSolar > 5;
    if (filterMode === 'peak') return r.isPeakHour;
    if (filterMode === 'battery') return r.batteryCharging > 1 || r.batteryDischarging > 1;
    return true;
  });

  const downloadCSV = () => {
    const headers = [
      'Hour',
      'Time',
      'Predicted Demand (kWh)',
      'Solar Available (kWh)',
      'Solar Used Direct (kWh)',
      'Battery Charging (kWh)',
      'Battery Discharging (kWh)',
      'Battery SOC (kWh)',
      'Battery SOC (%)',
      'Grid Import (kWh)',
      'Tariff (INR/kWh)',
      'Baseline Cost (INR)',
      'Optimized Cost (INR)',
      'Savings (INR)',
      'AI Strategy Reason',
    ];

    const rows = hourly.map((h) => [
      h.hour,
      h.timeLabel,
      h.predictedDemand,
      h.availableSolar,
      h.solarUsedDirectly,
      h.batteryCharging,
      h.batteryDischarging,
      h.batterySocKwh,
      h.batterySocPercent,
      h.gridPurchased,
      h.tariffPerKwh,
      h.baselineCost,
      h.optimizedCost,
      h.hourlySavings,
      `"${h.decisionReason.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ShaktiGrid_Optimization_${factoryConfig.name.replace(/\s+/g, '_')}_24h.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: AI Strategy Rationale Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-white">
                Deterministic AI Optimization Schedule
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold font-mono">
                ₹{Math.round(totalSavingsInr).toLocaleString('en-IN')} ({savingsPercentage}%) Daily Saved
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Mathematically balanced 24-hour linear dispatch respecting factory load priority, solar peak capture, battery C-rates, and TOU tariff arbitrage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Export Schedule (CSV)
            </button>
          </div>
        </div>

        {/* 4 Dispatch Phase Explanations */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-1">
              <Zap className="w-3.5 h-3.5" />
              1. Off-Peak Precharge (01-05h)
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              BESS charged at low tariff (₹{factoryConfig.touTariff.offPeakPrice}/kWh) to 50% buffer, leaving room for midday solar.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
              <Sun className="w-3.5 h-3.5" />
              2. Solar Priority (08-16h)
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              100% solar routed directly to active factory machinery first. Net surplus diverted into battery storage.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
              <Battery className="w-3.5 h-3.5" />
              3. Peak Tariff Shaving (18-22h)
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Stored solar discharged to replace grid draw during highest tariff window (₹{factoryConfig.touTariff.peakPrice}/kWh).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-2 text-purple-400 font-semibold mb-1">
              <Info className="w-3.5 h-3.5" />
              4. Energy Balance Check
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              Demand ≡ SolarUsed + BatDischarge + GridImport. Zero unmet demand throughout the cycle.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Schedule Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-300">Filter View:</span>
            <div className="flex gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                  filterMode === 'all'
                    ? 'bg-emerald-500/20 text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All 24 Hours
              </button>
              <button
                onClick={() => setFilterMode('solar')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                  filterMode === 'solar'
                    ? 'bg-amber-500/20 text-amber-400 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Solar Hours
              </button>
              <button
                onClick={() => setFilterMode('peak')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                  filterMode === 'peak'
                    ? 'bg-red-500/20 text-red-400 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Peak Tariff
              </button>
              <button
                onClick={() => setFilterMode('battery')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                  filterMode === 'battery'
                    ? 'bg-cyan-500/20 text-cyan-400 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Battery Active
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Showing {filteredRecords.length} of 24 hourly dispatch slots
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Hour</th>
                <th className="py-3 px-3">Predicted Demand</th>
                <th className="py-3 px-3">Solar Available</th>
                <th className="py-3 px-3">Solar Used Direct</th>
                <th className="py-3 px-3">Battery Chg / Dischg</th>
                <th className="py-3 px-3">Battery SOC</th>
                <th className="py-3 px-3">Grid Import</th>
                <th className="py-3 px-3">Tariff</th>
                <th className="py-3 px-3">Hourly Cost</th>
                <th className="py-3 px-3">Savings</th>
                <th className="py-3 px-4">AI Optimizer Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredRecords.map((r) => {
                const isDischarging = r.batteryDischarging > 0;
                const isCharging = r.batteryCharging > 0;
                const hasSavings = r.hourlySavings > 0;

                return (
                  <tr
                    key={r.hour}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      r.isPeakHour
                        ? 'bg-amber-500/5'
                        : r.availableSolar > 20
                        ? 'bg-emerald-500/5'
                        : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {r.timeLabel}
                      {r.isPeakHour && (
                        <span className="ml-1.5 text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-sans">
                          PEAK
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-200">{r.predictedDemand} kWh</td>
                    <td className="py-3 px-3 text-amber-400">
                      {r.availableSolar > 0 ? `${r.availableSolar} kWh` : '-'}
                    </td>
                    <td className="py-3 px-3 text-emerald-400">
                      {r.solarUsedDirectly > 0 ? `${r.solarUsedDirectly} kWh` : '-'}
                    </td>
                    <td className="py-3 px-3">
                      {isCharging ? (
                        <span className="text-emerald-400 font-semibold">
                          +{r.batteryCharging} kWh
                        </span>
                      ) : isDischarging ? (
                        <span className="text-cyan-400 font-semibold">
                          -{r.batteryDischarging} kWh
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {r.batterySocPercent}%{' '}
                      <span className="text-[10px] text-slate-500">({r.batterySocKwh} kWh)</span>
                    </td>
                    <td className="py-3 px-3">
                      {r.gridPurchased > 0 ? (
                        <span className="text-purple-300">{r.gridPurchased} kWh</span>
                      ) : (
                        <span className="text-emerald-400 font-semibold">0 kWh (Islanded)</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-300">₹{r.tariffPerKwh.toFixed(2)}</td>
                    <td className="py-3 px-3 font-semibold text-white">₹{r.optimizedCost}</td>
                    <td className="py-3 px-3">
                      {hasSavings ? (
                        <span className="text-emerald-400 font-bold">+₹{r.hourlySavings}</span>
                      ) : (
                        <span className="text-slate-500">₹0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-sans text-xs text-slate-300 max-w-xs truncate" title={r.decisionReason}>
                      {r.decisionReason}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
