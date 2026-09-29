import datetime
import json
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.app.models import BlockchainBlock, AuditLog
from backend.app.core.crypto import calculate_block_hash, canonical_json

GENESIS_PREVIOUS_HASH = "0" * 64

class BlockchainLedger:
    @staticmethod
    def ensure_genesis(db: Session) -> BlockchainBlock:
        """Ensure Genesis block exists in the ledger."""
        first_block = db.query(BlockchainBlock).filter(BlockchainBlock.block_index == 0).first()
        if not first_block:
            genesis_time = datetime.datetime.utcnow()
            timestamp_str = genesis_time.isoformat()
            event_type = "GENESIS"
            payload = json.dumps({
                "message": "AEGIS-CV Integrity Assurance Blockchain Initialized",
                "authority": "DEFENSE-CYBER-COMMAND",
                "standard": "SHA-256 Chain of Custody",
                "timestamp": timestamp_str
            })
            block_hash = calculate_block_hash(
                index=0,
                timestamp_str=timestamp_str,
                event_type=event_type,
                data_payload=payload,
                previous_hash=GENESIS_PREVIOUS_HASH,
                nonce=0
            )
            first_block = BlockchainBlock(
                block_index=0,
                timestamp=genesis_time,
                event_type=event_type,
                data_payload=payload,
                previous_hash=GENESIS_PREVIOUS_HASH,
                nonce=0,
                block_hash=block_hash
            )
            db.add(first_block)
            db.commit()
            db.refresh(first_block)
        return first_block

    @staticmethod
    def record_event(
        db: Session,
        event_type: str,
        data_payload: Dict[str, Any],
        component: str = "LEDGER",
        asset_identifier: str = "SYSTEM",
        status: str = "SUCCESS"
    ) -> BlockchainBlock:
        """Append a new verified event block to the immutable chain."""
        BlockchainLedger.ensure_genesis(db)

        last_block = db.query(BlockchainBlock).order_by(BlockchainBlock.block_index.desc()).first()
        new_index = last_block.block_index + 1 if last_block else 0
        previous_hash = last_block.block_hash if last_block else GENESIS_PREVIOUS_HASH

        now = datetime.datetime.utcnow()
        timestamp_str = now.isoformat()
        payload_str = canonical_json(data_payload)

        block_hash = calculate_block_hash(
            index=new_index,
            timestamp_str=timestamp_str,
            event_type=event_type,
            data_payload=payload_str,
            previous_hash=previous_hash,
            nonce=0
        )

        new_block = BlockchainBlock(
            block_index=new_index,
            timestamp=now,
            event_type=event_type,
            data_payload=payload_str,
            previous_hash=previous_hash,
            nonce=0,
            block_hash=block_hash
        )
        db.add(new_block)

        # Also write to high-level AuditLog for quick dashboard filtering
        audit_log = AuditLog(
            timestamp=now,
            event=event_type,
            component=component,
            asset_identifier=asset_identifier,
            status=status,
            details=json.dumps(data_payload),
            hash_signature=block_hash
        )
        db.add(audit_log)
        db.commit()
        db.refresh(new_block)
        return new_block

    @staticmethod
    def verify_chain(db: Session) -> Dict[str, Any]:
        """Verify cryptographic integrity of the entire blockchain ledger."""
        blocks: List[BlockchainBlock] = db.query(BlockchainBlock).order_by(BlockchainBlock.block_index.asc()).all()
        if not blocks:
            return {"is_valid": True, "total_blocks": 0, "message": "Ledger is empty"}

        for i, block in enumerate(blocks):
            # 1. Verify index sequence
            if block.block_index != i:
                return {
                    "is_valid": False,
                    "total_blocks": len(blocks),
                    "corrupted_block_index": block.block_index,
                    "error": f"Block index sequence broken at block {block.block_index}, expected {i}."
                }

            # 2. Verify previous hash linkage
            if i == 0:
                if block.previous_hash != GENESIS_PREVIOUS_HASH:
                    return {
                        "is_valid": False,
                        "total_blocks": len(blocks),
                        "corrupted_block_index": 0,
                        "error": "Genesis block previous hash has been modified."
                    }
            else:
                prev_block = blocks[i - 1]
                if block.previous_hash != prev_block.block_hash:
                    return {
                        "is_valid": False,
                        "total_blocks": len(blocks),
                        "corrupted_block_index": block.block_index,
                        "error": f"Chain link broken at block #{block.block_index}: previous_hash '{block.previous_hash[:12]}...' does not match block #{prev_block.block_index} hash '{prev_block.block_hash[:12]}...'."
                    }

            # 3. Recalculate block hash
            timestamp_str = block.timestamp.isoformat()
            recomputed_hash = calculate_block_hash(
                index=block.block_index,
                timestamp_str=timestamp_str,
                event_type=block.event_type,
                data_payload=block.data_payload,
                previous_hash=block.previous_hash,
                nonce=block.nonce
            )
            if recomputed_hash != block.block_hash:
                return {
                    "is_valid": False,
                    "total_blocks": len(blocks),
                    "corrupted_block_index": block.block_index,
                    "error": f"Block #{block.block_index} data has been tampered with! Recomputed hash '{recomputed_hash[:12]}...' does not match recorded hash '{block.block_hash[:12]}...'."
                }

        return {
            "is_valid": True,
            "total_blocks": len(blocks),
            "message": "All blockchain blocks mathematically verified. Cryptographic chain of custody intact.",
            "latest_block_hash": blocks[-1].block_hash if blocks else None
        }
