from motor.motor_asyncio import AsyncIOMotorClient

from url_shortener_app.core import settings

settings = settings.get_settings()

async def create_connection(): 
    global client 
    client = AsyncIOMotorClient(settings.mongo_uri)

async def close_connection(): 
    global client 
    client.close()

async def get_db(): 
    return client[settings.db_name]