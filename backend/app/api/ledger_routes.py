import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import BlockchainBlock
from backend.app.core.ledger import BlockchainLedger

router = APIRouter(prefix="/ledger", tags=["Blockchain Ledger"])

@router.get("/blocks")
def list_blocks(db: Session = Depends(get_db)):
    """Retrieve all chronological blocks in the immutable blockchain audit ledger."""
    BlockchainLedger.ensure_genesis(db)
    blocks = db.query(BlockchainBlock).order_by(BlockchainBlock.block_index.desc()).all()
    results = []
    for b in blocks:
        try:
            payload = json.loads(b.data_payload)
        except Exception:
            payload = b.data_payload

        results.append({
            "block_index": b.block_index,
            "timestamp": b.timestamp.isoformat() if b.timestamp else None,
            "event_type": b.event_type,
            "data_payload": payload,
            "previous_hash": b.previous_hash,
            "nonce": b.nonce,
            "block_hash": b.block_hash
        })
    return results

@router.post("/verify")
def verify_ledger(db: Session = Depends(get_db)):
    """
    Cryptographically verify the entire blockchain audit ledger.
    Recalculates block hashes and validates previous_hash continuity across the chain.
    """
    verification_result = BlockchainLedger.verify_chain(db)
    return verification_result
