from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os
from datetime import datetime, timedelta
import bcrypt
from .db import get_db
from .crud import get_user_by_username, create_user

SECRET = os.environ.get('JWT_SECRET', 'change-me')
ALGORITHM = 'HS256'

security = HTTPBearer()


def create_access_token(data: dict, expires_delta: int = 60 * 24):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET, algorithm=ALGORITHM)


def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail='Invalid token')


def authenticate_user(db, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def register_user(db, username: str, password: str):
    existing = get_user_by_username(db, username)
    if existing:
        raise HTTPException(status_code=400, detail='User already exists')
    hashed = get_password_hash(password)
    return create_user(db, username, hashed)
