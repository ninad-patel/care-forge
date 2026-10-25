from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="CareForge API",
    description="Backend API for CareForge Multimodal Healthcare Content Generator",
    version="0.1.0",
)

# Configure CORS for local development and production frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root() -> dict[str, str]:
    """Root health check endpoint."""
    return {
        "status": "ok",
        "app": "CareForge API",
        "version": "0.1.0",
    }


@app.get("/api/health")
async def health_check() -> dict[str, str]:
    """API health status endpoint."""
    return {"status": "healthy"}
