from typing import Optional
from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[str] = "citizen"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None

class UserOut(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True
