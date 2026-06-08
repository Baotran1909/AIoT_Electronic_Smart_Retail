import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from router import route_question
from hybrid_retriever import retrieve_knowledge

TEST_CASES = [
    {
        "question": "RC522 dùng với ESP32 cần lưu ý gì?",
        "expected_agent": "consultant_agent",
        "keywords": ["spi", "3.3v", "esp32"]
    },
    {
        "question": "Smart home cần những linh kiện gì?",
        "expected_agent": "consultant_agent",
        "keywords": ["esp32", "relay", "dht11"]
    },
    {
        "question": "Servo SG90 có dùng trực tiếp với ESP32 không?",
        "expected_agent": "consultant_agent",
        "keywords": ["5v", "nguồn", "gnd"]
    },
    {
        "question": "Có combo nào nên mua thêm?",
        "expected_agent": "combo_agent",
        "keywords": ["combo", "esp32"]
    },
    {
        "question": "Hôm nay nên nhập hàng gì?",
        "expected_agent": "inventory_agent",
        "keywords": []
    }
]

def test_agent_accuracy():
    correct = 0

    for case in TEST_CASES:
        agent = route_question(case["question"])

        if agent == case["expected_agent"]:
            correct += 1

    accuracy = correct / len(TEST_CASES)

    assert accuracy >= 0.8


def test_retrieval_keyword_score():
    correct = 0

    for case in TEST_CASES:
        knowledge = retrieve_knowledge(case["question"]).lower()

        keywords = case["keywords"]

        if not keywords:
            correct += 1
            continue

        found = [
            kw for kw in keywords
            if kw.lower() in knowledge
        ]

        if len(found) >= max(1, len(keywords) // 2):
            correct += 1

    score = correct / len(TEST_CASES)

    assert score >= 0.8