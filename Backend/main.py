from fastapi import FastAPI
from fastapi.responses import FileResponse
from typing import Any, Dict

app = FastAPI(title="Jupyter-HTML Bridge API")

stored_data: Dict[str, Any] = {}

@app.get("/")
async def serve_frontend():
    return FileResponse("index.html")

@app.post("/api/upload")
async def receive_from_jupyter(data: Dict[str, Any]):
    global stored_data
    stored_data = data
    return {"message": "Sikeresen megkaptam és eltároltam a JSON-t!"}

@app.get("/api/data")
async def get_data_for_html():
    return stored_data