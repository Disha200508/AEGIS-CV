import hashlib
import json
from pathlib import Path
from typing import Any, Tuple

def calculate_file_hash(filepath: str | Path) -> str:
    """Calculate SHA-256 hash of a file reading in chunks."""
    sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            sha256.update(chunk)
    return sha256.hexdigest()

def calculate_bytes_hash(data: bytes) -> str:
    """Calculate SHA-256 hash of raw byte data."""
    return hashlib.sha256(data).hexdigest()

def canonical_json(data: Any) -> str:
    """Produce deterministic canonical JSON string for hashing."""
    return json.dumps(data, sort_keys=True, separators=(",", ":"))

def calculate_inference_hash(image_hash: str, model_hash: str, predictions: Any, timestamp_str: str) -> str:
    """
    Cryptographically bind input image hash, model hash, predictions, and timestamp into an attestation hash.
    H(image_hash || model_hash || canonical_predictions || timestamp_str)
    """
    canonical_preds = canonical_json(predictions) if not isinstance(predictions, str) else predictions
    payload = f"{image_hash}:{model_hash}:{canonical_preds}:{timestamp_str}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()

def verify_file_integrity(filepath: str | Path, expected_hash: str) -> Tuple[bool, str]:
    """Verify if the file still matches its original hash."""
    if not Path(filepath).exists():
        return False, "FILE_NOT_FOUND"
    current_hash = calculate_file_hash(filepath)
    is_valid = (current_hash.lower() == expected_hash.lower())
    return is_valid, current_hash

def calculate_block_hash(
    index: int,
    timestamp_str: str,
    event_type: str,
    data_payload: str,
    previous_hash: str,
    nonce: int = 0
) -> str:
    """Compute cryptographic hash of a blockchain block."""
    raw_str = f"{index}:{timestamp_str}:{event_type}:{data_payload}:{previous_hash}:{nonce}"
    return hashlib.sha256(raw_str.encode("utf-8")).hexdigest()
