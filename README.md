# AEGIS-CV // Defense-Grade Computer Vision Integrity Assurance Platform
### Enterprise & Tactical Multi-Contributor Integrity Verification System
> **“Trustworthy Computer Vision Integrity Assurance for Data, Models and Inference Outputs in Multi-Contributor Pipelines.”**

---

## 1. Overview & Problem Definition

In modern computer vision deployments—particularly in defense reconnaissance, autonomous systems, border security, and critical infrastructure surveillance—pipelines are rarely monolithic. They depend on **multi-contributor supply chains**:
- Multiple distributed field units and annotators provide aerial/optical imagery.
- External laboratories train, fine-tune, or optimize neural network checkpoints.
- Edge gateways and forward operating bases run live inference on tactical sensors.

### The Threat Vectors Addressed
1. **Data Layer**: Data poisoning, covert pixel alterations, label switching, metadata tampering, and duplicate re-uploads.
2. **Model Layer**: Supply-chain backdoor injection, Trojan triggers, unauthorized model weight tampering or checkpoint substitution.
3. **Inference Output Layer**: Post-inference telemetry falsification (altering detected object counts, classifications, or bounding box coordinates), deepfake output forgery, and lack of non-repudiation.
4. **Audit Trail**: Vulnerability to audit log tampering or log deletion.

**AEGIS-CV** solves this by establishing a **mathematically verifiable cryptographic chain of custody** across Data, Models, and Inferences using genuine **SHA-256 seals** and an **immutable append-only blockchain-style ledger**.

---

## 2. Key Features Implemented

| Module | Core Capability | Demonstration |
| :--- | :--- | :--- |
| **Data Integrity** | Upload images, generate genuine SHA-256 hashes, detect duplicates, and verify file integrity by recalculation. | Detects byte alterations in reconnaissance imagery instantly. |
| **Model Integrity** | Register YOLOv8n model, compute weight checksums, and enforce pre-flight integrity verification before inference. | Detects backdoor/Trojan injection or checkpoint replacement. |
| **AI Inference** | Lightweight YOLO model localized targets (vehicles, UAVs, personnel, naval vessels) with confidence scores and tactical HUD bounding boxes. | Works reliably on CPU with tactical annotations and zero external API dependencies. |
| **Inference Integrity** | Cryptographically binds: `H(image_hash || model_hash || predictions || timestamp)` into a signed Attestation Seal. | Proves detection results were not modified post-inference. |
| **Immutable Ledger** | Lightweight append-only blockchain ledger where every block cryptographically links `previous_hash` and `block_hash`. | Validates chain continuity and detects any ledger tampering. |
| **Attack Simulator** | Dedicated **DEMO-ONLY** adversary attack simulator with safe duplicate tampering and 1-click clean state restoration. | Allows live demonstrations of attacks and instant recovery without damaging originals. |
| **Tactical Dashboard** | Professional cybersecurity/defense command interface (Dark tactical HUD theme). | Displays real-time status cards: `DATA INTEGRITY`, `MODEL INTEGRITY`, `INFERENCE`, `LEDGER`. |

---

## 3. Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios
- **Backend**: FastAPI, Python 3.12, Uvicorn
- **Database**: SQLite with SQLAlchemy ORM
- **Computer Vision**: OpenCV, Ultralytics YOLOv8n, NumPy, PIL
- **Cryptography & Ledger**: SHA-256, Merkle Chain, Lightweight Python Blockchain

---

## 4. Folder Structure

```
sih-ps228-integrity/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── data_routes.py        # Image upload, SHA-256 hashing, duplicate check, recalculation
│   │   │   ├── model_routes.py       # Model registration, weight checksum, pre-flight guard
│   │   │   ├── inference_routes.py   # YOLO inference, Attestation Seal generation & verification
│   │   │   ├── ledger_routes.py      # Blockchain block retrieval and chain integrity verification
│   │   │   ├── simulation_routes.py  # Safe demo attack simulator & 1-click restore
│   │   │   └── stats_routes.py       # Real-time status cards, metrics, and audit trail
│   │   ├── core/
│   │   │   ├── crypto.py             # SHA-256 hashing, canonical JSON, inference binding
│   │   │   ├── cv_model.py           # YOLO inference, tactical HUD annotations, class mapping
│   │   │   ├── ledger.py             # Blockchain engine: append-only blocks & chain validator
│   │   │   └── tamper_simulator.py   # Safe demo attack simulator with pristine backups
│   │   ├── config.py                 # Paths, DB URL, tactical classes
│   │   ├── database.py               # SQLite engine & session
│   │   ├── models.py                 # SQLAlchemy DB models
│   │   └── main.py                   # FastAPI app entry point & CORS
│   ├── requirements.txt              # Pinned Python dependencies
│   ├── seed_demo_data.py             # Synthetic defense recon generator & model seeder
│   └── test_backend_flow.py          # End-to-end automated test suite
├── frontend/                         # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Defense header with status & attack trigger
│   │   │   ├── StatusOverview.jsx    # 4 Status Badges + Pipeline Metrics
│   │   │   ├── DataIntegrityPanel.jsx# Ingest, SHA-256 seal, duplicate check, verify
│   │   │   ├── ModelIntegrityPanel.jsx# Model registry, weight checksum, pre-inference guard
│   │   │   ├── InferencePanel.jsx    # YOLO inference, tactical HUD, signed attestation
│   │   │   ├── AuditLedgerView.jsx   # Blockchain visualizer & real-time audit trail
│   │   │   └── TamperSimulationModal.jsx # Demo adversary attack simulator & restore
│   │   ├── services/
│   │   │   └── api.js                # Axios client
│   │   ├── App.jsx                   # Main layout & live polling coordinator
│   │   └── main.jsx                  # React DOM mount
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── storage/                          # Local data directory
│   ├── uploads/                      # Ingested images & pristine backups
│   ├── models/                       # YOLO model weights & pristine backups
│   ├── inference_outputs/            # Annotated images with tactical HUD
│   ├── demo_tamper/                  # Safe copies used for attack simulations
│   └── integrity.db                  # SQLite database
├── start.sh                          # One-click startup script (Backend + Frontend)
└── README.md
```

