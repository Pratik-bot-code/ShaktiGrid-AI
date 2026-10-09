"""
ShaktiGrid AI — Industrial Energy Optimization Engine (Python Core)
Deterministic linear dispatch with Time-of-Use (TOU) arbitrage and peak shaving.
"""

from typing import List, Dict, Any
import math

SOLAR_HOURLY_WEIGHTS = [
    0.000, 0.000, 0.000, 0.000, 0.000, 0.000,  # 00:00 - 05:00
    0.012, 0.045, 0.085, 0.130, 0.165, 0.185,  # 06:00 - 11:00
    0.180, 0.150, 0.110, 0.065, 0.025, 0.005,  # 12:00 - 17:00
    0.000, 0.000, 0.000, 0.000, 0.000, 0.000   # 18:00 - 23:00
]

def get_load_distribution(shift: str) -> List[float]:
    if shift == "continuous_24h":
        return [
            0.028, 0.026, 0.025, 0.025, 0.028, 0.035,
            0.045, 0.052, 0.058, 0.060, 0.059, 0.057,
            0.048, 0.055, 0.058, 0.060, 0.059, 0.054,
            0.050, 0.046, 0.042, 0.038, 0.035, 0.030
        ]
    elif shift == "two_shifts_16h":
        return [
            0.015, 0.015, 0.015, 0.015, 0.018, 0.025,
            0.055, 0.065, 0.070, 0.072, 0.068, 0.065,
            0.045, 0.066, 0.070, 0.072, 0.068, 0.062,
            0.055, 0.048, 0.042, 0.028, 0.020, 0.018
        ]
    else:
        return [
            0.012, 0.012, 0.012, 0.012, 0.012, 0.015,
            0.020, 0.035, 0.085, 0.095, 0.100, 0.098,
            0.055, 0.095, 0.100, 0.095, 0.082, 0.045,
            0.025, 0.020, 0.018, 0.015, 0.015, 0.012
        ]

