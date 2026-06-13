import json
import os
import uuid
from datetime import datetime
from typing import Dict, List

from src.config import RESOURCE_DB_FILE, RESOURCE_FILES_FOLDER, RESOURCE_TEXT_FOLDER


def _utc_now() -> str:
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


def _safe_name(file_name: str) -> str:
    base = os.path.basename(file_name)
    return "".join(ch if ch.isalnum() or ch in ("-", "_", ".") else "_" for ch in base)


def load_resources() -> List[Dict]:
    if not os.path.exists(RESOURCE_DB_FILE):
        return []

    try:
        with open(RESOURCE_DB_FILE, "r", encoding="utf-8") as fp:
            data = json.load(fp)
            if isinstance(data, list):
                return data
            return []
    except (json.JSONDecodeError, OSError):
        return []


def save_resources(resources: List[Dict]) -> None:
    with open(RESOURCE_DB_FILE, "w", encoding="utf-8") as fp:
        json.dump(resources, fp, indent=2)


def create_resource(file_name: str, file_bytes: bytes, extracted_text: str) -> Dict:
    resource_id = str(uuid.uuid4())
    safe_name = _safe_name(file_name)
    stored_name = f"{resource_id}_{safe_name}"
    file_path = os.path.join(RESOURCE_FILES_FOLDER, stored_name)
    text_path = os.path.join(RESOURCE_TEXT_FOLDER, f"{resource_id}.txt")

    with open(file_path, "wb") as fp:
        fp.write(file_bytes)
    with open(text_path, "w", encoding="utf-8") as fp:
        fp.write(extracted_text)

    metadata = {
        "id": resource_id,
        "name": file_name,
        "stored_name": stored_name,
        "file_path": file_path,
        "text_path": text_path,
        "created_at": _utc_now(),
        "size_bytes": len(file_bytes),
    }

    resources = load_resources()
    resources.append(metadata)
    save_resources(resources)
    return metadata


def delete_resource(resource_id: str) -> bool:
    resources = load_resources()
    remaining = [item for item in resources if item.get("id") != resource_id]
    if len(remaining) == len(resources):
        return False

    target = next(item for item in resources if item.get("id") == resource_id)
    for path_key in ("file_path", "text_path"):
        path = target.get(path_key)
        if path and os.path.exists(path):
            try:
                os.remove(path)
            except OSError:
                pass

    save_resources(remaining)
    return True


def read_resource_text(resource: Dict) -> str:
    text_path = resource.get("text_path")
    if not text_path or not os.path.exists(text_path):
        return ""
    try:
        with open(text_path, "r", encoding="utf-8") as fp:
            return fp.read()
    except OSError:
        return ""
