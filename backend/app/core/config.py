from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Pharos - Customer Complaint Management"
    database_url: str = "postgresql://owner:surya@localhost:5432/pharos_qms"
    groq_api_key: str = ""
    model_primary: str = "gemma2-9b-it"      # fast extraction / risk / summary
    model_context: str = "llama-3.3-70b-versatile"  # deep reasoning: root cause / CAPA
    cors_origins: list = ["http://localhost:5173", "http://127.0.0.1:5173"]

    class Config:
        env_file = ".env"

settings = Settings()
