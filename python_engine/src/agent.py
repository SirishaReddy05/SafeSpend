import os
import json
import re
from typing import Dict, List, Optional
from urllib import error, request
try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover
    def load_dotenv(*_args, **_kwargs):  # type: ignore
        return False

from src.retrieval import chunk_text, rank_chunks


CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ENGINE_DIR = os.path.dirname(CURRENT_DIR)
PROJECT_ROOT = os.path.dirname(ENGINE_DIR)
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))
load_dotenv()


DEFAULT_GEMINI_MODELS = [
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
]

BUDGET_CATEGORIES = [
    "bills",
    "clothing",
    "education",
    "entertainment",
    "food",
    "gifts",
    "health",
    "furniture",
    "pet",
    "shopping",
    "transport",
    "fitness",
    "travel",
    "others",
]

CATEGORY_KEYWORDS = {
    "bills": ["bill", "electricity", "water", "rent", "utility", "mobile", "internet"],
    "clothing": ["cloth", "shirt", "jeans", "dress", "apparel", "fashion"],
    "education": ["school", "college", "tuition", "course", "book", "exam"],
    "entertainment": ["movie", "cinema", "netflix", "spotify", "game", "concert"],
    "food": ["food", "restaurant", "cafe", "coffee", "grocery", "swiggy", "zomato", "dining"],
    "gifts": ["gift", "present"],
    "health": ["health", "medical", "doctor", "pharmacy", "hospital", "medicine"],
    "furniture": ["furniture", "chair", "table", "sofa", "desk"],
    "pet": ["pet", "dog", "cat", "vet"],
    "shopping": ["shopping", "store", "mall", "amazon", "flipkart", "purchase"],
    "transport": ["transport", "uber", "ola", "fuel", "petrol", "diesel", "metro", "bus", "train"],
    "fitness": ["fitness", "gym", "yoga", "workout"],
    "travel": ["travel", "hotel", "flight", "airline", "booking", "trip"],
}


def _gemini_models() -> List[str]:
    configured = (
        os.getenv("GEMINI_MODELS")
        or os.getenv("GEMINI_MODEL")
        or os.getenv("VITE_GEMINI_MODEL")
        or ""
    )
    models = [item.strip() for item in configured.split(",") if item.strip()]
    for model in DEFAULT_GEMINI_MODELS:
        if model not in models:
            models.append(model)
    return models


def _gemini_answer(question: str, context_items: List[Dict]) -> Optional[str]:
    api_key = (
        os.getenv("GEMINI_API_KEY")
        or os.getenv("GOOGLE_API_KEY")
        or os.getenv("VITE_GEMINI_API_KEY")
    )
    if not api_key:
        return None

    context_text = "\n\n".join(
        f"Source: {item['name']}\n{item['chunk']}" for item in context_items
    )
    prompt = (
        "You are Finance Guru. Answer using ONLY the provided source context. "
        "If context is insufficient, clearly say what is missing.\n\n"
        f"Question: {question}\n\n"
        f"Source Context:\n{context_text}"
    )

    payload = json.dumps({"contents": [{"parts": [{"text": prompt}]}]}).encode("utf-8")

    for model in _gemini_models():
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{model}:generateContent?key={api_key}"
        )
        req = request.Request(
            url=url,
            data=payload,
            method="POST",
            headers={"Content-Type": "application/json"},
        )

        try:
            with request.urlopen(req, timeout=25) as response:
                data = json.loads(response.read().decode("utf-8"))
            answer = (
                data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text")
            )
            if answer:
                return answer
        except (error.HTTPError, error.URLError, TimeoutError, json.JSONDecodeError):
            continue

    return None


def _gemini_json(prompt: str) -> Optional[Dict]:
    api_key = (
        os.getenv("GEMINI_API_KEY")
        or os.getenv("GOOGLE_API_KEY")
        or os.getenv("VITE_GEMINI_API_KEY")
    )
    if not api_key:
        return None

    payload = json.dumps({"contents": [{"parts": [{"text": prompt}]}]}).encode("utf-8")

    for model in _gemini_models():
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{model}:generateContent?key={api_key}"
        )
        req = request.Request(
            url=url,
            data=payload,
            method="POST",
            headers={"Content-Type": "application/json"},
        )

        try:
            with request.urlopen(req, timeout=25) as response:
                data = json.loads(response.read().decode("utf-8"))
            answer = (
                data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text")
            )
            if not answer:
                continue

            match = re.search(r"\{.*\}", answer, flags=re.DOTALL)
            if match:
                return json.loads(match.group(0))
        except (error.HTTPError, error.URLError, TimeoutError, json.JSONDecodeError):
            continue

    return None


def _extract_amount(text: str) -> Optional[float]:
    candidates = []
    for match in re.finditer(
        r"(?:rs\.?|inr|₹|\$)?\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)",
        text,
        flags=re.IGNORECASE,
    ):
        value = match.group(1).replace(",", "")
        try:
            amount = float(value)
        except ValueError:
            continue
        if amount > 0:
            candidates.append(amount)

    return max(candidates) if candidates else None


def _clean_name(text: str, fallback: str) -> str:
    for line in text.splitlines():
        cleaned = re.sub(r"\s+", " ", line).strip(" -:\t")
        if 3 <= len(cleaned) <= 48 and not re.search(r"\d{4,}", cleaned):
            return cleaned
    return fallback


