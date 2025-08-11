import secrets 
import string



def create_random_key(): 
    characters = string.ascii_uppercase + string.ascii_lowercase + string.digits
    secret_key = "".join(secrets.choice(characters) for _ in range(6))
    return secret_key
