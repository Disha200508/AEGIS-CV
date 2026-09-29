import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import Asset, ModelRegistry, InferenceRecord, BlockchainBlock, AuditLog
from backend.app.core.ledger import BlockchainLedger
from backend.app.api.model_routes import ensure_default_model

router = APIRouter(prefix="/stats", tags=["Dashboard Statistics"])

@router.get("/overview")
def get_dashboard_overview(db: Session = Depends(get_db)):
    """
    Returns aggregate statistics and primary integrity indicators:
    - DATA INTEGRITY: VERIFIED / TAMPERED
    - MODEL INTEGRITY: VERIFIED / TAMPERED
    - INFERENCE: VERIFIED / TAMPERED
    - LEDGER: VALID / INVALID
    """
    BlockchainLedger.ensure_genesis(db)
    active_model = ensure_default_model(db)

    # 1. Assets metrics
    total_assets = db.query(Asset).count()
    tampered_assets = db.query(Asset).filter(Asset.status == "TAMPERED").count()
    verified_assets = db.query(Asset).filter(Asset.status == "VERIFIED").count()
    data_status = "TAMPERED" if tampered_assets > 0 else "VERIFIED"

    # 2. Model metrics
    model_status = "TAMPERED" if active_model.status == "TAMPERED" else "VERIFIED"

    # 3. Inference metrics
    total_inferences = db.query(InferenceRecord).count()
    tampered_inferences = db.query(InferenceRecord).filter(InferenceRecord.status == "TAMPERED").count()
    inference_status = "TAMPERED" if tampered_inferences > 0 else "VERIFIED"

    # 4. Ledger metrics
    ledger_verification = BlockchainLedger.verify_chain(db)
    ledger_status = "VALID" if ledger_verification["is_valid"] else "INVALID"
    total_blocks = ledger_verification.get("total_blocks", 0)

    # 5. Total security violations detected across the pipeline
    violations_count = tampered_assets + (1 if model_status == "TAMPERED" else 0) + tampered_inferences
    if ledger_status == "INVALID":
        violations_count += 1

    # 6. Recent security events & audit logs
    recent_logs = db.query(AuditLog).order_by(AuditLog.id.desc()).limit(15).all()
    audit_trail = [
        {
            "id": l.id,
            "timestamp": l.timestamp.isoformat() if l.timestamp else None,
            "event": l.event,
            "component": l.component,
            "asset": l.asset_identifier,
            "status": l.status,
            "hash": l.hash_signature,
            "details": l.details
        }
        for l in recent_logs
    ]

    return {
        "status_cards": {
            "data_integrity": data_status,
            "model_integrity": model_status,
            "inference_integrity": inference_status,
            "ledger_integrity": ledger_status
        },
        "metrics": {
            "total_assets": total_assets,
            "verified_assets": verified_assets,
            "tampered_assets": tampered_assets,
            "detected_violations": violations_count,
            "total_inferences": total_inferences,
            "total_blocks": total_blocks,
            "active_model_name": active_model.model_name,
            "active_model_hash": active_model.original_hash
        },
        "audit_trail": audit_trail
    }
