import json
from datetime import datetime

LOG_FILE = "ai_logs.jsonl"

def save_ai_log(data):

    data["time"] = datetime.now().isoformat()

    with open(
        LOG_FILE,
        "a",
        encoding="utf-8"
    ) as f:

        f.write(
            json.dumps(
                data,
                ensure_ascii=False
            ) + "\n"
        )