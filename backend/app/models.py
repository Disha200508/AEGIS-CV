import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from backend.app.database import Base

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    filepath = Column(String)
    original_hash = Column(String(64), index=True)
    current_hash = Column(String(64), nullable=True)
    file_size = Column(Integer)
    mime_type = Column(String, default="image/jpeg")
    status = Column(String, default="VERIFIED")  # VERIFIED, TAMPERED, DUPLICATE
    contributor_id = Column(String, default="RECON-UNIT-01")
    is_demo_copy = Column(Boolean, default=False)
    metadata_json = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)
    verified_at = Column(DateTime, nullable=True)

class ModelRegistry(Base):
    __tablename__ = "model_registry"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, index=True)
    version = Column(String, default="v1.0.0")
    model_type = Column(String, default="YOLOv8n")
    filepath = Column(String)
    original_hash = Column(String(64), index=True)
    current_hash = Column(String(64), nullable=True)
    status = Column(String, default="VERIFIED")  # VERIFIED, TAMPERED
    registered_by = Column(String, default="DEFENSE-CV-HQ")
    is_active = Column(Boolean, default=True)
    registered_at = Column(DateTime, default=datetime.datetime.utcnow)
    verified_at = Column(DateTime, nullable=True)

class InferenceRecord(Base):
    __tablename__ = "inference_records"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, nullable=True)
    asset_filename = Column(String)
    image_hash = Column(String(64))
    model_id = Column(Integer, nullable=True)
    model_hash = Column(String(64))
    predictions_json = Column(Text)  # List of detections with bbox & confidence
    detected_count = Column(Integer, default=0)
    record_hash = Column(String(64), index=True)
    status = Column(String, default="VERIFIED")  # VERIFIED, TAMPERED
    output_image_path = Column(String, nullable=True)
    executed_at = Column(DateTime, default=datetime.datetime.utcnow)
    verified_at = Column(DateTime, nullable=True)

class BlockchainBlock(Base):
    __tablename__ = "blockchain_blocks"

    id = Column(Integer, primary_key=True, index=True)
    block_index = Column(Integer, unique=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    event_type = Column(String, index=True)
    data_payload = Column(Text)
    previous_hash = Column(String(64))
    nonce = Column(Integer, default=0)
    block_hash = Column(String(64), index=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    event = Column(String)
    component = Column(String)  # DATA, MODEL, INFERENCE, LEDGER, SIMULATION
    asset_identifier = Column(String)
    status = Column(String)  # SUCCESS, WARNING, ALERT, TAMPER_DETECTED
    details = Column(Text)
    hash_signature = Column(String(64), nullable=True)
