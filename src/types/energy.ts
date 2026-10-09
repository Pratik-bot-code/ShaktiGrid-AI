export interface TouTariff {
  peakHours: number[];      // e.g. [18, 19, 20, 21, 22]
  normalHours: number[];    // e.g. [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
  offPeakHours: number[];   // e.g. [23, 0, 1, 2, 3, 4, 5]
  peakPrice: number;        // ₹ per kWh, e.g. 11.50
  normalPrice: number;      // ₹ per kWh, e.g. 8.00
  offPeakPrice: number;     // ₹ per kWh, e.g. 4.50
}

export interface FactoryConfig {
  id: string;
  name: string;
  category: 'metal_casting' | 'textile_mill' | 'cold_storage' | 'electronics_assembly' | 'custom';
  dailyDemandKwh: number;
  solarCapacityKw: number;
  expectedSolarGenKwh: number;
  batteryCapacityKwh: number;
  currentBatteryChargeKwh: number;
  maxChargeRateKw: number;
  maxDischargeRateKw: number;
  batteryEfficiency: number; // e.g. 0.90 for 90% round-trip efficiency
  minSocPercent: number;     // Depth of Discharge protection, e.g. 15%
  gridPricePerKwh: number;   // Default flat rate if TOU disabled
  useTouTariff: boolean;
  touTariff: TouTariff;
  operatingShift: 'continuous_24h' | 'two_shifts_16h' | 'day_shift_10h';
  loadShiftFlexibilityPct: number; // e.g. 15% flexible load
}

export interface HourlyRecord {
  hour: number;
  timeLabel: string;
  predictedDemand: number;
  availableSolar: number;
  solarUsedDirectly: number;
  solarStoredInBattery: number;
  solarCurtailed: number;
  batteryCharging: number;
  batteryDischarging: number;
  batterySocKwh: number;
  batterySocPercent: number;
  gridPurchased: number;
  tariffPerKwh: number;
  baselineCost: number;
  optimizedCost: number;
  baselineGridPurchased: number;
  hourlySavings: number;
  isPeakHour: boolean;
  isOffPeakHour: boolean;
  decisionReason: string;
}

export interface OptimizationResult {
  factoryConfig: FactoryConfig;
  hourly: HourlyRecord[];
  totalDemandKwh: number;
  totalSolarGenKwh: number;
  totalSolarUsedKwh: number;
  totalSolarCurtailedKwh: number;
  totalGridPurchasedKwh: number;
  baselineGridPurchasedKwh: number;
  totalBatteryChargedKwh: number;
  totalBatteryDischargedKwh: number;
  finalBatterySocKwh: number;
  baselineTotalCost: number;     // in INR ₹
  optimizedTotalCost: number;    // in INR ₹
  totalSavingsInr: number;       // in INR ₹
  savingsPercentage: number;     // in %
  solarSelfConsumptionRate: number; // %
  gridIndependenceRate: number;     // %
  carbonOffsetKg: number;           // in kg CO2 (0.82 kg/kWh)
  peakGridDemandKw: number;
  optimizedPeakGridDemandKw: number;
  peakReductionKw: number;
  keyTakeaways: string[];
}

export interface EnergyInsight {
  id: string;
  title: string;
  category: 'peak_demand' | 'solar_waste' | 'schedule_inefficiency' | 'load_shifting' | 'battery_health';
  severity: 'high' | 'medium' | 'info';
  supportingData: string;
  estimatedImpact: string;
  recommendedAction: string;
  confidenceScore: number;
  potentialSavingsInr: number;
  isApplied?: boolean;
}

export interface ScenarioComparison {
  name: string;
  tagline: string;
  gridPurchasedKwh: number;
  solarUtilizedKwh: number;
  batteryThroughputKwh: number;
  dailyCostInr: number;
  monthlyCostInr: number;
  savingsVsBaselineInr: number;
  co2OffsetKg: number;
}
