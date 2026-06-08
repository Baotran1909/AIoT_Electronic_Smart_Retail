from config.settings import CHUNK_SIZE, CHUNK_OVERLAP


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, chunk_overlap: int = CHUNK_OVERLAP) -> list[str]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    chunks: list[str] = []
    current = ""

    for line in lines:
        candidate = (current + "\n" + line).strip() if current else line
        if len(candidate) <= chunk_size:
            current = candidate
            continue

        if current:
            chunks.append(current.strip())
            overlap = current[-chunk_overlap:] if chunk_overlap > 0 else ""
            current = (overlap + "\n" + line).strip()
        else:
            chunks.append(line[:chunk_size].strip())
            current = line[chunk_size - chunk_overlap:].strip() if chunk_overlap > 0 else ""

    if current.strip():
        chunks.append(current.strip())

    return chunks
