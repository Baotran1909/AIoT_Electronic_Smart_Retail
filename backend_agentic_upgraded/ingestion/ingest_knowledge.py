from pathlib import Path
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

from config.settings import KNOWLEDGE_DIR, QDRANT_URL, QDRANT_COLLECTION, VECTOR_SIZE
from ingestion.cleaner import clean_text
from ingestion.chunker import chunk_text
from retrieval.hybrid_retriever import embed_text


def ingest_knowledge() -> int:
    client = QdrantClient(url=QDRANT_URL)
    client.recreate_collection(
        collection_name=QDRANT_COLLECTION,
        vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
    )

    points = []
    point_id = 1
    knowledge_dir = Path(KNOWLEDGE_DIR)

    for file_path in sorted(knowledge_dir.glob("*.md")):
        text = clean_text(file_path.read_text(encoding="utf-8"))
        chunks = chunk_text(text)
        for idx, chunk in enumerate(chunks):
            points.append(
                PointStruct(
                    id=point_id,
                    vector=embed_text(chunk),
                    payload={
                        "source": file_path.name,
                        "chunk_id": idx,
                        "text": chunk,
                    },
                )
            )
            point_id += 1

    if points:
        client.upsert(collection_name=QDRANT_COLLECTION, points=points)

    print(f"✅ Đã nạp {len(points)} chunks vào Qdrant collection: {QDRANT_COLLECTION}")
    return len(points)


if __name__ == "__main__":
    ingest_knowledge()
