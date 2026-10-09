import React, { useState, useEffect } from 'react';
import { Sun, BatteryCharging, Factory, Zap, Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { HourlyRecord } from '../types/energy';

interface EnergyFlowDiagramProps {
  hourlyRecords: HourlyRecord[];
  currentHour?: number;
  onHourChange?: (hour: number) => void;
  factoryName: string;
}

export const EnergyFlowDiagram: React.FC<EnergyFlowDiagramProps> = ({
  hourlyRecords,
  currentHour: controlledHour,
  onHourChange,
  factoryName,
}) => {
  const [internalHour, setInternalHour] = useState<number>(13); // Default to 13:00 (1 PM) to show active solar
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const selectedHour = controlledHour !== undefined ? controlledHour : internalHour;
  const currentRecord = hourlyRecords[selectedHour] || hourlyRecords[12] || {
    hour: 12,
    timeLabel: '12:00',
    predictedDemand: 110,
    availableSolar: 160,
    solarUsedDirectly: 110,
    solarStoredInBattery: 50,
    batteryCharging: 50,
    batteryDischarging: 0,
    batterySocPercent: 78,
    gridPurchased: 0,
    tariffPerKwh: 8.2,
    isPeakHour: false,
    decisionReason: 'Solar priority: 100% factory demand met + 50 kWh stored in BESS',
  };

  // Auto-play timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setInternalHour((prev) => {
          const next = (prev + 1) % 24;
          if (onHourChange) onHourChange(next);
          return next;
        });
      }, 1400);
    }
    return () => clearInterval(interval);
  }, [isPlaying, onHourChange]);

  const handleHourSelect = (hour: number) => {
    setInternalHour(hour);
    if (onHourChange) onHourChange(hour);
  };

  const solarGen = currentRecord.availableSolar;
  const solarUsed = currentRecord.solarUsedDirectly;
  const solarToBat = currentRecord.solarStoredInBattery;
  const batDischarge = currentRecord.batteryDischarging;
  const batCharge = currentRecord.batteryCharging;
  const gridImport = currentRecord.gridPurchased;
  const demand = currentRecord.predictedDemand;
  const soc = currentRecord.batterySocPercent;
  const tariff = currentRecord.tariffPerKwh;

  const isSolarActive = solarGen > 2;
  const isBatCharging = batCharge > 1;
  const isBatDischarging = batDischarge > 1;
  const isGridImporting = gridImport > 1;

  return (
    <div className="rounded-2xl glass-panel p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title and Time Controller */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="text-lg font-semibold text-white tracking-wide">
              Live Energy Flow Architecture
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Simulated Dispatch
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time power routing across Solar, Battery Storage, Factory Loads & Grid for <span className="text-slate-200 font-medium">{factoryName}</span>
          </p>
        </div>

        {/* Time Scrubber & Controls */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
            title={isPlaying ? 'Pause 24h simulation' : 'Auto-play 24h simulation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play 24h'}</span>
          </button>

          <button
            onClick={() => handleHourSelect(12)}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            title="Reset to 12:00 Peak Solar"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800 text-xs text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-cyan-300 font-bold">{currentRecord.timeLabel}</span>
            {currentRecord.isPeakHour && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Peak Tariff
              </span>
            )}
            {currentRecord.isOffPeakHour && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Off-Peak
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Interactive 24-Hour Timeline Slider */}
      <div className="mb-6 px-2">
        <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
          <span>00:00 (Night)</span>
          <span className="text-amber-400/90 font-medium">12:00 (Solar Peak)</span>
          <span className="text-orange-400/90 font-medium">19:00 (Evening Tariff Peak)</span>
          <span>23:00</span>
        </div>
        <input
          type="range"
          min="0"
          max="23"
          value={selectedHour}
          onChange={(e) => handleHourSelect(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 transition-all hover:bg-slate-700"
        />
        <div className="flex justify-between items-center text-xs mt-2 text-slate-400">
          <span className="italic text-slate-300">
            AI Strategy: <span className="text-emerald-400">{currentRecord.decisionReason}</span>
          </span>
          <span className="font-mono text-slate-400">
            Grid Tariff: <span className="text-white font-semibold">₹{tariff.toFixed(2)}/kWh</span>
          </span>
        </div>
      </div>

      {/* Modern High-Tech Diagram Grid */}
      <div className="relative py-4">
        {/* SVG Flow Connections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {/* LEFT COLUMN: SOLAR ARRAY */}
          <div className="flex flex-col gap-6 justify-center">
            {/* Solar Node Card */}
            <div className={`p-5 rounded-xl border transition-all duration-300 ${
              isSolarActive
                ? 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-500/10'
                : 'bg-slate-900/60 border-slate-800 opacity-70'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2.5 rounded-lg ${
                    isSolarActive ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'
                  }`}>
                    <Sun className={`w-6 h-6 ${isSolarActive ? 'animate-spin-slow text-amber-400' : ''}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Rooftop Solar PV</h4>
                    <p className="text-[11px] text-slate-400">On-site Clean Generation</p>
                  </div>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded font-mono font-bold ${
                  isSolarActive ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {solarGen.toFixed(1)} kW
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Direct to Factory:</span>
                  <span className="text-emerald-400 font-semibold">{solarUsed.toFixed(1)} kW</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Surplus to BESS:</span>
                  <span className="text-cyan-400 font-semibold">{solarToBat.toFixed(1)} kW</span>
                </div>
              </div>
            </div>

            {/* BESS Node Card */}
            <div className={`p-5 rounded-xl border transition-all duration-300 ${
              isBatDischarging
                ? 'bg-cyan-950/30 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                : isBatCharging
                ? 'bg-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2.5 rounded-lg ${
                    isBatDischarging
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : isBatCharging
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    <BatteryCharging className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Smart BESS (Battery)</h4>
                    <p className="text-[11px] text-slate-400">
                      {isBatCharging ? '⚡ Charging' : isBatDischarging ? '🔋 Discharging' : 'Standby / Buffer'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-white">{soc}%</span>
                  <div className="text-[10px] text-slate-400">SOC</div>
                </div>
              </div>

              {/* Liquid SOC Bar */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full transition-all duration-500 ${
                    soc > 60 ? 'bg-emerald-400' : soc > 25 ? 'bg-cyan-400' : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.max(5, Math.min(100, soc))}%` }}
                />
              </div>

              <div className="space-y-1 text-xs font-mono">
                {isBatCharging && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Charge Rate:</span>
                    <span>+{batCharge.toFixed(1)} kW</span>
                  </div>
                )}
                {isBatDischarging && (
                  <div className="flex justify-between text-cyan-400 font-semibold">
                    <span>Discharge Rate:</span>
                    <span>-{batDischarge.toFixed(1)} kW</span>
                  </div>
                )}
                {!isBatCharging && !isBatDischarging && (
                  <div className="flex justify-between text-slate-500">
                    <span>Status:</span>
                    <span>Buffered for Peak Hours</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CENTER: DISPATCH ENGINE / INVERTER HUB */}
          <div className="flex flex-col items-center justify-center p-4">
            <div className="relative flex flex-col items-center">
              {/* Outer Pulsing Glow */}
              <div className="w-32 h-32 rounded-full border-2 border-dashed border-emerald-500/40 flex items-center justify-center animate-spin-slow bg-slate-900/80 shadow-2xl">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600/30 to-cyan-500/30 border border-emerald-400/50 flex flex-col items-center justify-center p-2 text-center">
                  <Zap className="w-7 h-7 text-emerald-300 animate-pulse" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider mt-1">
                    AI Dispatch
                  </span>
                </div>
              </div>

              {/* Dynamic dispatch tags */}
              <div className="mt-4 text-center">
                <span className="inline-block text-[11px] font-mono px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300">
                  Balance: {demand.toFixed(1)} kW Required
                </span>
                <p className="text-[11px] text-emerald-400/90 font-medium mt-1.5 max-w-[220px]">
                  {solarUsed > 0 && batDischarge > 0
                    ? 'Dual Solar + Battery Dispatch'
                    : solarUsed >= demand
                    ? '100% Clean Solar Powered'
                    : batDischarge > 0
                    ? 'BESS Peak Shaving Active'
                    : 'Grid Baseload Transition'}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: FACTORY LOAD & GRID */}
          <div className="flex flex-col gap-6 justify-center">
            {/* Factory Load Card */}
            <div className="p-5 rounded-xl border bg-slate-900/80 border-slate-700/80 shadow-lg relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Factory className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Factory Real Demand</h4>
                    <p className="text-[11px] text-slate-400">Total Consumption</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-white/10 text-white">
                  {demand.toFixed(1)} kW
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span className="text-emerald-400">From Solar:</span>
                  <span>{solarUsed.toFixed(1)} kW ({demand > 0 ? Math.round((solarUsed / demand) * 100) : 0}%)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-cyan-400">From Battery:</span>
                  <span>{batDischarge.toFixed(1)} kW ({demand > 0 ? Math.round((batDischarge / demand) * 100) : 0}%)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-purple-400">From Grid:</span>
                  <span>{gridImport.toFixed(1)} kW ({demand > 0 ? Math.round((gridImport / demand) * 100) : 0}%)</span>
                </div>
              </div>
            </div>

            {/* Electricity Grid Card */}
            <div className={`p-5 rounded-xl border transition-all duration-300 ${
              isGridImporting
                ? currentRecord.isPeakHour
                  ? 'bg-amber-950/30 border-amber-500/40'
                  : 'bg-purple-950/20 border-purple-500/30'
                : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2.5 rounded-lg ${
                    isGridImporting
                      ? currentRecord.isPeakHour ? 'bg-amber-500/20 text-amber-400' : 'bg-purple-500/20 text-purple-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Electricity Grid</h4>
                    <p className="text-[11px] text-slate-400">Utility Supply & Tariff</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                  gridImport > 0 ? 'bg-purple-500/20 text-purple-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {gridImport > 0 ? `${gridImport.toFixed(1)} kW` : '0 kW (Islanded)'}
                </span>
              </div>

              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Current Tariff:</span>
                  <span className="text-white font-semibold">₹{tariff.toFixed(2)}/kWh</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Hourly Cost:</span>
                  <span className="text-amber-400 font-semibold">₹{currentRecord.optimizedCost}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
