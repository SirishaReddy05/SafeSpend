import re
from typing import Dict, List, Tuple


STOP_WORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "how",
    "i",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "that",
    "the",
    "to",
    "was",
    "what",
    "when",
    "where",
    "which",
    "who",
    "will",
    "with",
    "you",
    "your",
}


def _tokens(text: str) -> List[str]:
    words = re.findall(r"[a-zA-Z0-9]+", text.lower())
    return [word for word in words if word not in STOP_WORDS and len(word) > 2]


def chunk_text(text: str, size: int = 700) -> List[str]:
    compact = " ".join(text.split())
    if not compact:
        return []
    return [compact[i : i + size] for i in range(0, len(compact), size)]


def rank_chunks(question: str, documents: List[Dict], top_k: int = 6) -> List[Tuple[float, str, str]]:
    query_tokens = set(_tokens(question))
    ranked: List[Tuple[float, str, str]] = []

    for doc in documents:
        chunks = chunk_text(doc.get("text", ""))
        for chunk in chunks:
            chunk_tokens = set(_tokens(chunk))
            if not chunk_tokens:
                continue
            overlap = len(query_tokens.intersection(chunk_tokens))
            density = overlap / max(len(chunk_tokens), 1)
            score = overlap + density
            if score > 0:
                ranked.append((score, doc.get("name", "resource"), chunk))

    ranked.sort(key=lambda item: item[0], reverse=True)
    return ranked[:top_k]
