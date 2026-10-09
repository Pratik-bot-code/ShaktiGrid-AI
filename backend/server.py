"""
ShaktiGrid AI — FastAPI Backend Server
Provides REST endpoints for factory optimization, insights, and scenario simulation.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uvicorn

from optimizer import optimize_schedule

app = FastAPI(
    title="ShaktiGrid AI Optimization Engine API",
    description="Intelligent solar, battery storage, and dynamic grid tariff optimizer for industrial facilities.",
    version="1.0.0"
)

# Enable CORS for local React/Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TouTariffModel(BaseModel):
    peakHours: List[int] = [18, 19, 20, 21, 22]
    normalHours: List[int] = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
    offPeakHours: List[int] = [23, 0, 1, 2, 3, 4, 5]
    peakPrice: float = 12.20
    normalPrice: float = 8.20
    offPeakPrice: float = 4.80

class FactoryConfigModel(BaseModel):
    id: Optional[str] = "apex_metal_casting"
    name: Optional[str] = "Apex Precision Metal Casting Unit 4"
    dailyDemandKwh: float = Field(1850.0, ge=10)
    solarCapacityKw: float = Field(220.0, ge=0)
    expectedSolarGenKwh: float = Field(920.0, ge=0)
    batteryCapacityKwh: float = Field(450.0, ge=0)
    currentBatteryChargeKwh: float = Field(140.0, ge=0)
    maxChargeRateKw: float = Field(110.0, ge=1)
    maxDischargeRateKw: float = Field(110.0, ge=1)
    batteryEfficiency: float = Field(0.90, ge=0.5, le=1.0)
    minSocPercent: float = Field(15.0, ge=5, le=50)
    gridPricePerKwh: float = Field(8.75, ge=1.0)
    useTouTariff: bool = True
    touTariff: Optional[TouTariffModel] = None
    operatingShift: str = "continuous_24h"
    loadShiftFlexibilityPct: float = 15.0

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "engine": "ShaktiGrid AI Optimization Engine v2.4",
        "mode": "Deterministic Linear TOU Dispatcher"
    }

@app.post("/api/optimize")
def run_optimization_endpoint(config: FactoryConfigModel):
    try:
        config_dict = config.dict()
        result = optimize_schedule(config_dict)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
