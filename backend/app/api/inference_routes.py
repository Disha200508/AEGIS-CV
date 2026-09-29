import json
import datetime
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import Asset, ModelRegistry, InferenceRecord
from backend.app.core.crypto import calculate_file_hash, calculate_inference_hash, verify_file_integrity
from backend.app.core.cv_model import CVInferenceEngine
from backend.app.core.ledger import BlockchainLedger
from backend.app.api.model_routes import ensure_default_model

router = APIRouter(prefix="/inference", tags=["AI Inference & Output Integrity"])

class RunInferenceRequest(BaseModel):
    asset_id: int
    conf_threshold: Optional[float] = 0.25
    enforce_integrity_check: Optional[bool] = True

@router.post("/run")
def run_ai_inference(req: RunInferenceRequest, db: Session = Depends(get_db)):
    """
    Execute AI Computer Vision Inference with mandatory Pre-flight Data & Model Integrity Checks.
    Generates a cryptographically sealed Inference Attestation Record and appends to Blockchain.
    """
    # 1. Fetch & Verify Asset Integrity
    asset = db.query(Asset).filter(Asset.id == req.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset ID #{req.asset_id} not found.")

    if req.enforce_integrity_check:
        is_asset_valid, current_asset_hash = verify_file_integrity(asset.filepath, asset.original_hash)
        if not is_asset_valid or asset.status == "TAMPERED":
            BlockchainLedger.record_event(
                db=db,
                event_type="INFERENCE_HALTED_DATA_VIOLATION",
                data_payload={
                    "asset_id": asset.id,
                    "filename": asset.filename,
                    "reason": "Execution blocked: Input image failed SHA-256 integrity verification."
                },
                component="INFERENCE",
                asset_identifier=asset.filename,
                status="ALERT"
            )
            raise HTTPException(
                status_code=403,
                detail=f"SECURITY VIOLATION: Input image '{asset.filename}' has been tampered with or corrupted! Inference halted."
            )

    # 2. Fetch & Verify Model Integrity
    model = ensure_default_model(db)
    if req.enforce_integrity_check:
        is_model_valid, current_model_hash = verify_file_integrity(model.filepath, model.original_hash)
        if not is_model_valid or model.status == "TAMPERED":
            BlockchainLedger.record_event(
                db=db,
                event_type="INFERENCE_HALTED_MODEL_VIOLATION",
                data_payload={
                    "model_id": model.id,
                    "model_name": model.model_name,
                    "reason": "Execution blocked: Model weights checksum modified. Trojan/backdoor threat."
                },
                component="INFERENCE",
                asset_identifier=model.model_name,
                status="ALERT"
            )
            raise HTTPException(
                status_code=403,
                detail=f"SECURITY VIOLATION: Model '{model.model_name}' failed cryptographic verification! Potential backdoor detected."
            )

    # 3. Run CV Inference
    engine = CVInferenceEngine.get_instance()
    try:
        inf_result = engine.run_inference(asset.filepath, conf_threshold=req.conf_threshold)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference execution failed: {str(e)}")

    now = datetime.datetime.utcnow()
    timestamp_str = now.isoformat()
    predictions = inf_result["detections"]
    detected_count = inf_result["detected_count"]
    output_filename = inf_result["output_filename"]

    # 4. Generate Cryptographic Inference Attestation Hash
    # Binds: image_hash + model_hash + predictions payload + execution timestamp
    record_hash = calculate_inference_hash(
        image_hash=asset.original_hash,
        model_hash=model.original_hash,
        predictions=predictions,
        timestamp_str=timestamp_str
    )

    # 5. Store Inference Record
    new_record = InferenceRecord(
        asset_id=asset.id,
        asset_filename=asset.filename,
        image_hash=asset.original_hash,
        model_id=model.id,
        model_hash=model.original_hash,
        predictions_json=json.dumps(predictions),
        detected_count=detected_count,
        record_hash=record_hash,
        status="VERIFIED",
        output_image_path=inf_result["output_image_path"],
        executed_at=now,
        verified_at=now
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    # 6. Append to Blockchain Ledger
    BlockchainLedger.record_event(
        db=db,
        event_type="INFERENCE_CERTIFIED",
        data_payload={
            "record_id": new_record.id,
            "asset_filename": asset.filename,
            "image_sha256": asset.original_hash,
            "model_sha256": model.original_hash,
            "detected_targets": detected_count,
            "attestation_seal": record_hash,
            "timestamp": timestamp_str
        },
        component="INFERENCE",
        asset_identifier=f"INFER-REC-#{new_record.id}",
        status="SUCCESS"
    )

    return {
        "record_id": new_record.id,
        "asset_filename": asset.filename,
        "image_hash": asset.original_hash,
        "model_hash": model.original_hash,
        "detected_count": detected_count,
        "detections": predictions,
        "record_hash": record_hash,
        "status": "VERIFIED",
        "output_image_url": f"/storage/inference_outputs/{output_filename}",
        "executed_at": timestamp_str,
        "message": f"Inference completed. {detected_count} tactical targets localized with cryptographic attestation seal."
    }

@router.get("/records")
def list_inference_records(db: Session = Depends(get_db)):
    """List historical inference records with attestation signatures."""
    records = db.query(InferenceRecord).order_by(InferenceRecord.id.desc()).limit(20).all()
    results = []
    for r in records:
        try:
            preds = json.loads(r.predictions_json)
        except Exception:
            preds = []
        out_filename = Path(r.output_image_path).name if r.output_image_path else ""
        results.append({
            "id": r.id,
            "asset_filename": r.asset_filename,
            "image_hash": r.image_hash,
            "model_hash": r.model_hash,
            "detected_count": r.detected_count,
            "detections": preds,
            "record_hash": r.record_hash,
            "status": r.status,
            "output_image_url": f"/storage/inference_outputs/{out_filename}" if out_filename else None,
            "executed_at": r.executed_at.isoformat() if r.executed_at else None,
            "verified_at": r.verified_at.isoformat() if r.verified_at else None
        })
    return results

@router.post("/verify/{record_id}")
def verify_inference_record(record_id: int, db: Session = Depends(get_db)):
    """
    Verify inference record authenticity. Recalculates cryptographic seal from
    image hash, model hash, stored predictions, and timestamp.
    Detects if bounding boxes, classes, or target counts have been altered post-inference.
    """
    record = db.query(InferenceRecord).filter(InferenceRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Inference record not found.")

    try:
        preds = json.loads(record.predictions_json)
    except Exception:
        preds = []

    # Recalculate attestation hash
    recomputed_hash = calculate_inference_hash(
        image_hash=record.image_hash,
        model_hash=record.model_hash,
        predictions=preds,
        timestamp_str=record.executed_at.isoformat()
    )

    is_valid = (recomputed_hash.lower() == record.record_hash.lower())
    record.status = "VERIFIED" if is_valid else "TAMPERED"
    record.verified_at = datetime.datetime.utcnow()
    db.commit()

    if not is_valid:
        BlockchainLedger.record_event(
            db=db,
            event_type="INFERENCE_OUTPUT_TAMPER_DETECTED",
            data_payload={
                "record_id": record.id,
                "asset_filename": record.asset_filename,
                "sealed_hash": record.record_hash,
                "recomputed_hash": recomputed_hash,
                "alert": "SECURITY ALERT: Inference prediction data modified! Cryptographic binding failed."
            },
            component="INFERENCE",
            asset_identifier=f"INFER-REC-#{record.id}",
            status="TAMPER_DETECTED"
        )
    else:
        BlockchainLedger.record_event(
            db=db,
            event_type="INFERENCE_RECORD_VERIFIED",
            data_payload={
                "record_id": record.id,
                "attestation_seal": record.record_hash,
                "result": "Inference attestation seal verified. Target predictions unaltered."
            },
            component="INFERENCE",
            asset_identifier=f"INFER-REC-#{record.id}",
            status="SUCCESS"
        )

    return {
        "record_id": record.id,
        "is_valid": is_valid,
        "recorded_hash": record.record_hash,
        "recomputed_hash": recomputed_hash,
        "status": record.status,
        "message": "Inference record verified: Attestation seal intact." if is_valid else "ALERT: Inference telemetry altered post-generation!"
    }
