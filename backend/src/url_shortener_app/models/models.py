from pydantic import BaseModel
from datetime import datetime

class DBReadyURL(BaseModel): 
    redir_target_url  : str 
    key : str 
    secret_key : str 
    is_active : bool 
    clicks : int

    user_email : str
    time_metadata : datetime = datetime.now()

class MultipleUrls(BaseModel):
    urls : list[DBReadyURL]

class ShortResponse(BaseModel): 
    created: str 
    invalid_urls : list[str]