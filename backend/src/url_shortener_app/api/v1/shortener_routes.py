#built-in import
import logging
import sys
import asyncio
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
import secrets
from motor.motor_asyncio import AsyncIOMotorDatabase
import validators
from fastapi.responses import RedirectResponse
import datetime 

# custom imports
from url_shortener_app.utils.misc_utils import create_random_key
from url_shortener_app.api.v1.auth_routes import get_current_user
from url_shortener_app.core.database_ import get_db
from url_shortener_app.schema.url_schema import URLBase, URLInfo, URLUpdateActive
from url_shortener_app.schema.user_schema import User
from url_shortener_app.models.models import DBReadyURL
from url_shortener_app.logging_.custom_logger import logger
from url_shortener_app.models.models import ShortResponse


shortener_api = APIRouter(prefix="/v1/shortener")


async def create_shortened_url(url_string: str, user_email: str):
    """Create a shortened URL model without database dependency"""

    secret_key = create_random_key()
    key = create_random_key()

    final_url_model = DBReadyURL(
        redir_target_url=url_string,
        secret_key=secret_key,
        key=key,
        is_active=True,
        clicks=0,
        user_email=user_email,
        time_metadata=datetime.datetime.now()
    )
    logger.debug(f"Created shortened URL model for {url_string} with key {key}")
    return final_url_model


async def store_in_db(db_urls: list[DBReadyURL], db: AsyncIOMotorDatabase):
    """Store URLs in database"""
    try:
        dict_urls = [url.model_dump(exclude_none=True) for url in db_urls]
        result = await db['urls'].insert_many(dict_urls)
        logger.info(f"Inserted {len(result.inserted_ids)} URLs into database")
        return {"message": "Successfully inserted into db"}
    except Exception as e:
        logger.error(f"Error inserting URLs into DB: {e}")
        raise HTTPException(status_code=500, detail="Error during insertion")


@shortener_api.post("/", response_model=None)
async def create_short_url(
    urls: URLBase,
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
    user: User = Depends(get_current_user),
):
    """Create shortened URLs from a list of URLs"""
    db_urls = []
    tasks = []
    unhandled_cases = []

    for url in urls.redir_target_url:
        if not validators.url(url):
            unhandled_cases.append(url)
            logger.warning(f"Invalid URL skipped: {url}")
            continue
        tasks.append(create_shortened_url(url_string=url, user_email=user.get('email')))

    try:
        if tasks:
            db_urls = await asyncio.gather(*tasks)
            await store_in_db(db_urls, db=db)
    except Exception as e:
        logger.error(f"Error during URL creation or storage: {e}")
        raise HTTPException(status_code=500, detail=f"Error during URL processing: {str(e)}")

    logger.info(f"Processed {len(urls.redir_target_url)} URLs, created {len(db_urls)} shortened URLs")
    return {"created":db_urls, "invalid_urls" : unhandled_cases}



@shortener_api.get("/my-urls")
async def get_user_shortened_urls(
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
    user: User = Depends(get_current_user)
):
    """Return all shortened URLs for the logged-in user"""
    try:
        user_email = user.get("email")
        if not user_email:
            raise HTTPException(status_code=401, detail="User email not found in token")
        
        cursor = db['urls'].find({"user_email": user_email}, {})
        urls = await cursor.to_list(length=None)
        
        for u in urls:
            u["_id"] = str(u["_id"])
        
        return urls
    except Exception as e:
        logger.error(f"Error fetching URLs for user {user.get('email')}: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving user URLs")

@shortener_api.patch("/{secret_key}/active")  
async def update_url_active(
    secret_key: str, 
    update_data: URLUpdateActive, 
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: User = Depends(get_current_user)  
):
    """Update the active status of a URL"""
    try:
        url_entry = await db['urls'].find_one_and_update(
            {
                "secret_key": secret_key,
                "user_email": user.get("email")  
            },
            {"$set": {"is_active": update_data.is_active}},
            return_document=True
        )
        
        if not url_entry:
            raise HTTPException(status_code=404, detail="URL not found or you don't have permission")
        
        return {"secret_key": secret_key, "is_active": url_entry["is_active"]}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating URL {secret_key}: {e}")
        raise HTTPException(status_code=500, detail="Error updating URL status")
    
