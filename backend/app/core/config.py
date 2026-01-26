from pydantic import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Backend API"
    api_v1_prefix: str = "/api/v1"
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/app"
    redis_url: str = "redis://localhost:6379/0"

    class Config:
        env_file = ".env"


settings = Settings()
