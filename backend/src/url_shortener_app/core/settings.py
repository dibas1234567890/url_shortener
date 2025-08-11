from datetime import timedelta
from functools import lru_cache
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongo_uri : str = "mongodb://localhost:27019"
    db_name : str = "shortener_db"
    uvicorn_host : str = "0.0.0.0"
    uvicorn_port : int = 8500
    secret_key : str 
    frontend_url : str = "http://localhost:3100"
    token_expiry_time : timedelta = timedelta(minutes=30)
    class Config: 
        env_file = ".env"

@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    return settings 

