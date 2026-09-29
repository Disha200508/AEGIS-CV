import os
import cv2
import numpy as np
import datetime
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

from backend.app.config import UPLOADS_DIR, MODELS_DIR
from backend.app.database import SessionLocal, Base, engine
from backend.app.models import Asset, ModelRegistry
from backend.app.core.crypto import calculate_file_hash
from backend.app.core.ledger import BlockchainLedger
from backend.app.api.model_routes import ensure_default_model

def create_synthetic_defense_image_1():
    """Synthetic Scene 1: Aerial Recon Scan - Transport Convoy (Safe Demo Data)"""
    w, h = 800, 500
    # Satellite/aerial terrain ground (arid desert/brush)
    img = np.full((h, w, 3), (85, 115, 135), dtype=np.uint8)

    # Road across the terrain
    cv2.line(img, (0, 250), (w, 250), (60, 60, 65), 70)
    # Road dashed line
    for x in range(0, w, 40):
        cv2.line(img, (x, 250), (x + 20, 250), (160, 160, 170), 3)

    # Vehicle 1: Heavy Transport Truck (dark olive green rect)
    cv2.rectangle(img, (180, 225), (320, 275), (35, 65, 45), -1)
    cv2.rectangle(img, (180, 225), (320, 275), (20, 45, 30), 2)
    cv2.rectangle(img, (290, 228), (318, 272), (25, 45, 30), -1)  # Cabin

    # Vehicle 2: Light Utility Vehicle (desert tan rect)
    cv2.rectangle(img, (450, 230), (530, 270), (70, 110, 140), -1)
    cv2.rectangle(img, (450, 230), (530, 270), (50, 80, 100), 2)

    # Recon Drone crosshair grid watermark
    cv2.circle(img, (w // 2, h // 2), 120, (120, 160, 180), 1)
    cv2.line(img, (w // 2, h // 2 - 140), (w // 2, h // 2 + 140), (120, 160, 180), 1)
    cv2.line(img, (w // 2 - 140, h // 2), (w // 2 + 140, h // 2), (120, 160, 180), 1)

    # Tactical Telemetry Text
    font = cv2.FONT_HERSHEY_SIMPLEX
    cv2.putText(img, "SEC-SAT-04 // RECON CONVOY TRACKING // LAT: 32.1492 N  LON: 74.8812 E", (20, 30), font, 0.5, (200, 240, 255), 1)
    cv2.putText(img, "ALT: 3200M // SENSOR: IR-EO OPTICAL // SIMULATED SAFE DEMO", (20, h - 20), font, 0.45, (180, 220, 240), 1)

    return img

def create_synthetic_defense_image_2():
    """Synthetic Scene 2: Airfield Perimeter & UAV Runway (Safe Demo Data)"""
    w, h = 800, 500
    # Runway tarmac
    img = np.full((h, w, 3), (50, 50, 55), dtype=np.uint8)

    # Runway markings
    for y in range(80, h - 80, 60):
        cv2.rectangle(img, (w // 2 - 8, y), (w // 2 + 8, y + 35), (200, 200, 210), -1)

    # Side grassy perimeter
    cv2.rectangle(img, (0, 0), (120, h), (40, 70, 50), -1)
    cv2.rectangle(img, (w - 120, 0), (w, h), (40, 70, 50), -1)

    # Fixed-Wing Aircraft / UAV shape on tarmac
    # Fuselage
    cx, cy = 380, 260
    pts_fuselage = np.array([[cx - 15, cy - 80], [cx + 15, cy - 80], [cx + 12, cy + 90], [cx - 12, cy + 90]])
    cv2.fillPoly(img, [pts_fuselage], (140, 145, 150))
    # Wings
    pts_wings = np.array([[cx - 110, cy - 10], [cx + 110, cy - 10], [cx + 90, cy + 15], [cx - 90, cy + 15]])
    cv2.fillPoly(img, [pts_wings], (115, 120, 125))
    # Tail
    pts_tail = np.array([[cx - 35, cy + 70], [cx + 35, cy + 70], [cx + 25, cy + 85], [cx - 25, cy + 85]])
    cv2.fillPoly(img, [pts_tail], (115, 120, 125))

    # Ground support personnel silhouettes
    cv2.circle(img, (cx + 130, cy + 30), 6, (20, 20, 20), -1)
    cv2.rectangle(img, (cx + 126, cy + 36), (cx + 134, cy + 55), (35, 45, 30), -1)

    font = cv2.FONT_HERSHEY_SIMPLEX
    cv2.putText(img, "BASE-AIR-PERIMETER // TARGET: FIXED-WING UAV // SIMULATED SECURE DATA", (20, 30), font, 0.5, (0, 240, 255), 1)

    return img

def create_synthetic_defense_image_3():
    """Synthetic Scene 3: Maritime Coastal Recon - Patrol Vessel (Safe Demo Data)"""
    w, h = 800, 500
    # Ocean blue-green water
    img = np.full((h, w, 3), (120, 75, 40), dtype=np.uint8)

    # Water wake texture
    for _ in range(30):
        rx = np.random.randint(0, w)
        ry = np.random.randint(0, h)
        cv2.line(img, (rx, ry), (rx + 40, ry), (145, 95, 60), 1)

    # Naval Patrol Vessel Hull
    bx, by = 400, 240
    pts_hull = np.array([[bx - 120, by - 25], [bx + 90, by - 25], [bx + 140, by], [bx + 90, by + 25], [bx - 120, by + 25]])
    cv2.fillPoly(img, [pts_hull], (80, 85, 95))
    # Bridge / Deck
    cv2.rectangle(img, (bx - 50, by - 18), (bx + 30, by + 18), (140, 145, 155), -1)
    # Mast / Radar dome
    cv2.circle(img, (bx - 10, by), 8, (220, 220, 230), -1)

    font = cv2.FONT_HERSHEY_SIMPLEX
    cv2.putText(img, "COASTAL-RADAR // MARITIME SECTOR CHARLIE // SIMULATED SECURE DATA", (20, 30), font, 0.5, (0, 255, 136), 1)

    return img

def seed_all():
    """Generate demo images, register active model, compute genuine SHA-256 hashes, and add to ledger."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Ensure Genesis block and registered model
        BlockchainLedger.ensure_genesis(db)
        model = ensure_default_model(db)
        print(f"[Seed] Active Model verified: {model.model_name} (SHA-256: {model.original_hash[:16]}...)")

        demo_images = [
            ("recon_aerial_convoy.jpg", create_synthetic_defense_image_1(), "CONTRIBUTOR-SAT-RECON"),
            ("recon_drone_perimeter.jpg", create_synthetic_defense_image_2(), "CONTRIBUTOR-BASE-DEFENSE"),
            ("recon_naval_patrol.jpg", create_synthetic_defense_image_3(), "CONTRIBUTOR-MARITIME-OPS")
        ]

        for filename, img_mat, contrib in demo_images:
            filepath = UPLOADS_DIR / filename
            cv2.imwrite(str(filepath), img_mat)

            # Pristine backup
            pristine = UPLOADS_DIR / f"pristine_{filename}"
            cv2.imwrite(str(pristine), img_mat)

            file_hash = calculate_file_hash(filepath)
            file_size = filepath.stat().st_size

            existing = db.query(Asset).filter(Asset.filename == filename).first()
            if existing:
                existing.filepath = str(filepath)
                existing.original_hash = file_hash
                existing.current_hash = file_hash
                existing.status = "VERIFIED"
            else:
                now = datetime.datetime.utcnow()
                asset = Asset(
                    filename=filename,
                    filepath=str(filepath),
                    original_hash=file_hash,
                    current_hash=file_hash,
                    file_size=file_size,
                    mime_type="image/jpeg",
                    status="VERIFIED",
                    contributor_id=contrib,
                    uploaded_at=now,
                    verified_at=now
                )
                db.add(asset)
                db.commit()
                db.refresh(asset)

                BlockchainLedger.record_event(
                    db=db,
                    event_type="DATA_INGESTED",
                    data_payload={
                        "asset_id": asset.id,
                        "filename": filename,
                        "contributor": contrib,
                        "sha256": file_hash,
                        "status": "VERIFIED_GENUINE"
                    },
                    component="DATA",
                    asset_identifier=filename,
                    status="SUCCESS"
                )
                print(f"[Seed] Ingested {filename} -> SHA-256: {file_hash[:16]}... Recorded on Ledger.")

        db.commit()
        print("[Seed] Successfully seeded all demo tactical recon assets and initialized blockchain ledger.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_all()