---

## 5. Quick Start Instructions

### Option 1: One-Click Startup (Recommended)
From the root project directory:
```bash
./start.sh
```
This automatically initializes the database, generates safe synthetic defense recon images, launches the FastAPI backend on port 8000, and launches the Vite frontend on port 5173.

### Option 2: Manual Step-by-Step

**Step 1: Start Backend**
```bash
source venv/bin/activate
PYTHONPATH=. uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Step 2: Start Frontend**
```bash
cd frontend
npm run dev
```

Open your browser and navigate to:
- **Interactive Dashboard**: `http://localhost:5173`
- **FastAPI Interactive Docs**: `http://127.0.0.1:8000/docs`

---

## 6. End-to-End Operational Demonstration Flow

Follow this exact workflow when evaluating the platform:

1. **Step 1: System Baseline Overview**
   - Show the top 4 status indicators on the dashboard:
     - `DATA INTEGRITY`: `✓ VERIFIED` (Green)
     - `MODEL INTEGRITY`: `✓ VERIFIED` (Green)
     - `INFERENCE INTEGRITY`: `✓ VERIFIED` (Green)
     - `BLOCKCHAIN LEDGER`: `✓ VALID` (Green)
   - Explain how all 3 pre-seeded recon images (Aerial Convoy, Perimeter UAV, Coastal Patrol) are cryptographically sealed with genuine SHA-256 hashes and recorded on the immutable blockchain ledger.

2. **Step 2: Ingest Image & Duplicate Detection**
   - Switch to the **1. DATA INTEGRITY** tab.
   - Upload any image or re-upload one of the existing demo images.
   - Show the immediate duplicate detection banner: the system matches the SHA-256 checksum and flags that this identical file already exists in the repository without duplicating storage.

3. **Step 3: Model Integrity Verification**
   - Switch to the **2. MODEL INTEGRITY** tab.
   - Show the certified `YOLOv8n-Tactical-Recon` model checkpoint and its registered SHA-256 weight hash.
   - Click **VERIFY WEIGHT CHECKSUM** to demonstrate real-time supply chain verification.

4. **Step 4: AI Inference & Cryptographic Attestation**
   - Switch to the **3. AI INFERENCE & ATTESTATION** tab.
   - Select an image (e.g. `recon_aerial_convoy.jpg`) and click **EXECUTE AI INFERENCE**.
   - Show the pre-flight checks passing, followed by the tactical HUD output:
     - Target IDs (`TGT-01`, `TGT-02`), bounding brackets, and confidence percentages.
     - The generated **Cryptographic Attestation Seal** binding:
       $$\text{Image Hash} + \text{Model Hash} + \text{Detections} + \text{Timestamp}$$
   - Click **VERIFY SEAL** to mathematically verify the record.

5. **Step 5: Blockchain Ledger Inspection**
   - Switch to the **4. BLOCKCHAIN AUDIT LEDGER** tab.
   - Point out the chronological blockchain cards showing `previous_hash` and `block_hash`.
   - Click **VERIFY BLOCKCHAIN INTEGRITY** to show zero corruptions across the entire chain of custody.

6. **Step 6: Live Adversary Attack Simulation (The Climax)**
   - Click the orange **ATTACK SIMULATOR** button in the navbar.
   - Click **TAMPER DATASET**:
     - Notice the dashboard instantly updates to `DATA INTEGRITY: ⚠ TAMPERED` in glowing crimson red with a real-time defense alert banner!
     - Try running AI inference on the tampered image: the system **halts execution** with a security violation error!
   - Click **TAMPER INFERENCE**:
     - Notice `INFERENCE INTEGRITY: ⚠ TAMPERED`. The cryptographic seal mismatch proves that the detection payload was altered post-inference.
   - Show the **Audit Trail** table: the `TAMPER_DETECTED` event is permanently recorded in the immutable ledger.

7. **Step 7: 1-Click Restoration**
   - Open the Simulator and click **RESTORE DEMO STATE (1-CLICK)**.
   - All components immediately return to `✓ VERIFIED` (Green), and a `SYSTEM_STATE_RESTORED` block is added to the blockchain ledger.
