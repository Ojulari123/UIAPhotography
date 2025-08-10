from fastapi import FastAPI, WebSocket, Request, WebSocketDisconnect
from contextlib import asynccontextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi.responses import HTMLResponse
import asyncio
from dataclasses import dataclass
from products import products_router
from purchase import orders_router, payment_router, email_router, checkout_router
# from func import 

app = FastAPI()

@dataclass
class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: list = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections: 
            await connection.send_text(message)

    async def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

connection_manager = ConnectionManager()

app.include_router(products_router, prefix="/products", tags=["Products"])
app.include_router(orders_router, tags=["Orders"])
app.include_router(payment_router, prefix="/payment", tags=["Payment"])
app.include_router(email_router, tags=["Email"])
app.include_router(checkout_router, tags=["Checkout"])
    