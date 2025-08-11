#built-in imports 
from typing import Annotated

from fastapi.responses import RedirectResponse
from url_shortener_app.api.v1.auth_routes import auth 
from url_shortener_app.api.v1.shortener_routes import shortener_api
from fastapi import Depends, FastAPI, HTTPException
import uvicorn 
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorDatabase

#custom imports 
from url_shortener_app.core.settings import get_settings
from url_shortener_app.core.database_ import create_connection, close_connection, get_db
from url_shortener_app.logging_.custom_logger import logger


settings = get_settings()


@asynccontextmanager
async def lifespan(app : FastAPI): 
    await create_connection()
    yield 
    await close_connection()

app = FastAPI(lifespan=lifespan)

app.include_router(auth)
app.include_router(shortener_api)

app.add_middleware(CORSMiddleware, 
                allow_origins=[settings.frontend_url],
                allow_credentials=True,
                allow_methods=["*"],
                allow_headers=["*"],)

@app.get("/{secret_key}")
async def retrieve_shortened(secret_key: str, db: Annotated[AsyncIOMotorDatabase, Depends(get_db)]):
    """Retrieve and redirect to the original URL using the secret key"""
    try: 
        retrieved_url = await db['urls'].find_one_and_update(
            {"secret_key": secret_key, "is_active": True}, 
            {"$inc": {"clicks": 1}}, 
            return_document=True
        )
        if retrieved_url: 
            return RedirectResponse(retrieved_url['redir_target_url'], status_code=301)
        else: 
            raise HTTPException(status_code=404, detail="URL not found or inactive")
    except HTTPException:
        raise  
    except Exception as e: 
        logger.error(f"Error retrieving URL with secret key {secret_key}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__": 
    uvicorn.run(app, host=settings.uvicorn_host, port=settings.uvicorn_port)

