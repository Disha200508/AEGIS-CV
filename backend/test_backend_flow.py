import json
from backend.app.database import SessionLocal
from backend.app.models import Asset, ModelRegistry, InferenceRecord, BlockchainBlock
from backend.app.core.cv_model import CVInferenceEngine
from backend.app.core.tamper_simulator import TamperSimulator
from backend.app.core.ledger import BlockchainLedger
from backend.app.core.crypto import calculate_inference_hash

def test_full_pipeline():
    db = SessionLocal()
    print("=== STEP 1: VERIFYING SEEDED ASSETS & DATA INTEGRITY ===")
    assets = db.query(Asset).all()
    assert len(assets) >= 3, f"Expected at least 3 assets, got {len(assets)}"
    for a in assets:
        print(f"  Asset: {a.filename} | Original SHA-256: {a.original_hash[:16]}... | Status: {a.status}")

    print("\n=== STEP 2: VERIFYING MODEL INTEGRITY ===")
    model = db.query(ModelRegistry).first()
    assert model is not None
    print(f"  Model: {model.model_name} | Weights Hash: {model.original_hash[:16]}... | Status: {model.status}")

    print("\n=== STEP 3: RUNNING CV INFERENCE & SEALING RECORD ===")
    engine = CVInferenceEngine.get_instance()
    test_asset = assets[0]
    result = engine.run_inference(test_asset.filepath)
    print(f"  Inference detected {result['detected_count']} targets in {test_asset.filename}")
    for det in result['detections']:
        print(f"    -> [{det['target_id']}] {det['label']} (Conf: {det['confidence']})")

    # Generate attestation seal
    timestamp_str = "2026-09-27T16:20:00"
    attestation_seal = calculate_inference_hash(
        image_hash=test_asset.original_hash,
        model_hash=model.original_hash,
        predictions=result['detections'],
        timestamp_str=timestamp_str
    )
    print(f"  Attestation Seal: {attestation_seal[:24]}...")

    print("\n=== STEP 4: VERIFYING BLOCKCHAIN LEDGER ===")
    ledger_report = BlockchainLedger.verify_chain(db)
    print(f"  Chain Valid: {ledger_report['is_valid']} | Total Blocks: {ledger_report['total_blocks']}")
    assert ledger_report['is_valid'] is True

    print("\n=== STEP 5: SIMULATING DATASET TAMPERING ===")
    tamper_data_res = TamperSimulator.simulate_dataset_tampering(db, test_asset.id)
    print(f"  Tamper simulated: {tamper_data_res['status']} | Tampered Hash: {tamper_data_res['tampered_hash'][:16]}...")
    db.refresh(test_asset)
    assert test_asset.status == "TAMPERED"

    print("\n=== STEP 6: SIMULATING MODEL TAMPERING ===")
    tamper_model_res = TamperSimulator.simulate_model_tampering(db, model.id)
    print(f"  Model Tamper simulated: {tamper_model_res['status']} | Tampered Hash: {tamper_model_res['tampered_hash'][:16]}...")
    db.refresh(model)
    assert model.status == "TAMPERED"

    print("\n=== STEP 7: RESTORING DEMO STATE ===")
    restore_res = TamperSimulator.restore_demo_state(db)
    print(f"  Restore: {restore_res['message']}")
    db.refresh(test_asset)
    db.refresh(model)
    assert test_asset.status == "VERIFIED"
    assert model.status == "VERIFIED"
    print(f"  After restore: Asset={test_asset.status}, Model={model.status}")

    print("\n=== ALL BACKEND CAPABILITIES VERIFIED SUCCESSFULLY! ===")
    db.close()

if __name__ == "__main__":
    test_full_pipeline()
