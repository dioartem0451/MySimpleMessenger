from fastapi import Depends, FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from db.engine import get_async_session
from db.models import Messages, Users
from ws_manager import manager
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
app = FastAPI()

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)

@app.post('/Users/createUser/{username}/{password}')
async def create_user(username: str, password: str, session: AsyncSession = Depends(get_async_session)):
    hashed_pass = hash_password(password)
    obj = Users(
        username=username,
        password=hashed_pass
    )

    session.add(obj)
    await session.commit()

@app.post('/Users/loginUser/{username}/{password}')
async def login_user(username: str, password: str, session: AsyncSession = Depends(get_async_session)):
    query = select(Users).where(Users.username == username)
    result = await session.execute(query)
    user = result.scalars().first()
    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")

@app.websocket('/ws/{username}')
async def websocket_endpoint(websocket: WebSocket, username: str, session: AsyncSession = Depends(get_async_session)):
    await manager.connect(websocket)
    await manager.broadcast(f'-Пользователь {username} присоединился к чату')
    try:
        while True:
            message = await websocket.receive_text()

            data = f'{username}-{message}'
            await manager.broadcast(data)

            obj = Messages(
                message = data
            )

            session.add(obj)
            await session.commit()

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f'-Пользователь {username} покинул чат')
@app.get('/getMessages')
async def getMessages(session: AsyncSession = Depends(get_async_session)):
    query = select(Messages)
    result = await session.execute(query)
    data = result.scalars().all()
    list = []
    for i in data:
        list.append(i.message)
    return list
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
) 