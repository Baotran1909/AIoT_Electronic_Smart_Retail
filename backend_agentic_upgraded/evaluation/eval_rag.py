from router import route_question
from retrieval.hybrid_retriever import retrieve_knowledge
from retrieval.grader import grade_retrieval

TEST_CASES = [
    {"question": "RC522 dùng với ESP32 cần lưu ý gì?", "expected_agent": "consultant_agent", "keywords": ["spi", "3.3v", "esp32"]},
    {"question": "Smart home cần những linh kiện gì?", "expected_agent": "consultant_agent", "keywords": ["esp32", "relay", "dht11"]},
    {"question": "Servo SG90 có dùng trực tiếp với ESP32 không?", "expected_agent": "consultant_agent", "keywords": ["5v", "nguồn", "gnd"]},
    {"question": "Có combo nào nên mua thêm?", "expected_agent": "combo_agent", "keywords": ["combo", "esp32"]},
    {"question": "Hôm nay nên nhập hàng gì?", "expected_agent": "inventory_agent", "keywords": []},
]


def run_evaluation(report_path: str = "evaluation/eval_report.txt"):
    total = len(TEST_CASES)
    agent_ok = 0
    keyword_ok = 0
    total_grader_score = 0.0

    lines = ["FINAL RAG EVALUATION REPORT"]

    for case in TEST_CASES:
        question = case["question"]
        agent = route_question(question)
        knowledge = retrieve_knowledge(question).lower()
        retrieval_score = grade_retrieval(question, knowledge)
        total_grader_score += retrieval_score

        is_agent_ok = agent == case["expected_agent"]
        found_keywords = [kw for kw in case["keywords"] if kw.lower() in knowledge]
        is_keyword_ok = not case["keywords"] or len(found_keywords) >= max(1, len(case["keywords"]) // 2)

        agent_ok += int(is_agent_ok)
        keyword_ok += int(is_keyword_ok)

        lines.extend([
            "",
            f"QUESTION: {question}",
            f"AGENT: {agent}",
            f"EXPECTED AGENT: {case['expected_agent']}",
            f"AGENT OK: {is_agent_ok}",
            f"FOUND KEYWORDS: {found_keywords}",
            f"RETRIEVAL SCORE: {retrieval_score:.2f}",
            f"KEYWORD OK: {is_keyword_ok}",
        ])

    avg = total_grader_score / max(total, 1)
    lines.extend([
        "",
        "========== SUMMARY ==========",
        f"Agent Accuracy: {agent_ok}/{total} = {agent_ok / total:.2%}",
        f"Retrieval Keyword Score: {keyword_ok}/{total} = {keyword_ok / total:.2%}",
        f"Average Retrieval Score: {avg:.2f}",
    ])

    text = "\n".join(lines)
    print(text)
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(text)
    return text


if __name__ == "__main__":
    run_evaluation()
