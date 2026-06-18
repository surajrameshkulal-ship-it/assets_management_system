from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "assetflow"
    secret_key: str = "dev-secret-change-in-production"
    access_token_expire_minutes: int = 480
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2"
    cors_origins: str = "http://localhost:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    class Config:
        env_file = ".env"


settings = Settings()
