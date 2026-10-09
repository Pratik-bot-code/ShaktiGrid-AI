import React, { useState } from 'react';
import { OptimizationResult } from '../types/energy';
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface AiAdvisorViewProps {
  result: OptimizationResult;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  dataPoints?: { label: string; value: string }[];
}

export const AiAdvisorView: React.FC<AiAdvisorViewProps> = ({ result }) => {
  const { factoryConfig, hourly, totalDemandKwh, totalSolarGenKwh, totalSolarUsedKwh, totalGridPurchasedKwh, baselineTotalCost, optimizedTotalCost, totalSavingsInr, savingsPercentage, solarSelfConsumptionRate } = result;

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello! I am **ShaktiGrid AI Advisor**, your plant energy optimization co-pilot for **${factoryConfig.name}**.\n\nI analyze your live dispatch numbers, TOU tariff spreads, and battery cycling to give you grounded, mathematical advice. Click any prompt below or ask me any question!`,
      timestamp: 'Just now',
      dataPoints: [
        { label: 'Current Daily Savings', value: `₹${Math.round(totalSavingsInr).toLocaleString('en-IN')} (${savingsPercentage}%)` },
        { label: 'Solar Self-Consumption', value: `${solarSelfConsumptionRate}%` },
        { label: 'BESS Arbitrage Spread', value: `₹${(factoryConfig.touTariff.peakPrice - factoryConfig.touTariff.offPeakPrice).toFixed(2)}/kWh` },
      ],
    },
  ]);

  const QUICK_PROMPTS = [
    'How can I reduce my electricity bill further?',
    'When should I charge the battery?',
    'How much solar energy am I using vs losing?',
    'Compare my baseline unmanaged plan with the optimized plan.',
    'What happens if my factory daily demand increases by 20%?',
  ];

  const generateAnswer = (query: string): { text: string; dataPoints?: { label: string; value: string }[] } => {
    const q = query.toLowerCase();

    if (q.includes('reduce') || q.includes('bill') || q.includes('save') || q.includes('cost')) {
      return {
        text: `To maximize cost reduction for **${factoryConfig.name}** beyond the current ₹${Math.round(totalSavingsInr).toLocaleString('en-IN')}/day (${savingsPercentage}% reduction):\n\n` +
          `1. **Shift Flexible Loads to Midday:** You currently have ${factoryConfig.loadShiftFlexibilityPct}% flexible load. Shifting batch motors or thermal pumping to 11:30 - 14:00 will consume ~${Math.round(totalSolarGenKwh * 0.15)} kWh of surplus solar at ₹0 marginal cost.\n` +
          `2. **Eliminate Evening Peak Surcharge:** Discharging your ${factoryConfig.batteryCapacityKwh} kWh BESS between 18:00 - 22:00 avoids the ₹${factoryConfig.touTariff.peakPrice}/kWh peak tariff, which contributes the majority of your bill.\n` +
          `3. **Off-Peak Night Pre-charge:** Maintain pre-charging during 01:00 - 05:00 at ₹${factoryConfig.touTariff.offPeakPrice}/kWh up to 50% capacity so you never buy full price electricity in the morning.`,
        dataPoints: [
          { label: 'Optimized Daily Cost', value: `₹${optimizedTotalCost.toLocaleString('en-IN')}` },
          { label: 'Baseline Unmanaged Cost', value: `₹${baselineTotalCost.toLocaleString('en-IN')}` },
          { label: 'Monthly Savings Run-rate', value: `₹${(totalSavingsInr * 30).toLocaleString('en-IN')}` },
        ],
      };
    }

    if (q.includes('when') || q.includes('charge') || q.includes('battery')) {
      return {
        text: `Based on your factory's TOU tariff and solar irradiance curve:\n\n` +
          `• **Primary Charging Window (Solar Surplus):** 09:30 to 14:30. In this window, solar generation reaches up to ${Math.max(...hourly.map(h => h.availableSolar))} kW, exceeding factory consumption. ShaktiGrid routes ${result.totalBatteryChargedKwh} kWh into your BESS.\n` +
          `• **Secondary Pre-Charge Window (Grid Arbitrage):** 01:00 to 05:00. Electricity is cheapest at ₹${factoryConfig.touTariff.offPeakPrice}/kWh. The optimizer tops up the battery to a 50% buffer to prepare for the morning shift start.\n` +
          `• **Discharge Window (Peak Shaving):** 18:00 to 22:00 when grid prices peak at ₹${factoryConfig.touTariff.peakPrice}/kWh. The battery discharges up to ${factoryConfig.maxDischargeRateKw} kW, shielding the plant from the highest tariff bracket.`,
        dataPoints: [
          { label: 'Total Energy Charged', value: `${result.totalBatteryChargedKwh} kWh` },
          { label: 'Total Energy Discharged', value: `${result.totalBatteryDischargedKwh} kWh` },
          { label: 'Round-trip Efficiency', value: `${Math.round(factoryConfig.batteryEfficiency * 100)}%` },
        ],
      };
    }

    if (q.includes('solar') || q.includes('using') || q.includes('losing') || q.includes('curtail')) {
      const curtailed = result.totalSolarCurtailedKwh;
      return {
        text: `Here is your exact solar balance for today:\n\n` +
          `• **Total Solar Generated:** ${totalSolarGenKwh} kWh\n` +
          `• **Directly Consumed by Factory:** ${totalSolarUsedKwh} kWh (${Math.round((totalSolarUsedKwh / totalSolarGenKwh) * 100)}%)\n` +
          `• **Stored in Battery BESS:** ${result.totalBatteryChargedKwh} kWh\n` +
          `• **Curtailed / Excess:** ${curtailed} kWh (${curtailed > 0 ? 'Surplus when battery was full' : 'Zero clipping'})\n\n` +
          `Your solar self-consumption rate is **${solarSelfConsumptionRate}%**. Clean solar energy is offsetting **${result.carbonOffsetKg} kg of CO₂** daily compared to the fossil fuel grid benchmark.`,
        dataPoints: [
          { label: 'Solar Capacity', value: `${factoryConfig.solarCapacityKw} kWp` },
          { label: 'Solar Self-Consumption', value: `${solarSelfConsumptionRate}%` },
          { label: 'Daily CO₂ Offset', value: `${result.carbonOffsetKg} kg` },
        ],
      };
    }

    if (q.includes('compare') || q.includes('plan') || q.includes('baseline') || q.includes('versus')) {
      return {
        text: `Here is the side-by-side comparison between your **Unmanaged Baseline** vs **ShaktiGrid AI Optimized Schedule**:\n\n` +
          `1. **Grid Electricity Purchased:**\n` +
          `   - Baseline: ${result.baselineGridPurchasedKwh} kWh\n` +
          `   - ShaktiGrid AI: ${totalGridPurchasedKwh} kWh (Down by ${result.baselineGridPurchasedKwh - totalGridPurchasedKwh} kWh)\n\n` +
          `2. **Electricity Expenditure:**\n` +
          `   - Baseline: ₹${baselineTotalCost.toLocaleString('en-IN')}/day\n` +
          `   - ShaktiGrid AI: ₹${optimizedTotalCost.toLocaleString('en-IN')}/day\n` +
          `   - **Net Savings:** ₹${totalSavingsInr.toLocaleString('en-IN')}/day (${savingsPercentage}% cost cut)\n\n` +
          `3. **Peak Demand Relief:** Contracted grid demand cut from ${result.peakGridDemandKw} kW down to ${result.optimizedPeakGridDemandKw} kW, reducing maximum demand penalty risk.`,
        dataPoints: [
          { label: 'Baseline Cost', value: `₹${baselineTotalCost.toLocaleString('en-IN')}` },
          { label: 'Optimized Cost', value: `₹${optimizedTotalCost.toLocaleString('en-IN')}` },
          { label: 'Net Annual Projected Savings', value: `₹${(totalSavingsInr * 365).toLocaleString('en-IN')}` },
        ],
      };
    }

    // Default intelligent fallback grounded in config
    return {
      text: `Based on **${factoryConfig.name}**'s configuration (${totalDemandKwh} kWh demand, ${factoryConfig.solarCapacityKw} kW solar, ${factoryConfig.batteryCapacityKwh} kWh battery):\n\n` +
        `• Your facility is currently achieving a **${result.gridIndependenceRate}% clean/buffered independence rate**.\n` +
        `• The optimization engine schedules the BESS to discharge during the ₹${factoryConfig.touTariff.peakPrice}/kWh evening window, saving ₹${Math.round(totalSavingsInr).toLocaleString('en-IN')} per cycle.\n` +
        `• You can test other industrial scenarios or adjust tariff assumptions anytime in the Factory Setup modal!`,
      dataPoints: [
        { label: 'Total Demand', value: `${totalDemandKwh} kWh` },
        { label: 'Clean Independence', value: `${result.gridIndependenceRate}%` },
        { label: 'Daily Savings', value: `₹${totalSavingsInr.toLocaleString('en-IN')}` },
      ],
    };
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');

    // Generate response with brief AI thinking effect
    setTimeout(() => {
      const ans = generateAnswer(text);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: ans.text,
        timestamp: 'Just now',
        dataPoints: ans.dataPoints,
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 350);
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[650px]">
      {/* Advisor Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">
                ShaktiGrid AI Energy Advisor
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                Telemetry Grounded
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive recommendation assistant for {factoryConfig.name}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Deterministic Rule & Math Model
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-2xl ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            {msg.sender === 'assistant' ? (
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 font-bold text-xs">
                U
              </div>
            )}

            <div
              className={`p-4 rounded-2xl text-xs leading-relaxed space-y-3 ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>

              {/* Data points callout */}
              {msg.dataPoints && msg.dataPoints.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                  {msg.dataPoints.map((dp, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                      <div className="text-[10px] text-slate-400 font-medium truncate">{dp.label}</div>
                      <div className="text-xs font-bold text-emerald-400 font-mono">{dp.value}</div>
                    </div>
                  ))}
                </div>
              )}

              <div
                className={`text-[10px] ${
                  msg.sender === 'user' ? 'text-emerald-200 text-right' : 'text-slate-500'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-900/40 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] text-slate-400 whitespace-nowrap flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Suggested:
        </span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap transition-colors cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputQuery);
        }}
        className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90 flex gap-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask ShaktiGrid Advisor about tariffs, battery schedule, or savings..."
          className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer text-xs"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>
    </div>
  );
};
