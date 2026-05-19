"""
create_indexes.py
─────────────────
Creates all recommended indexes on the expenses and users collections.
Run once after first launch:

    python scripts/create_indexes.py
"""

import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"))

from database import expenses_collection, users_collection, transactions_collection


async def create_indexes():
    print("Creating indexes...\n")

    # ── users ──────────────────────────────────────────────────────────────────
    await users_collection.create_index("email", unique=True)
    print("[OK]  users.email (unique)")

    # ── expenses ───────────────────────────────────────────────────────────────
    # Primary registry query: filter by category, sort by date
    await expenses_collection.create_index([("category", 1), ("date", -1)])
    print("[OK]  expenses.(category, date)")

    # Dashboard summary: group by category
    await expenses_collection.create_index("category")
    print("[OK]  expenses.category")

    # Date-range queries (weekly/monthly chart)
    await expenses_collection.create_index([("date", -1)])
    print("[OK]  expenses.date (desc)")

    # Subscription status filter
    await expenses_collection.create_index("meta.subscriptionStatus")
    print("[OK]  expenses.meta.subscriptionStatus")

    # Future multi-user support
    await expenses_collection.create_index("userId")
    print("[OK]  expenses.userId")

    # ── legacy transactions ────────────────────────────────────────────────────
    await transactions_collection.create_index([("category", 1)])
    await transactions_collection.create_index([("date", -1)])
    print("[OK]  transactions.(category), transactions.(date)")

    print("\n[OK]  All indexes created successfully.")


if __name__ == "__main__":
    asyncio.run(create_indexes())
