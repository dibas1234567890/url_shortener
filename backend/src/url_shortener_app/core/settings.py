from functools import lru_cache
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongo_uri : str = "mongodb://localhost:27017"
    db_name : str = "shortener_db"
    class Config: 
        env_file = ""

@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    return settings 

