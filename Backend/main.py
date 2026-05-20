from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import Any, Dict
from pathlib import Path

app = FastAPI(title="Jupyter-Frontend Híd API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

stored_data: Dict[str, Any] = {}

CURRENT_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = CURRENT_DIR.parent

@app.post("/api/upload")
async def receive_from_simi(data: Dict[str, Any]):
    global stored_data
    stored_data = data
    return {"status": "success", "message": "Adat sikeresen fogadva Simitől!"}

@app.get("/api/data")
async def send_to_bence():
    return stored_data

app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")