def optimize_schedule(config: Dict[str, Any]) -> Dict[str, Any]:
    daily_demand = float(config.get("dailyDemandKwh", 1850))
    expected_solar = float(config.get("expectedSolarGenKwh", 920))
    bat_capacity = float(config.get("batteryCapacityKwh", 450))
    current_charge = float(config.get("currentBatteryChargeKwh", 140))
    max_charge = float(config.get("maxChargeRateKw", 110))
    max_discharge = float(config.get("maxDischargeRateKw", 110))
    efficiency = float(config.get("batteryEfficiency", 0.90))
    min_soc_pct = float(config.get("minSocPercent", 15))
    grid_price = float(config.get("gridPricePerKwh", 8.75))
    use_tou = bool(config.get("useTouTariff", True))
    tou = config.get("touTariff", {
        "peakHours": [18, 19, 20, 21, 22],
        "normalHours": [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
        "offPeakHours": [23, 0, 1, 2, 3, 4, 5],
        "peakPrice": 12.20,
        "normalPrice": 8.20,
        "offPeakPrice": 4.80,
    })
    shift = config.get("operatingShift", "continuous_24h")

    load_weights = get_load_distribution(shift)
    total_load_weight = sum(load_weights)
    total_solar_weight = sum(SOLAR_HOURLY_WEIGHTS)

    demands = [round((w / total_load_weight) * daily_demand, 1) for w in load_weights]
    solars = [round((w / total_solar_weight) * expected_solar, 1) for w in SOLAR_HOURLY_WEIGHTS]

    min_soc_kwh = (min_soc_pct / 100.0) * bat_capacity
    current_soc = max(min_soc_kwh, min(bat_capacity, current_charge))
    one_way_eff = math.sqrt(efficiency)

    hourly = []
    total_solar_used = 0.0
    total_solar_curtailed = 0.0
    total_grid_purchased = 0.0
    baseline_grid_purchased = 0.0
    total_bat_charged = 0.0
    total_bat_discharged = 0.0
    baseline_total_cost = 0.0
    optimized_total_cost = 0.0

    for h in range(24):
        demand = demands[h]
        solar = solars[h]

        # Tariff calculation
        is_peak = False
        is_off_peak = False
        tariff = grid_price

        if use_tou:
            if h in tou.get("peakHours", []):
                tariff = tou.get("peakPrice", 12.20)
                is_peak = True
            elif h in tou.get("offPeakHours", []):
                tariff = tou.get("offPeakPrice", 4.80)
                is_off_peak = True
            else:
                tariff = tou.get("normalPrice", 8.20)

        # Baseline
        base_solar_used = min(demand, solar)
        base_grid = max(0.0, demand - base_solar_used)
        base_cost = base_grid * tariff
        baseline_grid_purchased += base_grid
        baseline_total_cost += base_cost

        # Optimized dispatch
        solar_used = 0.0
        solar_stored = 0.0
        solar_curtailed = 0.0
        bat_charging = 0.0
        bat_discharging = 0.0
        grid_purchased = 0.0
        reason = ""

        # Step 1: Solar Direct
        if solar > 0:
            solar_used = min(demand, solar)
        unmet_demand = demand - solar_used
        surplus_solar = solar - solar_used

        # Step 2: Surplus Solar Storage
        if surplus_solar > 0 and current_soc < bat_capacity:
            room = bat_capacity - current_soc
            allowed = min(max_charge, room / one_way_eff)
            actual_stored = min(surplus_solar, allowed)
            solar_stored = actual_stored
            bat_charging += actual_stored
            current_soc += actual_stored * one_way_eff
            solar_curtailed = max(0.0, surplus_solar - actual_stored)
            reason = f"Solar priority: load met + {round(solar_stored, 1)} kWh stored into BESS."
        elif surplus_solar > 0:
            solar_curtailed = surplus_solar
            reason = f"Solar excess: BESS full, {round(solar_curtailed, 1)} kWh surplus available."

        # Step 3: Off-peak smart pre-charge
        target_precharge = bat_capacity * 0.50
        if use_tou and is_off_peak and current_soc < target_precharge and solar == 0:
            needed = target_precharge - current_soc
            charge_amt = min(max_charge * 0.5, needed / one_way_eff)
            if charge_amt > 0:
                bat_charging += charge_amt
                current_soc += charge_amt * one_way_eff
                grid_purchased += charge_amt
                reason = f"TOU Arbitrage: Pre-charging BESS with cheap off-peak power (₹{tariff}/kWh)."

        # Step 4: Battery Discharge
        if unmet_demand > 0:
            avail_discharge = max(0.0, current_soc - min_soc_kwh)
            should_discharge = is_peak or (not use_tou and avail_discharge > 5) or (tariff >= grid_price and current_soc > bat_capacity * 0.4)
            if should_discharge and avail_discharge > 0:
                max_deliv = min(max_discharge, avail_discharge * one_way_eff)
                disch_amt = min(unmet_demand, max_deliv)
                bat_discharging = disch_amt
                current_soc -= disch_amt / one_way_eff
                reason = f"Peak Shaving: Discharging BESS at {round(bat_discharging, 1)} kW to avoid tariff ₹{tariff}/kWh."

        # Step 5: Grid Shortfall
        remaining_def = max(0.0, unmet_demand - bat_discharging)
        grid_purchased += remaining_def

        if not reason:
            reason = f"Grid import: {round(grid_purchased, 1)} kWh at ₹{tariff}/kWh."

        total_solar_used += solar_used
        total_solar_curtailed += solar_curtailed
        total_grid_purchased += grid_purchased
        total_bat_charged += bat_charging
        total_bat_discharged += bat_discharging

        opt_cost = grid_purchased * tariff
        optimized_total_cost += opt_cost

        hourly.append({
            "hour": h,
            "timeLabel": f"{str(h).zfill(2)}:00",
            "predictedDemand": round(demand, 1),
            "availableSolar": round(solar, 1),
            "solarUsedDirectly": round(solar_used, 1),
            "solarStoredInBattery": round(solar_stored, 1),
            "solarCurtailed": round(solar_curtailed, 1),
            "batteryCharging": round(bat_charging, 1),
            "batteryDischarging": round(bat_discharging, 1),
            "batterySocKwh": round(current_soc, 1),
            "batterySocPercent": int(round((current_soc / bat_capacity) * 100)),
            "gridPurchased": round(grid_purchased, 1),
            "tariffPerKwh": tariff,
            "baselineCost": round(base_cost),
            "optimizedCost": round(opt_cost),
            "hourlySavings": round(base_cost - opt_cost),
            "isPeakHour": is_peak,
            "isOffPeakHour": is_off_peak,
            "decisionReason": reason,
        })

    savings = max(0.0, baseline_total_cost - optimized_total_cost)
    savings_pct = round((savings / baseline_total_cost) * 100, 1) if baseline_total_cost > 0 else 0.0

    return {
        "hourly": hourly,
        "totalDemandKwh": round(sum(demands)),
        "totalSolarGenKwh": round(sum(solars)),
        "totalSolarUsedKwh": round(total_solar_used),
        "totalSolarCurtailedKwh": round(total_solar_curtailed),
        "totalGridPurchasedKwh": round(total_grid_purchased),
        "baselineGridPurchasedKwh": round(baseline_grid_purchased),
        "totalBatteryChargedKwh": round(total_bat_charged),
        "totalBatteryDischargedKwh": round(total_bat_discharged),
        "finalBatterySocKwh": round(current_soc),
        "baselineTotalCost": round(baseline_total_cost),
        "optimizedTotalCost": round(optimized_total_cost),
        "totalSavingsInr": round(savings),
        "savingsPercentage": savings_pct,
        "solarSelfConsumptionRate": round(((total_solar_used + total_bat_charged) / sum(solars)) * 100, 1) if sum(solars) > 0 else 0,
        "carbonOffsetKg": round((total_solar_used + total_bat_discharged) * 0.82),
    }

if __name__ == "__main__":
    test_cfg = {
        "dailyDemandKwh": 1850,
        "expectedSolarGenKwh": 920,
        "batteryCapacityKwh": 450,
        "currentBatteryChargeKwh": 140,
        "gridPricePerKwh": 8.75,
        "useTouTariff": True
    }
    res = optimize_schedule(test_cfg)
    print("Optimization Completed!")
    print(f"Demand: {res['totalDemandKwh']} kWh")
    print(f"Solar Used: {res['totalSolarUsedKwh']} kWh")
    print(f"Baseline Cost: Rs {res['baselineTotalCost']}")
    print(f"Optimized Cost: Rs {res['optimizedTotalCost']}")
    print(f"Daily Savings: Rs {res['totalSavingsInr']} ({res['savingsPercentage']}%)")
