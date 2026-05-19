"""
generate_data.py
────────────────
Generates realistic Indian expense seed data matching the new `expenses`
collection schema and inserts it directly into MongoDB.

Usage:
    python scripts/generate_data.py              # insert into MongoDB
    python scripts/generate_data.py --json-only  # dump JSON file, no DB write
"""

import json
import random
import asyncio
import argparse
import os
import sys
from datetime import datetime, timedelta

# Allow running from project root or scripts/ dir
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"))


# ── Category seed tables ───────────────────────────────────────────────────────

FOOD_ENTRIES = [
    ("Swiggy",      "Food", "Delivery",  150, 650),
    ("Zomato",      "Food", "Delivery",  120, 500),
    ("BigBasket",   "Food", "Grocery",   800, 4000),
    ("Blinkit",     "Food", "Grocery",   200, 900),
    ("Zepto",       "Food", "Grocery",   150, 700),
    ("Starbucks",   "Food", "Cafe",      280, 600),
    ("Cafe Coffee Day","Food","Cafe",    120, 350),
    ("Pizza Hut",   "Food", "Dine-out",  600, 2000),
    ("Domino's",    "Food", "Delivery",  250, 800),
    ("McDonald's",  "Food", "Dine-out",  180, 500),
    ("Local Dhaba", "Food", "Dine-out",   60, 250),
    ("Canteen",     "Food", "Dine-out",   40, 130),
]

FOOD_DESCRIPTIONS = [
    "Weekend family order", "Quick lunch", "Office breakfast",
    "Monthly grocery run", "Late-night snacks", "Team lunch",
    "Morning coffee", "Dinner with friends", "Instant restock",
]

TRANSPORT_ENTRIES = [
    ("Uber",    "Transport", "Ride",    80,  600),
    ("Ola",     "Transport", "Ride",    60,  450),
    ("Rapido",  "Transport", "Ride",    40,  150),
    ("Metro",   "Transport", "Transit", 20,   80),
    ("Bus",     "Transport", "Transit", 10,   40),
    ("Auto",    "Transport", "Ride",    30,  120),
    ("BMTC",    "Transport", "Transit", 15,   50),
    ("Indian Oil","Transport","Fuel",  800, 3000),
    ("HP Petrol","Transport","Fuel",   700, 2500),
    ("InDrive", "Transport", "Ride",    70,  300),
]

TRANSPORT_PLACES = [
    ("Home", "Office"), ("Office", "Home"), ("Home", "Mall"),
    ("Station", "Office"), ("Airport", "Home"), ("Home", "Gym"),
    ("Office", "Restaurant"), ("Home", "Hospital"),
]

RENT_LANDLORDS = [
    ("Mr. Sharma", "Flat 2B, Koramangala"),
    ("Mrs. Iyer",  "Villa 4, Whitefield"),
    ("Mr. Gupta",  "Apartment 7C, HSR Layout"),
    ("Mr. Reddy",  "Block A, Marathahalli"),
]
RENT_MODES = ["UPI", "Bank Transfer", "Cash"]

SUBSCRIPTION_ENTRIES = [
    ("Netflix",          "Subscription", "Streaming",  649,  "Monthly"),
    ("Spotify",          "Subscription", "Streaming",  179,  "Monthly"),
    ("Amazon Prime",     "Subscription", "Streaming",  299,  "Monthly"),
    ("GitHub Copilot",   "Subscription", "SaaS",       833,  "Monthly"),
    ("Adobe CC",         "Subscription", "SaaS",      1675,  "Monthly"),
    ("Notion Pro",       "Subscription", "SaaS",       320,  "Yearly"),
    ("AWS EC2",          "Subscription", "Cloud",     2100,  "Monthly"),
    ("Google One",       "Subscription", "Cloud",      130,  "Monthly"),
    ("LinkedIn Premium", "Subscription", "SaaS",      1599,  "Monthly"),
    ("Hotstar",          "Subscription", "Streaming",  299,  "Monthly"),
    ("Gym Pro",          "Subscription", "Health",     999,  "Monthly"),
    ("Audible",          "Subscription", "SaaS",       199,  "Monthly"),
]

ENTERTAINMENT_ENTRIES = [
    ("PVR",          "Entertainment", "Movies",  400,  1200),
    ("INOX",         "Entertainment", "Movies",  300,  900),
    ("BookMyShow",   "Entertainment", "Events",  500,  5000),
    ("Steam",        "Entertainment", "Gaming",  200,  3500),
    ("PlayStation",  "Entertainment", "Gaming",  500,  5000),
    ("Xbox Game Pass","Entertainment","Gaming",  499,  499),
    ("Escape Room",  "Entertainment", "Events", 1200, 2500),
    ("Amazon Prime", "Entertainment", "Streaming",149, 149),
    ("Ludo Club",    "Entertainment", "Gaming",   50,  500),
]

