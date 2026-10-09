import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { OptimizationResult } from '../types/energy';

interface DashboardChartsProps {
  result: OptimizationResult;
  timeRange: 'today' | '7days' | '30days';
}

const PIE_COLORS = ['#10b981', '#06b6d4', '#8b5cf6'];

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ result, timeRange }) => {
  const { hourly, totalSolarUsedKwh, totalBatteryDischargedKwh, totalGridPurchasedKwh } = result;

  // Scale data for 7-day and 30-day views
  const multiplier = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 1;

  // Line/Area Chart Data
  const hourlyChartData = hourly.map((h) => ({
    time: h.timeLabel,
    Demand: Math.round(h.predictedDemand * multiplier),
    Solar: Math.round(h.availableSolar * multiplier),
    Grid: Math.round(h.gridPurchased * multiplier),
    BatterySOC: h.batterySocPercent,
    isPeak: h.isPeakHour,
  }));

  // Cost Comparison Bar Chart Data
  const costChartData = hourly.map((h) => ({
    time: h.timeLabel,
    BaselineCost: Math.round(h.baselineCost * multiplier),
    OptimizedCost: Math.round(h.optimizedCost * multiplier),
    Savings: Math.max(0, Math.round((h.baselineCost - h.optimizedCost) * multiplier)),
    tariff: h.tariffPerKwh,
  }));

  // Donut Chart Data
  const energyMixData = [
    { name: 'Solar Direct', value: Math.round(totalSolarUsedKwh * multiplier) },
    { name: 'Battery (BESS)', value: Math.round(totalBatteryDischargedKwh * multiplier) },
    { name: 'Grid Import', value: Math.round(totalGridPurchasedKwh * multiplier) },
  ];
  const totalEnergySupplied = energyMixData.reduce((acc, curr) => acc + curr.value, 0);

  // Custom Dark Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs">
          <p className="font-bold text-white mb-1.5 border-b border-slate-800 pb-1 flex justify-between gap-4">
            <span>Hour: {label}</span>
            {payload[0]?.payload?.isPeak && (
              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded">Peak Tariff</span>
            )}
          </p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex justify-between items-center gap-4">
                <span style={{ color: entry.color }} className="font-medium">
                  {entry.name}:
                </span>
                <span className="font-mono text-slate-200 font-semibold">
                  {entry.value.toLocaleString()} {entry.name.includes('Cost') || entry.name.includes('Savings') ? '₹' : entry.name.includes('SOC') ? '%' : 'kWh'}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Chart 1: 24h Generation & Demand Profiles */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Power Dispatch & Demand Balancing
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hourly comparison of factory demand, solar PV generation, and optimized grid import
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" /> Solar PV
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" /> Demand
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-400 inline-block" /> Grid
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-cyan-400 inline-block" /> Battery SOC %
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={hourlyChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis
                yAxisId="power"
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                unit={timeRange === 'today' ? ' kW' : ' kWh'}
              />
              <YAxis
                yAxisId="soc"
                orientation="right"
                domain={[0, 100]}
                stroke="#06b6d4"
                tick={{ fontSize: 11 }}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                yAxisId="power"
                type="monotone"
                dataKey="Solar"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#solarGrad)"
              />
              <Area
                yAxisId="power"
                type="monotone"
                dataKey="Demand"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#demandGrad)"
              />
              <Line
                yAxisId="power"
                type="monotone"
                dataKey="Grid"
                stroke="#a855f7"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="soc"
                type="monotone"
                dataKey="BatterySOC"
                stroke="#06b6d4"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row of 2 Charts: Energy Source Mix (Donut) & Hourly Cost Comparison (Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Donut Chart: Energy Mix (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Energy Source Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown of power used to satisfy total load
            </p>
          </div>

          <div className="h-56 relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={energyMixData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {energyMixData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const pct = totalEnergySupplied > 0 ? Math.round((data.value / totalEnergySupplied) * 100) : 0;
                      return (
                        <div className="bg-slate-900/90 border border-slate-700 p-2 rounded-lg text-xs shadow-lg">
                          <p className="font-semibold text-white">{data.name}</p>
                          <p className="text-emerald-400 font-mono">
                            {data.value.toLocaleString()} kWh ({pct}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-bold text-white font-mono">
                {result.gridIndependenceRate}%
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Clean / Buffer</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center text-xs">
            {energyMixData.map((item, idx) => {
              const pct = totalEnergySupplied > 0 ? Math.round((item.value / totalEnergySupplied) * 100) : 0;
              return (
                <div key={item.name} className="p-2 rounded-lg bg-slate-900/50">
                  <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] mb-0.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <div className="font-bold text-white font-mono">{pct}%</div>
                  <div className="text-[10px] text-slate-500 font-mono">{item.value.toLocaleString()} kWh</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bar Chart: Cost Comparison Before & After (3 cols) */}
        <div className="lg:col-span-3 glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Hourly Electricity Cost: Baseline vs Optimized
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Savings generated by peak shaving & tariff arbitrage
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-600 inline-block" /> Baseline (Unmanaged)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> ShaktiGrid AI
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit=" ₹" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="BaselineCost" name="Baseline Cost" fill="#475569" radius={[3, 3, 0, 0]} />
                <Bar dataKey="OptimizedCost" name="Optimized Cost" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
