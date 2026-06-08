import json
import time
from pathlib import Path

from workflows.ai_graph import run_ai_graph


def keyword_hit_count(text: str, expected_keywords: list[str]):
    text = (text or "").lower()
    hits = 0

    for keyword in expected_keywords:
        if keyword.lower() in text:
            hits += 1

    return hits, len(expected_keywords)


def check_expected_agent(expected_agent, predicted_agent, sources, knowledge):
    if expected_agent == predicted_agent:
        return True

    if expected_agent == "web_search_agent":
        if "web_fallback" in sources:
            return True
        if "WEB FALLBACK" in knowledge:
            return True
        if predicted_agent == "web_search_agent":
            return True

    return False


def main():
    queries_path = Path("eval_queries.json")
    results_path = Path("eval_results.csv")
    report_path = Path("eval_report.txt")

    cases = json.loads(
        queries_path.read_text(encoding="utf-8")
    )

    rows = []

    total_agent_correct = 0
    total_keyword_correct = 0
    total_score = 0
    total_latency = 0

    for index, case in enumerate(cases, start=1):
        query = case["query"]
        expected_agent = case["expected_agent"]
        expected_keywords = case.get("expected_keywords", [])

        start = time.perf_counter()

        result = run_ai_graph(
            question=query,
            context="",
            user_id="eval_user"
        )

        latency_ms = (time.perf_counter() - start) * 1000

        predicted_agent = result.get("agent", "")
        knowledge = result.get("knowledge", "")
        sources = result.get("sources", [])
        retrieval_score = float(result.get("retrieval_score", 0))

        keyword_hits, keyword_total = keyword_hit_count(
            knowledge + " " + " ".join(sources),
            expected_keywords
        )

        agent_ok = check_expected_agent(
            expected_agent,
            predicted_agent,
            sources,
            knowledge
        )

        if keyword_total == 0:
            keyword_ok = True
        else:
            keyword_ok = keyword_hits >= max(1, keyword_total // 2)

        total_agent_correct += int(agent_ok)
        total_keyword_correct += int(keyword_ok)
        total_score += retrieval_score
        total_latency += latency_ms

        row = {
            "id": index,
            "query": query,
            "expected_agent": expected_agent,
            "predicted_agent": predicted_agent,
            "agent_ok": agent_ok,
            "keyword_hits": keyword_hits,
            "keyword_total": keyword_total,
            "keyword_ok": keyword_ok,
            "retrieval_score": retrieval_score,
            "sources": "|".join(sources),
            "latency_ms": round(latency_ms, 2)
        }

        rows.append(row)

        print("=" * 80)
        print(f"[{index}] QUERY: {query}")
        print(f"Expected agent : {expected_agent}")
        print(f"Predicted agent: {predicted_agent}")
        print(f"Agent OK       : {agent_ok}")
        print(f"Keyword hit    : {keyword_hits}/{keyword_total}")
        print(f"Keyword OK     : {keyword_ok}")
        print(f"Score          : {retrieval_score}")
        print(f"Latency        : {latency_ms:.2f} ms")
        print(f"Sources        : {sources}")

    headers = [
        "id",
        "query",
        "expected_agent",
        "predicted_agent",
        "agent_ok",
        "keyword_hits",
        "keyword_total",
        "keyword_ok",
        "retrieval_score",
        "sources",
        "latency_ms"
    ]

    with results_path.open("w", encoding="utf-8") as f:
        f.write(",".join(headers) + "\n")

        for row in rows:
            values = []
            for header in headers:
                value = str(row[header])
                value = value.replace(",", ";")
                value = value.replace("\n", " ")
                values.append(value)

            f.write(",".join(values) + "\n")

    total = len(rows)

    agent_accuracy = total_agent_correct / total * 100
    keyword_accuracy = total_keyword_correct / total * 100
    avg_score = total_score / total
    avg_latency = total_latency / total

    report = f"""
AI BACKEND EVALUATION REPORT

Total queries: {total}

Agent Accuracy:
{total_agent_correct}/{total} = {agent_accuracy:.2f}%

Retrieval Keyword Accuracy:
{total_keyword_correct}/{total} = {keyword_accuracy:.2f}%

Average Retrieval Score:
{avg_score:.3f}

Average Latency:
{avg_latency:.2f} ms

Output files:
- eval_results.csv
- eval_report.txt
"""

    report_path.write_text(report, encoding="utf-8")

    print("\n" + report)


if __name__ == "__main__":
    main()