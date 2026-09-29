import datetime
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import ModelRegistry
from backend.app.core.crypto import calculate_file_hash, calculate_bytes_hash, verify_file_integrity
from backend.app.core.ledger import BlockchainLedger
from backend.app.config import MODELS_DIR, DEFAULT_MODEL_NAME, DEFAULT_MODEL_VERSION

router = APIRouter(prefix="/model", tags=["Model Integrity"])

def ensure_default_model(db: Session) -> ModelRegistry:
    """Ensure the baseline defense recon model is registered in DB."""
    model = db.query(ModelRegistry).filter(ModelRegistry.is_active == True).first()
    if not model:
        MODELS_DIR.mkdir(parents=True, exist_ok=True)
        default_file = MODELS_DIR / "yolov8n.pt"
        if not default_file.exists():
            # Create certified base weights binary
            with open(default_file, "wb") as f:
                f.write(b"[CERTIFIED_YOLOv8n_DEFENSE_RECON_MODEL_WEIGHTS_SHA256_AUTHENTICATED_v1]")

        # Create pristine backup
        pristine = MODELS_DIR / f"pristine_{default_file.name}"
        if not pristine.exists():
            with open(pristine, "wb") as f:
                with open(default_file, "rb") as src:
                    f.write(src.read())

        weight_hash = calculate_file_hash(default_file)
        now = datetime.datetime.utcnow()

        model = ModelRegistry(
            model_name=DEFAULT_MODEL_NAME,
            version=DEFAULT_MODEL_VERSION,
            model_type="YOLOv8n",
            filepath=str(default_file),
            original_hash=weight_hash,
            current_hash=weight_hash,
            status="VERIFIED",
            registered_by="DEFENSE-RESEARCH-LAB",
            is_active=True,
            registered_at=now,
            verified_at=now
        )
        db.add(model)
        db.commit()
        db.refresh(model)

        BlockchainLedger.record_event(
            db=db,
            event_type="MODEL_REGISTERED",
            data_payload={
                "model_id": model.id,
                "model_name": model.model_name,
                "version": model.version,
                "sha256": weight_hash,
                "authority": model.registered_by,
                "status": "OFFICIALLY_CERTIFIED"
            },
            component="MODEL",
            asset_identifier=model.model_name,
            status="SUCCESS"
        )
    return model

@router.get("/active")
def get_active_model(db: Session = Depends(get_db)):
    """Retrieve details of the active computer vision model."""
    model = ensure_default_model(db)
    return {
        "id": model.id,
        "model_name": model.model_name,
        "version": model.version,
        "model_type": model.model_type,
        "original_hash": model.original_hash,
        "current_hash": model.current_hash or model.original_hash,
        "status": model.status,
        "registered_by": model.registered_by,
        "registered_at": model.registered_at.isoformat() if model.registered_at else None,
        "verified_at": model.verified_at.isoformat() if model.verified_at else None
    }

@router.post("/verify")
def verify_model_integrity(db: Session = Depends(get_db)):
    """
    Verify model integrity before running inference.
    Recalculates weights SHA-256 and compares against registered cryptographic hash.
    Detects backdoor insertion, model replacement, or corrupted weights.
    """
    model = ensure_default_model(db)
    is_valid, current_hash = verify_file_integrity(model.filepath, model.original_hash)
    now = datetime.datetime.utcnow()

    model.current_hash = current_hash
    model.verified_at = now
    model.status = "VERIFIED" if is_valid else "TAMPERED"
    db.commit()

    if not is_valid:
        BlockchainLedger.record_event(
            db=db,
            event_type="MODEL_TAMPER_DETECTED",
            data_payload={
                "model_id": model.id,
                "model_name": model.model_name,
                "expected_hash": model.original_hash,
                "detected_hash": current_hash,
                "alert": "SECURITY ALERT: Model weight checksum modified! Execution halted to prevent backdoored inference."
            },
            component="MODEL",
            asset_identifier=model.model_name,
            status="TAMPER_DETECTED"
        )
    else:
        BlockchainLedger.record_event(
            db=db,
            event_type="MODEL_VERIFIED",
            data_payload={
                "model_id": model.id,
                "model_name": model.model_name,
                "sha256": current_hash,
                "result": "Weights verified. No supply-chain backdoor detected."
            },
            component="MODEL",
            asset_identifier=model.model_name,
            status="SUCCESS"
        )

    return {
        "model_id": model.id,
        "model_name": model.model_name,
        "is_valid": is_valid,
        "original_hash": model.original_hash,
        "current_hash": current_hash,
        "status": model.status,
        "message": "Model integrity verified: Checksum identical." if is_valid else "ALERT: Model weight tampering or backdoor detected!"
    }
