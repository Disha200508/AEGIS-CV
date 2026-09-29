from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.config import STORAGE_DIR
from backend.app.database import engine, Base
from backend.app.api.data_routes import router as data_router
from backend.app.api.model_routes import router as model_router
from backend.app.api.inference_routes import router as inference_router
from backend.app.api.ledger_routes import router as ledger_router
from backend.app.api.simulation_routes import router as simulation_router
from backend.app.api.stats_routes import router as stats_router

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AEGIS-CV // Defense Integrity Assurance Platform",
    description="Trustworthy Computer Vision Integrity Assurance for Data, Models and Inference Outputs in Multi-Contributor Pipelines",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static file storage for serving ingested and annotated recon images
app.mount("/storage", StaticFiles(directory=str(STORAGE_DIR)), name="storage")

# Include Routers
app.include_router(data_router, prefix="/api")
app.include_router(model_router, prefix="/api")
app.include_router(inference_router, prefix="/api")
app.include_router(ledger_router, prefix="/api")
app.include_router(simulation_router, prefix="/api")
app.include_router(stats_router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "ONLINE",
        "system": "AEGIS-CV Integrity Assurance Engine",
        "standard": "SHA-256 Multi-Contributor Supply Chain Verification",
        "blockchain_ledger": "ACTIVE"
    }
