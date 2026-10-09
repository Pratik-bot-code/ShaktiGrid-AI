import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Zap,
  Sliders,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface DemoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: string) => void;
  onOpenConfig: () => void;
  onRunOptimizationDemo: () => void;
}

export const DemoTourModal: React.FC<DemoTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onOpenConfig,
  onRunOptimizationDemo,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const STEPS = [
    {
      step: 1,
      title: '1. Open Dashboard with Sample Factory Data',
      desc: 'Start by viewing the active plant (Apex Precision Metal Casting). Review the real-time energy flow diagram and 6 core KPI metrics (Demand, Solar, Grid, Battery SOC %, Cost & Savings).',
      tab: 'dashboard',
      actionLabel: 'Go to Dashboard',
      action: () => onNavigateToTab('dashboard'),
    },
    {
      step: 2,
      title: '2. Examine Baseline Electricity Cost',
      desc: 'Scroll down to the Cost Comparison Bar Chart. Notice the unmanaged baseline electricity cost in slate grey versus the optimized green bar across every hour.',
      tab: 'dashboard',
      actionLabel: 'View Cost Chart',
      action: () => onNavigateToTab('dashboard'),
    },
    {
      step: 3,
      title: '3. Change Solar, Demand, or TOU Tariffs',
      desc: 'Open the Factory Configuration modal. You can toggle between 4 industry presets (Casting, Textiles, Cold Storage, Electronics) or customize solar kWp and peak tariff rates.',
      tab: 'config',
      actionLabel: 'Open Factory Config',
      action: () => onOpenConfig(),
    },
    {
      step: 4,
      title: '4. Run AI Optimization Engine',
      desc: 'Click "Run AI Optimization". The deterministic linear dispatch solver executes in milliseconds, recomputing power balance, battery C-rates, and TOU arbitrage.',
      tab: 'optimizer',
      actionLabel: 'Simulate Optimization',
      action: () => {
        onRunOptimizationDemo();
        onNavigateToTab('optimizer');
      },
    },
    {
      step: 5,
      title: '5. Display Hourly Energy Dispatch Schedule',
      desc: 'Explore the 24-hour dispatch table. Filter by Peak Tariff or Battery Active hours. Read the AI Optimizer Rationale column explaining each dispatch decision.',
      tab: 'optimizer',
      actionLabel: 'Open Schedule Table',
      action: () => onNavigateToTab('optimizer'),
    },
    {
      step: 6,
      title: '6. Compare Costs and Estimated Savings',
      desc: 'Switch to the Reports tab. Compare the 4 scenarios: 100% Grid Reliance, Unmanaged Solar, Unmanaged Battery, and ShaktiGrid AI. Toggle between Monthly and Annual projections.',
      tab: 'reports',
      actionLabel: 'View Scenario Reports',
      action: () => onNavigateToTab('reports'),
    },
    {
      step: 7,
      title: '7. Open Waste Detection & Explain Actionable Insight',
      desc: 'Head to the Waste Detection page. Point out an anomaly such as "High Peak-Hours Grid Import" or "Flexible Load Shifting" with its supporting data and rupee savings potential.',
      tab: 'insights',
      actionLabel: 'Explore Waste Insights',
      action: () => onNavigateToTab('insights'),
    },
  ];

  const current = STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      STEPS[nextStep].action();
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      STEPS[prevStep].action();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full p-4 animate-fade-in">
      <div className="glass-panel bg-slate-900/95 border-2 border-emerald-500/50 rounded-2xl p-5 shadow-2xl text-slate-100 relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              3-Minute Hackathon Demo Flow
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-emerald-400">{current.title}</span>
            <span className="text-slate-500 font-mono text-[11px]">
              Step {current.step} / {STEPS.length}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{current.desc}</p>
        </div>

        {/* Step Progress Dots */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex gap-1">
            {STEPS.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => {
                  setCurrentStep(idx);
                  s.action();
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-5 bg-emerald-400'
                    : idx < currentStep
                    ? 'bg-emerald-500/50'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
            >
              <span>{currentStep === STEPS.length - 1 ? 'Finish Demo' : 'Next Step'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
