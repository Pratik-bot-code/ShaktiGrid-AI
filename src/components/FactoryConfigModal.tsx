import React, { useState } from 'react';
import { X, Sparkles, Sliders, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';
import { FactoryConfig } from '../types/energy';
import { FACTORY_PRESETS } from '../utils/presets';

interface FactoryConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: FactoryConfig;
  onSaveAndOptimize: (newConfig: FactoryConfig) => void;
}

export const FactoryConfigModal: React.FC<FactoryConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveAndOptimize,
}) => {
  const [formData, setFormData] = useState<FactoryConfig>({ ...config });
  const [activeTab, setActiveTab] = useState<'general' | 'solar_bess' | 'tariff'>('general');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isOptimizing, setIsOptimizing] = useState(false);

  if (!isOpen) return null;

  const handlePresetSelect = (preset: FactoryConfig) => {
    setFormData({ ...preset });
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = 'Factory name is required';
    if (formData.dailyDemandKwh <= 10) newErrors.dailyDemandKwh = 'Daily demand must be > 10 kWh';
    if (formData.solarCapacityKw < 0) newErrors.solarCapacityKw = 'Solar capacity cannot be negative';
    if (formData.batteryCapacityKwh < 0) newErrors.batteryCapacityKwh = 'Battery capacity cannot be negative';
    if (formData.currentBatteryChargeKwh > formData.batteryCapacityKwh) {
      newErrors.currentBatteryChargeKwh = 'Initial charge cannot exceed battery capacity';
    }
    if (formData.batteryEfficiency < 0.5 || formData.batteryEfficiency > 1.0) {
      newErrors.batteryEfficiency = 'Efficiency must be between 50% and 100%';
    }
    if (formData.gridPricePerKwh <= 0) newErrors.gridPricePerKwh = 'Grid price must be positive';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSolarKwChange = (kw: number) => {
    const updated = {
      ...formData,
      solarCapacityKw: kw,
      // Automatic estimation: ~4.18 peak sun hours
      expectedSolarGenKwh: Math.round(kw * 4.2),
    };
    setFormData(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsOptimizing(true);
    setTimeout(() => {
      onSaveAndOptimize(formData);
      setIsOptimizing(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto glass-panel rounded-2xl border border-slate-700 shadow-2xl bg-slate-900/95 p-6 md:p-8 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                Configure Simulated Factory
              </h2>
              <p className="text-xs text-slate-400">
                Adjust plant demand, solar array size, battery BESS specs, and grid tariff rules
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Industrial Presets */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Quick Benchmark Industry Presets (1-Click Load):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FACTORY_PRESETS.map((p) => {
              const isSelected = formData.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetSelect(p)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-sm'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold truncate">{p.name.split(' ')[0]}</div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {p.dailyDemandKwh} kWh • {p.solarCapacityKw} kWp
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 mb-6 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`pb-2.5 px-3 text-xs font-semibold transition-colors border-b-2 ${
              activeTab === 'general'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Factory Load & Shifts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('solar_bess')}
            className={`pb-2.5 px-3 text-xs font-semibold transition-colors border-b-2 ${
              activeTab === 'solar_bess'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Solar PV & Battery Storage (BESS)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tariff')}
            className={`pb-2.5 px-3 text-xs font-semibold transition-colors border-b-2 ${
              activeTab === 'tariff'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Electricity Tariffs & TOU
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TAB 1: General & Demand */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Factory Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Apex Precision Casting Unit 4"
                />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Daily Electricity Consumption
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.dailyDemandKwh}
                      onChange={(e) => setFormData({ ...formData, dailyDemandKwh: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                      min="50"
                      max="20000"
                      step="50"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">kWh / day</span>
                  </div>
                  {errors.dailyDemandKwh && <p className="text-xs text-red-400 mt-1">{errors.dailyDemandKwh}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Operating Shift Schedule
                  </label>
                  <select
                    value={formData.operatingShift}
                    onChange={(e) => setFormData({ ...formData, operatingShift: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="continuous_24h">Continuous 24h Operations (Foundry / Continuous Process)</option>
                    <option value="two_shifts_16h">Two Shifts 16h (06:00 - 22:00, Textile / Fabrication)</option>
                    <option value="day_shift_10h">Single Day Shift 10h (08:00 - 18:00, Assembly)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex justify-between">
                  <span>Flexible Load Portion (can shift to solar hours)</span>
                  <span className="text-emerald-400 font-mono">{formData.loadShiftFlexibilityPct}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={formData.loadShiftFlexibilityPct}
                  onChange={(e) => setFormData({ ...formData, loadShiftFlexibilityPct: Number(e.target.value) })}
                  className="w-full accent-emerald-400"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Non-critical processes (e.g. pumps, compressors, batch heating) that the optimizer can reposition.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Solar & BESS */}
          {activeTab === 'solar_bess' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Solar Array Capacity
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.solarCapacityKw}
                      onChange={(e) => handleSolarKwChange(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                      min="0"
                      max="2000"
                      step="10"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">kWp</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Expected Daily Solar Generation
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.expectedSolarGenKwh}
                      onChange={(e) => setFormData({ ...formData, expectedSolarGenKwh: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                      min="0"
                      max="10000"
                      step="20"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">kWh / day</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Calculated at ~4.2 sun-peak hours in India</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Battery Capacity
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.batteryCapacityKwh}
                      onChange={(e) => setFormData({ ...formData, batteryCapacityKwh: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                      min="0"
                      max="5000"
                      step="25"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">kWh</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Initial Charge at 00:00
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.currentBatteryChargeKwh}
                      onChange={(e) => setFormData({ ...formData, currentBatteryChargeKwh: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                      min="0"
                      max={formData.batteryCapacityKwh}
                      step="10"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">kWh</span>
                  </div>
                  {errors.currentBatteryChargeKwh && (
                    <p className="text-xs text-red-400 mt-1">{errors.currentBatteryChargeKwh}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Max Charge / Discharge Rate
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.maxDischargeRateKw}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFormData({ ...formData, maxDischargeRateKw: val, maxChargeRateKw: val });
                      }}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                      min="10"
                      max="2000"
                      step="10"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">kW</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Round-Trip Efficiency
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={Math.round(formData.batteryEfficiency * 100)}
                      onChange={(e) => setFormData({ ...formData, batteryEfficiency: Number(e.target.value) / 100 })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                      min="70"
                      max="98"
                      step="1"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Min Safe Reserve (DoD Protection)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.minSocPercent}
                      onChange={(e) => setFormData({ ...formData, minSocPercent: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                      min="10"
                      max="30"
                      step="5"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Tariffs */}
          {activeTab === 'tariff' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-white block">Time-of-Use (TOU) Dynamic Tariffs</span>
                  <span className="text-xs text-slate-400">
                    Apply differentiated Peak, Normal & Off-peak electricity rates
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.useTouTariff}
                    onChange={(e) => setFormData({ ...formData, useTouTariff: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {formData.useTouTariff ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <div>
                    <label className="block text-xs font-semibold text-amber-300 mb-1">
                      Peak Tariff (18:00 - 22:00)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.touTariff.peakPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            touTariff: { ...formData.touTariff, peakPrice: Number(e.target.value) },
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                        min="5"
                        max="25"
                        step="0.1"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">₹/kWh</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Normal Tariff (Daytime)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.touTariff.normalPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            touTariff: { ...formData.touTariff, normalPrice: Number(e.target.value) },
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-400 font-mono"
                        min="3"
                        max="20"
                        step="0.1"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">₹/kWh</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-cyan-300 mb-1">
                      Off-Peak Tariff (23:00 - 06:00)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.touTariff.offPeakPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            touTariff: { ...formData.touTariff, offPeakPrice: Number(e.target.value) },
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                        min="2"
                        max="15"
                        step="0.1"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">₹/kWh</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Flat Commercial Grid Tariff
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.gridPricePerKwh}
                      onChange={(e) => setFormData({ ...formData, gridPricePerKwh: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                      min="3"
                      max="25"
                      step="0.25"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">₹/kWh</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setFormData({ ...config })}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Changes
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isOptimizing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                {isOptimizing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Calculating Schedules...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Run AI Optimization
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
