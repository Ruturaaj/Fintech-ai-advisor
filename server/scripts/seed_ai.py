import json, asyncio, os, sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import transactions_collection, pinecone_index

JSON_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "transactions.json")

def mock_embedding(_: str) -> list:
    return [0.0] * 1024  # Replace with real Llama-text-embed-v2

async def seed():
    if not os.path.exists(JSON_PATH):
        print("Run generate_data.py first."); return

    with open(JSON_PATH) as f:
        txns = json.load(f)

    await transactions_collection.delete_many({})
    await transactions_collection.insert_many(txns)
    print(f"MongoDB: inserted {len(txns)} documents")

    if pinecone_index:
        vectors = [
            {
                "id": t["id"],
                "values": mock_embedding(f"{t['merchant']} {t['category']} {t['amount']} {t['date']}"),
                "metadata": t,
            }
            for t in txns
        ]
        for i in range(0, len(vectors), 100):
            pinecone_index.upsert(vectors=vectors[i:i+100])
        print(f"Pinecone: upserted {len(vectors)} vectors")
    else:
        print("Pinecone not configured — skipped.")

if __name__ == "__main__":
    asyncio.run(seed())
