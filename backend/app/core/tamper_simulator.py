import os
import shutil
import json
from pathlib import Path
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models import Asset, ModelRegistry, InferenceRecord
from backend.app.core.crypto import calculate_file_hash, calculate_inference_hash
from backend.app.core.ledger import BlockchainLedger
from backend.app.config import DEMO_TAMPER_DIR, UPLOADS_DIR, MODELS_DIR

class TamperSimulator:
    @staticmethod
    def simulate_dataset_tampering(db: Session, asset_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Simulate an adversary modifying an aerial recon image or training sample.
        Leaves original safe; operates on a demo duplicate.
        """
        query = db.query(Asset)
        if asset_id:
            asset = query.filter(Asset.id == asset_id).first()
        else:
            asset = query.filter(Asset.status == "VERIFIED").first()

        if not asset:
            return {"success": False, "error": "No verified asset available to simulate tampering."}

        orig_path = Path(asset.filepath)
        if not orig_path.exists():
            return {"success": False, "error": f"Asset file not found at {orig_path}"}

        # Safe pristine backup
        pristine_backup = orig_path.parent / f"pristine_{orig_path.name}"
        if not pristine_backup.exists():
            shutil.copy2(orig_path, pristine_backup)

        # Create tampered copy in DEMO_TAMPER_DIR
        tampered_copy_path = DEMO_TAMPER_DIR / f"tampered_{orig_path.name}"
        shutil.copy2(orig_path, tampered_copy_path)

        # Alter image bytes (inject demo adversary watermark bytes at end of file)
        with open(tampered_copy_path, "ab") as f:
            f.write(b"\x00\xFF\xAA\x55[ADVERSARIAL_PAYLOAD_SIMULATED_TAMPER]")

        new_hash = calculate_file_hash(tampered_copy_path)

        # Update asset record to point to tampered state
        asset.filepath = str(tampered_copy_path)
        asset.current_hash = new_hash
        asset.status = "TAMPERED"

        # Log to immutable blockchain ledger
        BlockchainLedger.record_event(
            db=db,
            event_type="DATASET_TAMPER_DETECTED",
            data_payload={
                "asset_id": asset.id,
                "filename": asset.filename,
                "original_sha256": asset.original_hash,
                "tampered_sha256": new_hash,
                "violation": "SHA-256 Checksum Mismatch: Unauthorized byte modification detected in image asset."
            },
            component="DATA",
            asset_identifier=asset.filename,
            status="TAMPER_DETECTED"
        )

        return {
            "success": True,
            "asset_id": asset.id,
            "filename": asset.filename,
            "original_hash": asset.original_hash,
            "tampered_hash": new_hash,
            "status": "TAMPERED",
            "message": f"Dataset tampering successfully simulated for {asset.filename}. Cryptographic signature invalidated."
        }

    @staticmethod
    def simulate_model_tampering(db: Session, model_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Simulate an adversary tampering with CV model weights (Trojan / Backdoor injection).
        Uses safe demo copy without damaging original weights.
        """
        query = db.query(ModelRegistry)
        if model_id:
            model = query.filter(ModelRegistry.id == model_id).first()
        else:
            model = query.filter(ModelRegistry.status == "VERIFIED").first()

        if not model:
            return {"success": False, "error": "No verified model found in registry to simulate tampering."}

        orig_path = Path(model.filepath)
        if not orig_path.exists():
            # If dummy or not yet initialized, create clean weights file first
            orig_path.parent.mkdir(parents=True, exist_ok=True)
            with open(orig_path, "wb") as f:
                f.write(b"[YOLOv8n-VERIFIED-TACTICAL-WEIGHTS-MASTER-VERSION-1.0]")
            model.original_hash = calculate_file_hash(orig_path)

        # Pristine backup
        pristine_backup = orig_path.parent / f"pristine_{orig_path.name}"
        if not pristine_backup.exists():
            shutil.copy2(orig_path, pristine_backup)

        # Create tampered copy
        tampered_model_path = DEMO_TAMPER_DIR / f"tampered_{orig_path.name}"
        shutil.copy2(orig_path, tampered_model_path)

        with open(tampered_model_path, "ab") as f:
            f.write(b"[BACKDOOR_TRIGGER_INSERTION_SIMULATED_ATTACK]")

        new_hash = calculate_file_hash(tampered_model_path)

        model.filepath = str(tampered_model_path)
        model.current_hash = new_hash
        model.status = "TAMPERED"

        BlockchainLedger.record_event(
            db=db,
            event_type="MODEL_INTEGRITY_VIOLATION",
            data_payload={
                "model_id": model.id,
                "model_name": model.model_name,
                "expected_sha256": model.original_hash,
                "detected_sha256": new_hash,
                "violation": "Model weight hash mismatch! Unauthorized backdoor or binary replacement detected."
            },
            component="MODEL",
            asset_identifier=model.model_name,
            status="TAMPER_DETECTED"
        )

        return {
            "success": True,
            "model_id": model.id,
            "model_name": model.model_name,
            "original_hash": model.original_hash,
            "tampered_hash": new_hash,
            "status": "TAMPERED",
            "message": f"Model tampering simulated on {model.model_name}. Deployment halted by verification guard."
        }

    @staticmethod
    def simulate_inference_tampering(db: Session, record_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Simulate an attacker altering inference output telemetry (e.g. changing detected targets or coordinates)
        while the original signed hash seal remains unchanged.
        """
        query = db.query(InferenceRecord)
        if record_id:
            record = query.filter(InferenceRecord.id == record_id).first()
        else:
            record = query.filter(InferenceRecord.status == "VERIFIED").order_by(InferenceRecord.id.desc()).first()

        if not record:
            return {"success": False, "error": "No verified inference record available to simulate tampering."}

        try:
            preds = json.loads(record.predictions_json)
        except Exception:
            preds = []

        # Tamper prediction data: Inject a falsified stealth target or alter existing target counts
        tampered_preds = list(preds)
        tampered_preds.append({
            "target_id": "TGT-SPOOFED",
            "raw_class": "uav_drone",
            "label": "Hostile Stealth Drone (UNAUTHORIZED INJECTION)",
            "confidence": 0.999,
            "bbox": [50, 50, 200, 200]
        })

        # Save altered predictions without updating the original cryptographically sealed record_hash
        record.predictions_json = json.dumps(tampered_preds)
        record.detected_count = len(tampered_preds)
        record.status = "TAMPERED"

        # Calculate what the hash should be now to demonstrate the mismatch
        recalculated_hash = calculate_inference_hash(
            image_hash=record.image_hash,
            model_hash=record.model_hash,
            predictions=tampered_preds,
            timestamp_str=record.executed_at.isoformat()
        )

        BlockchainLedger.record_event(
            db=db,
            event_type="INFERENCE_OUTPUT_TAMPER_DETECTED",
            data_payload={
                "record_id": record.id,
                "asset_filename": record.asset_filename,
                "sealed_record_hash": record.record_hash,
                "recomputed_hash": recalculated_hash,
                "violation": "Inference cryptographic seal broken! Detection payload altered post-inference."
            },
            component="INFERENCE",
            asset_identifier=f"INFER-REC-#{record.id}",
            status="TAMPER_DETECTED"
        )

        return {
            "success": True,
            "record_id": record.id,
            "asset_filename": record.asset_filename,
            "sealed_record_hash": record.record_hash,
            "recomputed_hash": recalculated_hash,
            "status": "TAMPERED",
            "message": f"Inference record #{record.id} altered. Cryptographic attestation seal broken."
        }

    @staticmethod
    def restore_demo_state(db: Session) -> Dict[str, Any]:
        """
        Restore all assets, models, and inference records back to their pristine, verified states.
        Safely clears demo tampering modifications.
        """
        # 1. Restore Assets
        assets = db.query(Asset).all()
        restored_assets = 0
        for asset in assets:
            normal_path = UPLOADS_DIR / asset.filename
            pristine = UPLOADS_DIR / f"pristine_{asset.filename}"
            if pristine.exists():
                shutil.copy2(pristine, normal_path)
            asset.filepath = str(normal_path)
            asset.current_hash = asset.original_hash
            asset.status = "VERIFIED"
            restored_assets += 1

        # 2. Restore Models
        models = db.query(ModelRegistry).all()
        restored_models = 0
        for model in models:
            clean_filename = Path(model.filepath).name.replace("tampered_", "")
            normal_path = MODELS_DIR / clean_filename
            pristine = MODELS_DIR / f"pristine_{clean_filename}"
            if pristine.exists():
                shutil.copy2(pristine, normal_path)
            model.filepath = str(normal_path)
            model.current_hash = model.original_hash
            model.status = "VERIFIED"
            restored_models += 1

        # 3. Restore Inference Records
        inferences = db.query(InferenceRecord).all()
        restored_inferences = 0
        for inf in inferences:
            # If predictions were tampered by adding TGT-SPOOFED, filter it out
            try:
                preds = json.loads(inf.predictions_json)
                clean_preds = [p for p in preds if p.get("target_id") != "TGT-SPOOFED"]
                inf.predictions_json = json.dumps(clean_preds)
                inf.detected_count = len(clean_preds)
                # Re-seal record hash properly
                inf.record_hash = calculate_inference_hash(
                    image_hash=inf.image_hash,
                    model_hash=inf.model_hash,
                    predictions=clean_preds,
                    timestamp_str=inf.executed_at.isoformat()
                )
            except Exception:
                pass
            inf.status = "VERIFIED"
            restored_inferences += 1

        # 4. Clean demo tamper directory
        if DEMO_TAMPER_DIR.exists():
            for f in DEMO_TAMPER_DIR.glob("*"):
                try:
                    f.unlink()
                except Exception:
                    pass

        # Record restoration event on ledger
        BlockchainLedger.record_event(
            db=db,
            event_type="SYSTEM_STATE_RESTORED",
            data_payload={
                "restored_assets": restored_assets,
                "restored_models": restored_models,
                "restored_inferences": restored_inferences,
                "message": "All pipeline components restored to mathematically verified pristine state."
            },
            component="SIMULATION",
            asset_identifier="SYSTEM-INTEGRITY",
            status="SUCCESS"
        )

        return {
            "success": True,
            "restored_assets": restored_assets,
            "restored_models": restored_models,
            "restored_inferences": restored_inferences,
            "message": "System integrity restored. All demo tampering neutralized."
        }