ENTERTAINMENT_EVENTS = [
    "Weekend movie", "Gaming session", "Concert night",
    "Live comedy show", "Friends outing", "Team event",
    "Birthday party", "Annual sale purchase",
]

SHOPPING_ENTRIES = [
    ("Amazon",    "Shopping", "Electronics", 500,  8000),
    ("Flipkart",  "Shopping", "Electronics", 300,  5000),
    ("Myntra",    "Shopping", "Clothing",    500,  4000),
    ("Ajio",      "Shopping", "Clothing",    400,  3000),
    ("Nykaa",     "Shopping", "Beauty",      300,  2000),
    ("IKEA",      "Shopping", "Home",       1000, 10000),
    ("Decathlon", "Shopping", "Sports",      500,  6000),
    ("Croma",     "Shopping", "Electronics", 800, 12000),
    ("Meesho",    "Shopping", "Clothing",    150,  1200),
]

SHOPPING_ITEMS = [
    "Wireless earbuds", "USB-C Hub", "Desk lamp", "Keyboard",
    "Summer collection", "Running shoes", "Skincare kit",
    "Shelf unit", "Gym gear", "Smart watch", "Laptop stand",
]


# ── Builder functions per category ────────────────────────────────────────────

def _rand_date(days_back: int = 90) -> str:
    d = datetime.now() - timedelta(days=random.randint(0, days_back))
    return d.strftime("%Y-%m-%d")


def make_food(n: int) -> list:
    records = []
    for _ in range(n):
        merchant, cat, sub, lo, hi = random.choice(FOOD_ENTRIES)
        amount = round(random.uniform(lo, hi), 2)
        date   = _rand_date(60)
        records.append({
            "category":    cat,
            "subCategory": sub,
            "amount":      amount,
            "currency":    "INR",
            "description": f"{merchant} — {random.choice(FOOD_DESCRIPTIONS)}",
            "merchant":    merchant,
            "date":        date,
            "status":      "completed",
            "meta": {
                "foodType": sub,
                "platform": merchant,
                "itemCount": random.randint(1, 5),
                "orderId":  f"ORD-{random.randint(100000, 999999)}",
            },
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat(),
        })
    return records


def make_transport(n: int) -> list:
    records = []
    for _ in range(n):
        merchant, cat, sub, lo, hi = random.choice(TRANSPORT_ENTRIES)
        amount  = round(random.uniform(lo, hi), 2)
        date    = _rand_date(30)
        trip_from, trip_to = random.choice(TRANSPORT_PLACES)
        records.append({
            "category":    cat,
            "subCategory": sub,
            "amount":      amount,
            "currency":    "INR",
            "description": f"{merchant} — {trip_from} to {trip_to}",
            "merchant":    merchant,
            "date":        date,
            "status":      "completed",
            "meta": {
                "transportType": sub,
                "provider":      merchant,
                "tripFrom":      trip_from,
                "tripTo":        trip_to,
                "distanceKm":    round(random.uniform(2, 30), 1) if sub == "Ride" else None,
                "dayLabel":      "",
            },
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat(),
        })
    return records


def make_rent(months: int = 6) -> list:
    records = []
    landlord, address = random.choice(RENT_LANDLORDS)
    base_rent = random.choice([18000, 20000, 22000, 25000, 28000, 30000])
    mode = random.choice(RENT_MODES)

    for i in range(months):
        # Walk back month by month
        d = datetime.now().replace(day=1) - timedelta(days=30 * i)
        date_str     = d.strftime("%Y-%m-%d")
        billing_month = d.strftime("%Y-%m")
        upi_ref  = f"UPI{random.randint(100000000, 999999999)}" if mode == "UPI" else None
        bank_ref = f"NEFT{random.randint(100000, 999999)}" if mode == "Bank Transfer" else None

        records.append({
            "category":    "Rent",
            "subCategory": "Monthly",
            "amount":      base_rent,
            "currency":    "INR",
            "description": f"{billing_month} rent — {landlord}",
            "merchant":    landlord,
            "date":        date_str,
            "status":      "completed",
            "meta": {
                "modeOfPayment":   mode,
                "upiRef":          upi_ref,
                "bankRef":         bank_ref,
                "billingMonth":    billing_month,
                "landlordName":    landlord,
                "propertyAddress": address,
            },
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat(),
        })
    return records


