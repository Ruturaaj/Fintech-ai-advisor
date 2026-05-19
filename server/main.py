from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import google.generativeai as genai
import os
from datetime import datetime
from dotenv import load_dotenv
from database import transactions_collection, expenses_collection, users_collection, pinecone_index

load_dotenv()

app = FastAPI(title="FinTech AI Advisor API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))
gemini = genai.GenerativeModel("gemini-2.0-flash")


# ── Pydantic Models ────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    query: str


class ExpenseInput(BaseModel):
    category:    str
    subCategory: str                    = ""
    date:        str
    amount:      float
    description: str                    = ""
    merchant:    str                    = ""
    meta:        Dict[str, Any]         = Field(default_factory=dict)
    status:      str                    = "completed"


class ChatResponse(BaseModel):
    advice:     str
    source_ids: List[str]
    warnings:   List[str]


class UserBudgets(BaseModel):
    food:          Optional[float] = 15000
    transport:     Optional[float] = 5000
    rent:          Optional[float] = 30000
    subscription:  Optional[float] = 2000
    entertainment: Optional[float] = 5000
    shopping:      Optional[float] = 10000


# ── Helper ─────────────────────────────────────────────────────────────────────

def _serialize(doc: dict) -> dict:
    """Convert ObjectId and datetime to JSON-safe types."""
    doc["_id"] = str(doc["_id"])
    for k, v in doc.items():
        if isinstance(v, datetime):
            doc[k] = v.isoformat()
    return doc


def _build_expense_doc(expense: ExpenseInput) -> dict:
    """Build the full expenses document with category-specific meta defaults."""
    base_meta = expense.meta.copy()

    # Inject category-specific meta defaults when not provided
    cat = expense.category.lower()
    if cat == "rent" and "modeOfPayment" not in base_meta:
        base_meta.setdefault("modeOfPayment", "UPI")
        base_meta.setdefault("upiRef", None)
        base_meta.setdefault("bankRef", None)
        base_meta.setdefault("billingMonth", expense.date[:7])   # YYYY-MM
        base_meta.setdefault("landlordName", expense.merchant or "")
        base_meta.setdefault("propertyAddress", "")

    elif cat == "transport":
        base_meta.setdefault("transportType", expense.subCategory or "Ride")
        base_meta.setdefault("provider", expense.merchant or "")
        base_meta.setdefault("tripFrom", "")
        base_meta.setdefault("tripTo", "")
        base_meta.setdefault("distanceKm", None)
        base_meta.setdefault("dayLabel", "")

    elif cat == "food":
        base_meta.setdefault("foodType", expense.subCategory or "Delivery")
        base_meta.setdefault("platform", expense.merchant or "")
        base_meta.setdefault("itemCount", None)
        base_meta.setdefault("orderId", None)

    elif cat == "subscription":
        base_meta.setdefault("billingCycle", "Monthly")
        base_meta.setdefault("renewalDate", None)
        base_meta.setdefault("autoRenew", True)
        base_meta.setdefault("planName", "")
        base_meta.setdefault("subscriptionStatus", "Active")

    elif cat == "entertainment":
        base_meta.setdefault("entertainmentType", expense.subCategory or "")
        base_meta.setdefault("platform", expense.merchant or "")
        base_meta.setdefault("eventName", expense.description or "")
        base_meta.setdefault("venue", "")
        base_meta.setdefault("ticketCount", None)

    elif cat == "shopping":
        base_meta.setdefault("shoppingType", expense.subCategory or "")
        base_meta.setdefault("platform", expense.merchant or "")
        base_meta.setdefault("orderId", None)
        base_meta.setdefault("deliveryStatus", "Delivered")
        base_meta.setdefault("itemName", expense.description or "")

    now = datetime.utcnow()
    return {
        "category":    expense.category,
        "subCategory": expense.subCategory,
        "amount":      abs(expense.amount),
        "currency":    "INR",
        "description": expense.description or expense.merchant or expense.category,
        "merchant":    expense.merchant or expense.category.capitalize(),
        "date":        expense.date,
        "status":      expense.status,
        "meta":        base_meta,
        "createdAt":   now,
        "updatedAt":   now,
    }


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "FinTech AI Advisor API running"}


# ── Read all expenses (new collection + legacy fallback) ───────────────────────

@app.get("/transactions")
async def get_transactions():
    """Returns expenses from the new collection, falls back to legacy transactions."""
    docs = await expenses_collection.find({}, {"_id": 0}).to_list(length=500)
    if not docs:
        docs = await transactions_collection.find({}, {"_id": 0}).to_list(length=500)
    return docs


@app.get("/expenses")
async def get_expenses(category: Optional[str] = None):
    """Fetch expenses, optionally filtered by category."""
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    docs = await expenses_collection.find(query).sort("date", -1).to_list(length=500)
    return [_serialize(d) for d in docs]


@app.get("/expenses/summary")
async def get_expense_summary():
    """Aggregate total spend per category."""
    pipeline = [
        {"$group": {
            "_id":   "$category",
            "total": {"$sum": "$amount"},
            "count": {"$sum": 1},
        }},
        {"$sort": {"total": -1}},
    ]
    result = await expenses_collection.aggregate(pipeline).to_list(length=20)
    return [{"category": r["_id"], "total": r["total"], "count": r["count"]} for r in result]


