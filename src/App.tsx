import React, { useState, useMemo } from 'react';
import { FactoryConfig, OptimizationResult } from './types/energy';
import { DEFAULT_FACTORY_CONFIG } from './utils/presets';
import { runOptimization } from './utils/optimizer';

// Components
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { EnergyDashboard } from './components/EnergyDashboard';
import { OptimizerView } from './components/OptimizerView';
import { WasteDetectionView } from './components/WasteDetectionView';
import { AiAdvisorView } from './components/AiAdvisorView';
import { ReportsView } from './components/ReportsView';
import { FactoryConfigModal } from './components/FactoryConfigModal';
import { DemoTourModal } from './components/DemoTourModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [factoryConfig, setFactoryConfig] = useState<FactoryConfig>(DEFAULT_FACTORY_CONFIG);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Compute optimization result dynamically whenever factory configuration changes
  const optimizationResult: OptimizationResult = useMemo(() => {
    return runOptimization(factoryConfig);
  }, [factoryConfig]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleSaveAndOptimize = (newConfig: FactoryConfig) => {
    setFactoryConfig(newConfig);
    showToast(`✓ AI Optimization complete for ${newConfig.name}!`);
  };

  const handleResetDefaults = () => {
    setFactoryConfig(DEFAULT_FACTORY_CONFIG);
    showToast('✓ Reset simulation to default Apex Metal Casting configuration.');
  };

  const handleRunOptimizationDemo = () => {
    showToast('⚡ Running deterministic dispatch optimization...');
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl shadow-emerald-500/30 flex items-center gap-2 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenConfig={() => setIsConfigModalOpen(true)}
        onStartDemoGuide={() => setIsDemoGuideOpen(true)}
        factoryConfig={factoryConfig}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'landing' && (
          <LandingPage
            onLaunchDashboard={() => setActiveTab('dashboard')}
            onExploreFeatures={() => setActiveTab('optimizer')}
            result={optimizationResult}
          />
        )}

        {activeTab === 'dashboard' && (
          <EnergyDashboard
            result={optimizationResult}
            onOpenConfig={() => setIsConfigModalOpen(true)}
            onReoptimize={() => handleSaveAndOptimize(factoryConfig)}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'optimizer' && (
          <OptimizerView result={optimizationResult} />
        )}

        {activeTab === 'insights' && (
          <WasteDetectionView result={optimizationResult} />
        )}

        {activeTab === 'advisor' && (
          <AiAdvisorView result={optimizationResult} />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            result={optimizationResult}
            onResetDefaults={handleResetDefaults}
            onOpenConfig={() => setIsConfigModalOpen(true)}
          />
        )}
      </main>

      {/* Factory Configuration Modal */}
      <FactoryConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={factoryConfig}
        onSaveAndOptimize={handleSaveAndOptimize}
      />

      {/* 3-Minute Hackathon Demo Tour Guide */}
      <DemoTourModal
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
        onNavigateToTab={setActiveTab}
        onOpenConfig={() => setIsConfigModalOpen(true)}
        onRunOptimizationDemo={handleRunOptimizationDemo}
      />
    </div>
  );
};

export default App;
