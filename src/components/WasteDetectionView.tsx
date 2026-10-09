import React, { useState } from 'react';
import { OptimizationResult, EnergyInsight } from '../types/energy';
import { generateEnergyInsights } from '../utils/optimizer';
import {
  AlertTriangle,
  Zap,
  Sun,
  Clock,
  TrendingDown,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface WasteDetectionViewProps {
  result: OptimizationResult;
  onApplyInsight?: (insightId: string) => void;
}

export const WasteDetectionView: React.FC<WasteDetectionViewProps> = ({ result }) => {
  const [insights, setInsights] = useState<EnergyInsight[]>(() => generateEnergyInsights(result));
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'high' | 'medium' | 'info'>('all');
  const [appliedInsights, setAppliedInsights] = useState<{ [id: string]: boolean }>({});

  const filteredInsights = insights.filter((i) => {
    if (filterSeverity === 'all') return true;
    return i.severity === filterSeverity;
  });

  const totalPotentialMonthlySavings = insights.reduce((acc, curr) => acc + curr.potentialSavingsInr, 0);

  const handleApply = (id: string) => {
    setAppliedInsights((prev) => ({ ...prev, [id]: true }));
  };

  const getSeverityBadge = (severity: EnergyInsight['severity']) => {
    switch (severity) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
            <AlertTriangle className="w-3 h-3" /> High Severity
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Zap className="w-3 h-3" /> Medium Opportunity
          </span>
        );
      case 'info':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <CheckCircle className="w-3 h-3" /> Verified Status
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Potential Waste Recovery</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            ₹{totalPotentialMonthlySavings.toLocaleString('en-IN')}{' '}
            <span className="text-xs font-normal text-slate-400 font-sans">/ month</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">
            Across {insights.length} detected operational inefficiencies
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Peak Demand Stress Index</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {result.peakReductionKw > 0 ? `-${result.peakReductionKw} kW` : 'Balanced'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Max contract demand shaved from {result.peakGridDemandKw} kW to {result.optimizedPeakGridDemandKw} kW
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Solar Curtailment Rate</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {result.totalSolarCurtailedKwh} kWh{' '}
            <span className="text-xs font-normal text-slate-400 font-sans">
              ({result.totalSolarGenKwh > 0 ? Math.round((result.totalSolarCurtailedKwh / result.totalSolarGenKwh) * 100) : 0}% clipped)
            </span>
          </div>
          <p className="text-[11px] text-cyan-400 mt-1">
            {result.totalSolarCurtailedKwh === 0 ? 'Zero renewable energy wasted' : 'Surplus available for load shifting'}
          </p>
        </div>
      </div>

      {/* Sensor Disclaimer Notice */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Diagnostics Scope Note: </span>
          All waste patterns are detected via simulated hourly power flow profiles, tariff matrices, and load-curve analysis. ShaktiGrid AI does not infer mechanical motor bearing defects without dedicated vibration and thermal IoT sensors.
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Filter by Severity:</span>
          <div className="flex gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(['all', 'high', 'medium', 'info'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterSeverity(s)}
                className={`px-3 py-1 text-xs rounded-lg uppercase tracking-wider font-semibold transition-colors ${
                  filterSeverity === s
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Showing {filteredInsights.length} detected insights
        </span>
      </div>

      {/* Insight Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredInsights.map((insight) => {
          const isApplied = appliedInsights[insight.id];

          return (
            <div
              key={insight.id}
              className={`p-6 rounded-2xl glass-panel border transition-all flex flex-col justify-between ${
                insight.severity === 'high'
                  ? 'border-red-500/30 hover:border-red-500/60'
                  : insight.severity === 'medium'
                  ? 'border-amber-500/30 hover:border-amber-500/60'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-base font-bold text-white tracking-wide">
                    {insight.title}
                  </h3>
                  {getSeverityBadge(insight.severity)}
                </div>

                {/* Supporting Data */}
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 mb-4">
                  <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-1">
                    Supporting Telemetry Data
                  </div>
                  <div className="text-xs text-slate-200 font-mono">
                    {insight.supportingData}
                  </div>
                </div>

                {/* Impact */}
                <div className="space-y-2 text-xs mb-4">
                  <div>
                    <span className="text-slate-400 font-medium">Estimated Impact: </span>
                    <span className="text-slate-200">{insight.estimatedImpact}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium">Recommended Action: </span>
                    <span className="text-emerald-300 font-medium">{insight.recommendedAction}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Confidence</span>
                    <span className="text-xs font-bold text-cyan-400 font-mono">
                      {insight.confidenceScore}%
                    </span>
                  </div>
                  {insight.potentialSavingsInr > 0 && (
                    <div className="pl-3 border-l border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase">Value</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        +₹{insight.potentialSavingsInr.toLocaleString('en-IN')}/mo
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleApply(insight.id)}
                  disabled={isApplied}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isApplied
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" /> Applied to Model
                    </>
                  ) : (
                    <>
                      Simulate Action <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
