# Backend AIoT Smart Retail - Supervisor-based Multi-Agent Hybrid RAG

Bản này đã được tái cấu trúc theo hướng AI Engineering nhưng vẫn giữ logic thật của dự án.

## Các phần đã chỉnh

- Thêm `config/` để quản lý API key và cấu hình bằng biến môi trường.
- Thêm `retrieval/` gồm Hybrid Retrieval, BM25/keyword fallback, Qdrant Vector Search, Grader và Reranker nhẹ.
- Thêm `ingestion/` gồm cleaner, chunker và ingest knowledge vào Qdrant.
- Thêm `workflows/ai_graph.py` để điều phối Supervisor Router -> Hybrid Retrieval -> Grader -> Web Fallback -> Generate.
- Thêm `tools/` gồm inventory, compare, recommendation và locker tool ở mức nền tảng.
- Thêm `agents/orchestrator.py` và `agents/general_agent.py`.
- Gộp thêm 38 file knowledge mới vào thư mục `knowledge/`.
- Giữ wrapper ở root như `ai_graph.py`, `hybrid_retriever.py`, `grader.py` để không làm hỏng import cũ.
- Gỡ hard-coded OpenRouter/Tavily key khỏi source code, chuyển sang `.env`/environment variables.

## Cách chạy

```bash
pip install -r requirements.txt
set OPENROUTER_API_KEY=your_key
set TAVILY_API_KEY=your_key
uvicorn main:app --reload --port 8000
```

## Nạp lại knowledge vào Qdrant

```bash
python ingest_knowledge.py
```

## Test nhanh retrieval

```bash
python eval_rag.py
```

## Tên kiến trúc có thể ghi trong báo cáo

Supervisor-based Multi-Agent Hybrid RAG Architecture for AIoT Smart Retail.