def make_subscriptions() -> list:
    records = []
    for merchant, cat, sub, amount, cycle in SUBSCRIPTION_ENTRIES:
        # Generate 3 monthly billing records per active subscription
        cycles = 3 if cycle == "Monthly" else 1
        status = "Cancelled" if merchant == "LinkedIn Premium" else "Active"
        renewal = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")

        for i in range(cycles):
            d = datetime.now().replace(day=1) - timedelta(days=30 * i)
            records.append({
                "category":    cat,
                "subCategory": sub,
                "amount":      amount,
                "currency":    "INR",
                "description": f"{merchant} — {cycle} subscription",
                "merchant":    merchant,
                "date":        d.strftime("%Y-%m-%d"),
                "status":      "completed",
                "meta": {
                    "billingCycle":         cycle,
                    "renewalDate":          renewal,
                    "autoRenew":            status == "Active",
                    "planName":             "Standard",
                    "subscriptionStatus":   status,
                },
                "createdAt": datetime.utcnow().isoformat(),
                "updatedAt": datetime.utcnow().isoformat(),
            })
    return records


def make_entertainment(n: int) -> list:
    records = []
    for _ in range(n):
        merchant, cat, sub, lo, hi = random.choice(ENTERTAINMENT_ENTRIES)
        amount = round(random.uniform(lo, hi), 2)
        event  = random.choice(ENTERTAINMENT_EVENTS)
        records.append({
            "category":    cat,
            "subCategory": sub,
            "amount":      amount,
            "currency":    "INR",
            "description": f"{merchant} — {event}",
            "merchant":    merchant,
            "date":        _rand_date(60),
            "status":      "completed",
            "meta": {
                "entertainmentType": sub,
                "platform":          merchant,
                "eventName":         event,
                "venue":             f"{merchant} City Centre" if sub == "Movies" else "",
                "ticketCount":       random.randint(1, 4) if sub in ("Movies", "Events") else None,
            },
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat(),
        })
    return records


def make_shopping(n: int) -> list:
    records = []
    for _ in range(n):
        merchant, cat, sub, lo, hi = random.choice(SHOPPING_ENTRIES)
        amount = round(random.uniform(lo, hi), 2)
        item   = random.choice(SHOPPING_ITEMS)
        records.append({
            "category":    cat,
            "subCategory": sub,
            "amount":      amount,
            "currency":    "INR",
            "description": f"{merchant} — {item}",
            "merchant":    merchant,
            "date":        _rand_date(90),
            "status":      "completed",
            "meta": {
                "shoppingType":    sub,
                "platform":        merchant,
                "orderId":         f"ORD-{random.randint(100000, 999999)}",
                "deliveryStatus":  random.choice(["Delivered", "Delivered", "In Transit", "Returned"]),
                "itemName":        item,
            },
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat(),
        })
    return records


# ── Orchestrator ───────────────────────────────────────────────────────────────

def generate_all() -> list:
    records = (
        make_food(25)
        + make_transport(20)
        + make_rent(6)
        + make_subscriptions()
        + make_entertainment(15)
        + make_shopping(18)
    )
    random.shuffle(records)
    print(f"[OK]  Generated {len(records)} expense records")
    return records


async def insert_to_mongo(records: list):
    from database import expenses_collection, transactions_collection
    # Clear existing seed data
    await expenses_collection.delete_many({"_id": {"$exists": True}})
    print("[OK]  Cleared existing expenses collection")

    result = await expenses_collection.insert_many(records)
    print(f"[OK]  Inserted {len(result.inserted_ids)} documents into expenses")

    # Mirror into legacy transactions for Pinecone/Oracle
    legacy = [
        {
            "id":       f"txn_{i:04d}",
            "amount":   -abs(r["amount"]),
            "merchant": r["merchant"],
            "category": r["category"],
            "date":     r["date"],
        }
        for i, r in enumerate(records)
    ]
    await transactions_collection.delete_many({})
    await transactions_collection.insert_many(legacy)
    print(f"[OK]  Mirrored {len(legacy)} docs into legacy transactions collection")


def save_json(records: list):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    out_path   = os.path.join(script_dir, "expenses_seed.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, default=str)
    print(f"[OK]  Saved JSON -> {out_path}")


# ── Entry point ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--json-only", action="store_true",
                        help="Write JSON file only, skip MongoDB insert")
    args = parser.parse_args()

    all_records = generate_all()

    if args.json_only:
        save_json(all_records)
    else:
        save_json(all_records)   # always save JSON as backup
        asyncio.run(insert_to_mongo(all_records))
        print("\n[OK]  Seed complete. Open MongoDB Compass to verify.")