# ── Create expense ─────────────────────────────────────────────────────────────

@app.post("/expenses")
async def add_expense(expense: ExpenseInput):
    doc = _build_expense_doc(expense)
    result = await expenses_collection.insert_one(doc)

    # Also mirror into legacy transactions for Pinecone / Oracle compatibility
    legacy_doc = {
        "category": expense.category,
        "date":     expense.date,
        "amount":   -abs(expense.amount),
        "merchant": doc["merchant"],
    }
    await transactions_collection.insert_one(legacy_doc)

    doc["_id"] = str(result.inserted_id)
    return {"status": "success", "inserted": doc}


# ── Registry (category detail page) ───────────────────────────────────────────

@app.get("/registry/{category}")
async def get_registry(category: str):
    """Returns full itemized log for one category, sorted newest-first."""
    docs = await expenses_collection.find(
        {"category": {"$regex": f"^{category}$", "$options": "i"}},
    ).sort("date", -1).to_list(length=200)
    return [_serialize(d) for d in docs]


# ── Users ──────────────────────────────────────────────────────────────────────

@app.get("/users/{email}")
async def get_user(email: str):
    doc = await users_collection.find_one({"email": email})
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    return _serialize(doc)


@app.post("/users")
async def create_user(email: str, name: str, budgets: UserBudgets = UserBudgets()):
    existing = await users_collection.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=409, detail="User already exists")
    now = datetime.utcnow()
    doc = {
        "email":    email,
        "name":     name,
        "budgets":  budgets.dict(),
        "settings": {"currency": "INR", "theme": "dark", "notifications": True},
        "createdAt": now,
        "updatedAt": now,
    }
    result = await users_collection.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return {"status": "success", "user": doc}


@app.patch("/users/{email}/budgets")
async def update_budgets(email: str, budgets: UserBudgets):
    result = await users_collection.update_one(
        {"email": email},
        {"$set": {"budgets": budgets.dict(exclude_none=True), "updatedAt": datetime.utcnow()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": "updated"}


# ── Oracle (AI Chat) ───────────────────────────────────────────────────────────

@app.post("/ask", response_model=ChatResponse)
async def ask_advisor(request: ChatRequest):
    context_str = ""
    warnings: List[str] = []
    source_ids: List[str] = []

    if pinecone_index:
        try:
            search_results = pinecone_index.search(
                queries=[{"text": request.query}],
                model="llama-text-embed-v2",
                top_k=5,
                include_metadata=True
            )
            blocks = []
            matches = []
            try:
                matches = search_results['results'][0]['matches']
            except (KeyError, TypeError, AttributeError):
                if hasattr(search_results, 'results') and len(search_results.results) > 0:
                    matches = search_results.results[0].matches

            for match in matches:
                match_id = match['id'] if isinstance(match, dict) else match.id
                meta     = match['metadata'] if isinstance(match, dict) else match.metadata
                source_ids.append(match_id)
                amount = float(meta.get("amount", 0))
                blocks.append(
                    f"- ₹{amount:.2f} at {meta.get('merchant')} "
                    f"({meta.get('category')}) on {meta.get('date')}"
                )
                if amount > 10000:
                    warnings.append(f"⚠ Anomaly: ₹{amount:.2f} at {meta.get('merchant')}")
            context_str = "\n".join(blocks)
        except Exception as e:
            context_str = f"[Vector search unavailable: {e}]"
    else:
        # Fallback: pull from expenses (new) then legacy transactions
        docs = await expenses_collection.find({}, {"_id": 0}).sort("date", -1).to_list(length=10)
        if not docs:
            docs = await transactions_collection.find({}, {"_id": 0}).to_list(length=10)
        blocks = []
        for doc in docs:
            amount = float(doc.get("amount", 0))
            blocks.append(
                f"- ₹{amount:.2f} at {doc.get('merchant', 'Unknown')} "
                f"({doc.get('category', 'Unknown')}) on {doc.get('date', 'Unknown')}"
            )
            if amount > 10000:
                warnings.append(f"⚠ High spend: ₹{amount:.2f} at {doc.get('merchant')}")
        context_str = "\n".join(blocks) if blocks else "No transaction data available."

    # Always append the 10 most recent expenses for freshness
    recent_docs = await expenses_collection.find({}, {"_id": 0}).sort("date", -1).to_list(length=10)
    if recent_docs:
        recent_blocks = [
            f"- ₹{float(d.get('amount', 0)):.2f} at {d.get('merchant', 'Unknown')} "
            f"({d.get('category', 'Unknown')}) on {d.get('date', 'Unknown')}"
            for d in recent_docs
        ]
        context_str += "\n\nRecent Expenses:\n" + "\n".join(recent_blocks)

    prompt = f"""You are the FinTech AI Advisor — a proactive financial oracle for Indian users.
Use ONLY the provided transaction context. Do NOT hallucinate data. All amounts are in INR (₹).

Transaction Context:
{context_str}

User Question: {request.query}

Provide:
1. A clear, data-grounded financial insight.
2. Any proactive warnings (e.g., "Warning: Subscription spending up 20%").
3. Actionable next steps.
"""

    try:
        response = gemini.generate_content(prompt)
        advice = response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini error: {e}")

    return ChatResponse(advice=advice, source_ids=source_ids, warnings=warnings)