def _category_from_text(text: str) -> str:
    normalized = text.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(keyword in normalized for keyword in keywords):
            return category
    return "others"


def _fallback_ocr_action(extracted_text: str, instruction: str = "") -> Dict:
    combined = f"{instruction}\n{extracted_text}".strip()
    normalized = combined.lower()
    amount = _extract_amount(combined)

    wants_wallet = any(
        word in normalized
        for word in ("wallet", "income", "salary", "credit", "deposit", "received", "credited")
    )
    wants_budget = any(
        word in normalized
        for word in ("budget", "category", "limit", "expense", "spent", "paid", "debit", "receipt")
    )

    if wants_wallet and not wants_budget:
        return {
            "target": "wallet",
            "confidence": 0.72 if amount else 0.35,
            "payload": {
                "incomeType": _clean_name(extracted_text, "OCR income"),
                "amount": amount,
            },
            "notes": "Detected this as wallet/income from OCR text and prompt keywords.",
        }

    return {
        "target": "budget" if amount else "unknown",
        "confidence": 0.68 if amount else 0.2,
        "payload": {
            "name": _clean_name(extracted_text, "OCR budget"),
            "category": _category_from_text(combined),
            "amount": amount,
            "period": "monthly",
        },
        "notes": "Detected this as a budget/category item from OCR text and prompt keywords.",
    }


def parse_ocr_action(extracted_text: str, instruction: str = "") -> Dict:
    prompt = (
        "Read this OCR text and convert it to one SafeSpend app action. "
        "Return ONLY valid JSON with shape: "
        '{"target":"wallet|budget|unknown","confidence":0-1,'
        '"payload":{"incomeType":"...","amount":number} OR '
        '{"name":"...","category":"bills|clothing|education|entertainment|food|gifts|health|furniture|pet|shopping|transport|fitness|travel|others","amount":number,"period":"daily|weekly|monthly|yearly"},'
        '"notes":"short reason"}. '
        "Use wallet for income/deposit/salary/credited money. Use budget for expenses, receipts, spending limits, or categories. "
        "If the amount is missing, target must be unknown.\n\n"
        f"User instruction: {instruction or 'none'}\n\n"
        f"OCR text:\n{extracted_text[:6000]}"
    )
    parsed = _gemini_json(prompt)
    if isinstance(parsed, dict):
        target = parsed.get("target")
        payload = parsed.get("payload")
        if target in ("wallet", "budget", "unknown") and isinstance(payload, dict):
            if target == "budget":
                payload["category"] = payload.get("category") if payload.get("category") in BUDGET_CATEGORIES else "others"
                payload["period"] = payload.get("period") if payload.get("period") in ("daily", "weekly", "monthly", "yearly") else "monthly"
            return parsed

    return _fallback_ocr_action(extracted_text, instruction)


def _wants_summary(question: str) -> bool:
    normalized = question.lower()
    return any(
        phrase in normalized
        for phrase in (
            "summarize",
            "summary",
            "overview",
            "what is this",
            "what is the project",
            "project about",
            "document about",
        )
    )


def _sentence_summary(documents: List[Dict]) -> Optional[str]:
    for doc in documents:
        text = " ".join(doc.get("text", "").split())
        if len(text) < 80:
            continue

        sentences = [
            sentence.strip()
            for sentence in re.split(r"(?<=[.!?])\s+", text)
            if len(sentence.strip()) > 30
        ]
        if not sentences:
            continue

        selected = sentences[:5]
        bullets = "\n".join(f"- {sentence}" for sentence in selected)
        return f"Summary from {doc.get('name', 'the uploaded resource')}:\n{bullets}"

    return None


def answer_question(question: str, documents: List[Dict]) -> str:
    if _wants_summary(question):
        summary = _sentence_summary(documents)
        if summary:
            context_items = [
                {"name": doc.get("name", "resource"), "chunk": doc.get("text", "")[:2500]}
                for doc in documents
                if doc.get("text")
            ][:3]
            llm_answer = _gemini_answer(question, context_items) if context_items else None
            return llm_answer or summary

    ranked = rank_chunks(question, documents, top_k=6)
    if not ranked:
        fallback_chunks = []
        for doc in documents:
            for chunk in chunk_text(doc.get("text", ""), size=700)[:2]:
                fallback_chunks.append((0.0, doc.get("name", "resource"), chunk))

        if fallback_chunks:
            ranked = fallback_chunks[:6]
        else:
            return (
                "I could not find readable details in the uploaded resources. "
                "Please upload a text-based DOCX/TXT file or a clearer PDF/image."
            )

    if not ranked:
        return (
            "I could not find relevant details in the uploaded resources. "
            "Please upload a related PDF or ask a more specific question."
        )

    context_items = [{"name": name, "chunk": chunk} for _score, name, chunk in ranked]
    llm_answer = _gemini_answer(question, context_items)
    if llm_answer:
        return llm_answer

    lines = [f"- [{item['name']}] {item['chunk'][:220]}..." for item in context_items[:4]]
    return (
        "I answered from your uploaded resources (extractive mode):\n"
        + "\n".join(lines)
        + "\n\nGemini is unavailable right now, so I used the saved resource text directly."
    )
