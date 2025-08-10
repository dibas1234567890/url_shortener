from pydantic import BaseModel

class URLBase(BaseModel): 
    redir_target_url : str 

class URL(URLBase): 
    is_active : bool 
    clicks : int
  

class URLInfo(URL):
    url : str 
    admin_url : str