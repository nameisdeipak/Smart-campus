from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.prediction import router as prediction_router


app = FastAPI(
    title="Unified Campus AI",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prediction_router)


@app.get("/")
def root():
    return {
        "success": True,
        "message": "Unified Campus AI Service is running",
    }


@app.get("/health")
def health():
    return {
        "success": True,
        "service": "Unified Campus AI",
        "status": "healthy",
    }