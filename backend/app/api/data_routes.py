import shutil
import datetime
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import Asset
from backend.app.core.crypto import calculate_file_hash, calculate_bytes_hash, verify_file_integrity
from backend.app.core.ledger import BlockchainLedger
from backend.app.config import UPLOADS_DIR

router = APIRouter(prefix="/data", tags=["Data Integrity"])

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    contributor_id: str = Form("DEFENSE-RECON-ALFA"),
    db: Session = Depends(get_db)
):
    """
    Upload an optical/aerial reconnaissance image, compute genuine SHA-256 hash,
    detect duplicates, and register asset with blockchain ledger.
    """
    contents = await file.read()
    file_size = len(contents)
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")

    # Calculate genuine SHA-256 hash of uploaded bytes
    file_hash = calculate_bytes_hash(contents)

    # Check for duplicate files
    duplicate = db.query(Asset).filter(Asset.original_hash == file_hash).first()
    if duplicate:
        BlockchainLedger.record_event(
            db=db,
            event_type="DATA_DUPLICATE_DETECTED",
            data_payload={
                "uploaded_filename": file.filename,
                "existing_asset_id": duplicate.id,
                "existing_filename": duplicate.filename,
                "sha256": file_hash,
                "action": "Duplicate file detected in repository."
            },
            component="DATA",
            asset_identifier=file.filename,
            status="WARNING"
        )
        return {
            "is_duplicate": True,
            "message": f"Duplicate file detected! Identical to registered asset '{duplicate.filename}' (ID: #{duplicate.id}).",
            "asset": {
                "id": duplicate.id,
                "filename": duplicate.filename,
                "original_hash": duplicate.original_hash,
                "status": "DUPLICATE",
                "uploaded_at": duplicate.uploaded_at.isoformat()
            }
        }

    # Save original file to uploads dir
    safe_filename = f"{datetime.datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
    target_path = UPLOADS_DIR / safe_filename
    with open(target_path, "wb") as f:
        f.write(contents)

    # Also keep pristine backup for safe tampering demo
    pristine_path = UPLOADS_DIR / f"pristine_{safe_filename}"
    with open(pristine_path, "wb") as f:
        f.write(contents)

    now = datetime.datetime.utcnow()
    new_asset = Asset(
        filename=safe_filename,
        filepath=str(target_path),
        original_hash=file_hash,
        current_hash=file_hash,
        file_size=file_size,
        mime_type=file.content_type or "image/jpeg",
        status="VERIFIED",
        contributor_id=contributor_id,
        is_demo_copy=False,
        uploaded_at=now,
        verified_at=now
    )
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)

    # Append to Blockchain Ledger
    BlockchainLedger.record_event(
        db=db,
        event_type="DATA_INGESTED",
        data_payload={
            "asset_id": new_asset.id,
            "filename": safe_filename,
            "contributor": contributor_id,
            "file_size_bytes": file_size,
            "sha256": file_hash,
            "chain_of_custody": "Cryptographically Sealed and Verified"
        },
        component="DATA",
        asset_identifier=safe_filename,
        status="SUCCESS"
    )

    return {
        "is_duplicate": False,
        "message": "Image successfully ingested, SHA-256 seal generated and recorded to immutable ledger.",
        "asset": {
            "id": new_asset.id,
            "filename": new_asset.filename,
            "original_hash": new_asset.original_hash,
            "file_size": new_asset.file_size,
            "status": new_asset.status,
            "uploaded_at": new_asset.uploaded_at.isoformat()
        }
    }

@router.get("/assets")
def list_assets(db: Session = Depends(get_db)):
    """List all registered dataset images."""
    assets = db.query(Asset).order_by(Asset.id.desc()).all()
    return [
        {
            "id": a.id,
            "filename": a.filename,
            "original_hash": a.original_hash,
            "current_hash": a.current_hash or a.original_hash,
            "file_size": a.file_size,
            "status": a.status,
            "contributor_id": a.contributor_id,
            "uploaded_at": a.uploaded_at.isoformat() if a.uploaded_at else None,
            "verified_at": a.verified_at.isoformat() if a.verified_at else None,
            "url": f"/storage/uploads/{a.filename}"
        }
        for a in assets
    ]

@router.post("/verify/{asset_id}")
def verify_asset(asset_id: int, db: Session = Depends(get_db)):
    """
    Recalculate SHA-256 of the asset file on disk and verify against original registered hash.
    Detects if dataset image has been tampered with or replaced.
    """
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found.")

    is_valid, current_hash = verify_file_integrity(asset.filepath, asset.original_hash)
    now = datetime.datetime.utcnow()

    asset.current_hash = current_hash
    asset.verified_at = now
    asset.status = "VERIFIED" if is_valid else "TAMPERED"
    db.commit()

    if not is_valid:
        BlockchainLedger.record_event(
            db=db,
            event_type="DATA_TAMPER_DETECTED",
            data_payload={
                "asset_id": asset.id,
                "filename": asset.filename,
                "expected_hash": asset.original_hash,
                "recalculated_hash": current_hash,
                "alert": "SECURITY VIOLATION: Image file checksum mismatch. Data has been altered or replaced."
            },
            component="DATA",
            asset_identifier=asset.filename,
            status="TAMPER_DETECTED"
        )
    else:
        BlockchainLedger.record_event(
            db=db,
            event_type="DATA_VERIFIED",
            data_payload={
                "asset_id": asset.id,
                "filename": asset.filename,
                "sha256": current_hash,
                "result": "Checksum match. File integrity verified."
            },
            component="DATA",
            asset_identifier=asset.filename,
            status="SUCCESS"
        )

    return {
        "asset_id": asset.id,
        "filename": asset.filename,
        "is_valid": is_valid,
        "original_hash": asset.original_hash,
        "current_hash": current_hash,
        "status": asset.status,
        "message": "Asset integrity verified: Checksum identical." if is_valid else "ALERT: Dataset tampering detected! Hash mismatch."
    }
