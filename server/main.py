from fastapi import Depends, FastAPI, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from db.engine import get_async_session
from db.models import Messages
from ws_manager import manager
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

@app.websocket('/ws/{username}')
async def websocket_endpoint(websocket: WebSocket, username: str, session: AsyncSession = Depends(get_async_session)):
    await manager.connect(websocket)

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