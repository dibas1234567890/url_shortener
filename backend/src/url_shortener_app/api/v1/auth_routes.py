#built-in imports
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi.security import OAuth2PasswordBearer
from datetime import timedelta, datetime
from jose import JWTError, jwt
from fastapi import status

#custom-imports
from url_shortener_app.schema.user_schema import User
from url_shortener_app.core.database_ import get_db
from url_shortener_app.core.settings import get_settings
from url_shortener_app.logging_.custom_logger import logger

settings = get_settings()

auth = APIRouter(prefix="/v1/auth")

hash = CryptContext(schemes=['bcrypt'],deprecated = "auto")

oauth = OAuth2PasswordBearer(tokenUrl="api/auth/login")


async def create_token(data: dict, expires: Optional[timedelta] = None) -> str:
    """
    Create a JWT token.

    Args:
        data (dict): Dictionary containing user info, e.g. {"sub": user_email}.
        expires (Optional[timedelta]): Token expiry duration. Defaults to 15 minutes if not provided.

    Returns:
        str: Encoded JWt token string.
    """
    to_encode = data.copy()
    expire = datetime.now() + (expires if expires else timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, key=settings.secret_key, algorithm="HS256")
    return encoded_jwt


async def get_current_user(token : str = Depends(oauth), db : AsyncIOMotorDatabase = Depends(get_db)): 
    """
    Extract and validate the current user from a JWT token.

    Args:
        token (str): JWT token provided via OAuth2 authentication scheme.
        db (AsyncIOMotorDatabase): Asynchronous MongoDB database instance for user lookup.

    Raises:
        HTTPException: If the token is invalid, expired, or if the user does not exist in the database.

    Returns:
        dict: The user document retrieved from the database.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try: 
       payload =  jwt.decode(token, key = settings.secret_key, algorithms=['HS256'])
       user_email : str = payload.get("sub")
       if user_email is None: 
        raise credentials_exception
       user = await db['users'].find_one({"email" : user_email}, {})
       return user


    except JWTError:
        raise credentials_exception 
    
@auth.post('/register')
async def crete_user(user : User, db: AsyncIOMotorDatabase = Depends(get_db)):
    """
    Register a new user in the system.

    Args:
        user (User): Pydantic model containing user registration data.
        db (AsyncIOMotorDatabase): MongoDB async database instance injected via dependency.

    Returns:
        dict: Success message or error details.

    Raises:
        HTTPException: If user already exists or database operation fails.
    """
    try: 
            
        users_collection = db['users']
        user_ecists = await users_collection.find_one({"email" : user.email})
        hased_pw = hash.hash(user.password)
        
        if user_ecists: 
            raise HTTPException(status_code=400, detail="User already exists couldn't create, please login")
        else: 
            user.password = hased_pw
            user_created = await users_collection.insert_one(user.model_dump())
        
        if user_created.inserted_id: 
            return {"message" : "User created succesfully", "user_creation" : True}
    except Exception as e: 
        logger.error(f"Error in {__name__}", e)
        raise HTTPException(status_code=500, detail="couldn't create user")

@auth.post('/login')
async def login(request : Request, user : User, db : AsyncIOMotorDatabase  = Depends(get_db)):
    """
    Authenticate a user and provide a JWT access token upon successful login.

    Args:
        user (User): Pydantic model containing login credentials (email and password).
        db (AsyncIOMotorDatabase): Asynchronous MongoDB database instance injected via dependency.

    Returns:
        dict: Access token and token type if authentication is successful;
              otherwise, an error message indicating failure.

    Raises:
        HTTPException: May be raised for authentication failures or if user does not exist.
    """
    try: 
        request = request

        users_collection = db['users']
        
        user_in_db = await users_collection.find_one({"email" : user.email}, {})

        if user: 
            user_password = hash.verify(user.password, user_in_db['password'])

            if user_password: 
                return { "access_token" : await create_token(data={"sub" : user.email}), "token_type" : "bearer"}
        else: 
            return {"message" : "user doesn't exist"}
    except Exception as e: 
        logger.error(f"Error in {__name__}", e)
        raise  e 