from fastapi import FastAPI, WebSocket, Request, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi.responses import HTMLResponse
import asyncio
from dataclasses import dataclass
from products import products_router, portfolio_router, poem_router
from purchase import orders_router, payment_router, email_router, checkout_router, shipping_router

app = FastAPI(title="UIAPhotography API")

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # replace when frontend is ready
    allow_credentials=True,        
    allow_methods=["*"],          
    allow_headers=["*"],           
)

app.include_router(products_router, prefix="/products", tags=["Products"])
app.include_router(portfolio_router, tags=["Portfolio"])
app.include_router(poem_router, tags=["Pic & Poem"])
app.include_router(orders_router, tags=["Orders"])
app.include_router(payment_router, tags=["Payment"])
app.include_router(email_router, tags=["Email"])
app.include_router(checkout_router, tags=["Checkout"])
app.include_router(shipping_router, tags=["Shipping"])