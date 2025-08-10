from fastapi import APIRouter
from core.database_ import get_db
from passlib.context import CryptContext
from schema.user_schema import User


db = get_db()
users_collection = db['users']

auth = APIRouter(prefix="/v1/auth")

hash = CryptContext(schemes=['bcrypt'],deprecated = "auto")

@auth('/register')
async def crete_user(user : User):
    user_ecists = await users_collection.find_one({"email" : user.email})
    hased_pw = hash.hash(user.password)
    
    if user_ecists: 
        return {"message" : "User already exists please try logging ig"}
    else: 
        user['password'] = hased_pw
        user_created = await user_ecists.insert(user)
    
    if user_created: 
        return {"message" : "User created succesfully", "user_creation" : True}

@auth('/login')
async def login(user : User): 
    user_in_db = await users_collection.find_one({"email" : user.email})

    if user: 
        return hash.verify(user_in_db['password'])
    else: 
        return {"message" : "user doesn't exist"}