from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.database import engine, Base
from .api.routes import complaints, samples

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name, version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins,
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(complaints.router, prefix="/api", tags=["complaints"])
app.include_router(samples.router, prefix="/api/samples", tags=["samples"])

@app.get("/api/health")
def health():
    return {"status": "ok", "engine": "groq", "models": [settings.model_primary, settings.model_context]}
