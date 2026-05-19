import os
from motor.motor_asyncio import AsyncIOMotorClient
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
motor_client = AsyncIOMotorClient(MONGO_URI)
db = motor_client["fintech_ai_advisor"]

# ── Collections ────────────────────────────────────────────────────────────────
transactions_collection = db["transactions"]   # legacy – kept for backward compat
expenses_collection     = db["expenses"]        # new structured collection
users_collection        = db["users"]           # user accounts + budgets

# ── Pinecone ───────────────────────────────────────────────────────────────────
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
pc = Pinecone(api_key=PINECONE_API_KEY) if PINECONE_API_KEY else None
INDEX_NAME = "fintech-advisor"


def init_pinecone():
    if not pc:
        return None
    if INDEX_NAME not in pc.list_indexes().names():
        pc.create_index(
            name=INDEX_NAME,
            dimension=1024,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )
    return pc.Index(INDEX_NAME)


pinecone_index = init_pinecone()
