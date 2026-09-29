import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
STORAGE_DIR = BASE_DIR / "storage"
UPLOADS_DIR = STORAGE_DIR / "uploads"
MODELS_DIR = STORAGE_DIR / "models"
INFERENCE_OUTPUTS_DIR = STORAGE_DIR / "inference_outputs"
DEMO_TAMPER_DIR = STORAGE_DIR / "demo_tamper"

# Ensure all directories exist
for d in [STORAGE_DIR, UPLOADS_DIR, MODELS_DIR, INFERENCE_OUTPUTS_DIR, DEMO_TAMPER_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Database
DATABASE_URL = f"sqlite:///{BASE_DIR}/storage/integrity.db"

# Model Config
DEFAULT_MODEL_NAME = "YOLOv8n-Tactical-Recon"
DEFAULT_MODEL_VERSION = "v1.0.0"
DEFAULT_MODEL_PATH = MODELS_DIR / "yolov8n.pt"

# Demo Military/Surveillance classes mapping (COCO subset with tactical labeling)
TACTICAL_CLASS_MAP = {
    "person": "Personnel (Ground)",
    "car": "Light Utility Vehicle (LUV)",
    "truck": "Heavy Transport Truck",
    "bus": "Personnel Transport Carrier",
    "aeroplane": "Fixed-Wing Aircraft / UAV",
    "airplane": "Fixed-Wing Aircraft / UAV",
    "boat": "Naval Patrol Vessel",
    "motorcycle": "High-Mobility Recon Cycle",
    "bicycle": "Civ/Auxiliary Transport",
    "train": "Rail Supply Logistics",
}
