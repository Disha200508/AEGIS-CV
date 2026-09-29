from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.core.tamper_simulator import TamperSimulator

router = APIRouter(prefix="/simulation", tags=["Demo Attack Simulator"])

class TamperDatasetRequest(BaseModel):
    asset_id: Optional[int] = None

class TamperModelRequest(BaseModel):
    model_id: Optional[int] = None

class TamperInferenceRequest(BaseModel):
    record_id: Optional[int] = None

@router.post("/tamper-dataset")
def simulate_dataset_tampering(req: TamperDatasetRequest = None, db: Session = Depends(get_db)):
    """DEMO ONLY: Simulate dataset/image tampering on safe demo copy."""
    asset_id = req.asset_id if req else None
    return TamperSimulator.simulate_dataset_tampering(db, asset_id=asset_id)

@router.post("/tamper-model")
def simulate_model_tampering(req: TamperModelRequest = None, db: Session = Depends(get_db)):
    """DEMO ONLY: Simulate CV model weight tampering / Trojan insertion on safe demo copy."""
    model_id = req.model_id if req else None
    return TamperSimulator.simulate_model_tampering(db, model_id=model_id)

@router.post("/tamper-inference")
def simulate_inference_tampering(req: TamperInferenceRequest = None, db: Session = Depends(get_db)):
    """DEMO ONLY: Simulate tampering of recorded inference detection telemetry."""
    record_id = req.record_id if req else None
    return TamperSimulator.simulate_inference_tampering(db, record_id=record_id)

@router.post("/restore")
def restore_demo_state(db: Session = Depends(get_db)):
    """DEMO ONLY: Instantly restore all assets, models, and inferences to clean verified state."""
    return TamperSimulator.restore_demo_state(db)
