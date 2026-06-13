import os
import tempfile
import base64
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover
    def load_dotenv(*_args, **_kwargs):  # type: ignore
        return False

from src.agent import answer_question, parse_ocr_action
from src.resource_store import (
    create_resource,
    delete_resource,
    load_resources,
    read_resource_text,
)
from src.pdf_utils import is_probably_readable_text


class AskRequest(BaseModel):
    question: str
    resource_ids: Optional[List[str]] = None


class UploadRequest(BaseModel):
    file_name: str
    data_base64: str


class OcrParseRequest(UploadRequest):
    instruction: Optional[str] = None


app = FastAPI(title="SafeSpend Python Engine", version="1.0.0")

ENGINE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(ENGINE_DIR)
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPPORTED_EXTENSIONS = {
    "pdf",
    "png",
    "jpg",
    "jpeg",
    "bmp",
    "tiff",
    "webp",
    "txt",
    "md",
    "csv",
    "docx",
}


def _resource_extension(resource: dict) -> str:
    name = str(resource.get("name") or resource.get("stored_name") or "")
    return name.lower().rsplit(".", 1)[-1] if "." in name else ""


def _repair_resource_text(resource: dict, current_text: str) -> str:
    ext = _resource_extension(resource)
    if ext != "pdf" and is_probably_readable_text(current_text):
        return current_text

    file_path = resource.get("file_path")
    text_path = resource.get("text_path")
    if not file_path or not text_path or ext not in SUPPORTED_EXTENSIONS or not os.path.exists(file_path):
        return current_text

    try:
        from src.ocr_engine import extract_text_from_file

        repaired_text = extract_text_from_file(
            file_path,
            original_name=str(resource.get("name") or resource.get("stored_name") or file_path),
        ).strip()
    except Exception:
        return current_text

    if not is_probably_readable_text(repaired_text):
        return current_text

    try:
        with open(text_path, "w", encoding="utf-8") as fp:
            fp.write(repaired_text)
    except OSError:
        pass

    return repaired_text


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/resources")
def list_resources() -> List[dict]:
    resources = load_resources()
    return [
        {
            "id": item["id"],
            "name": item["name"],
            "created_at": item["created_at"],
            "size_bytes": item["size_bytes"],
        }
        for item in resources
    ]


@app.post("/resources/upload")
def upload_resource(payload: UploadRequest) -> dict:
    file_name = payload.file_name.strip()
    if not file_name:
        raise HTTPException(status_code=400, detail="File name is required.")

    ext = file_name.lower().rsplit(".", 1)[-1] if "." in file_name else ""
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file type.")

    try:
        raw_bytes = base64.b64decode(payload.data_base64, validate=True)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid base64 file data.") from exc

    if not raw_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        from src.ocr_engine import extract_text_from_file
    except ImportError as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "OCR dependencies are missing. Install Python engine requirements: "
                "`pip install -r python_engine/requirements.txt`."
            ),
        ) from exc

    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as temp:
        temp.write(raw_bytes)
        temp_path = temp.name

    try:
        extracted_text = extract_text_from_file(temp_path, original_name=file_name).strip()
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not extract text from `{file_name}`: {exc}",
        ) from exc
    finally:
        try:
            os.remove(temp_path)
        except OSError:
            pass

    if not extracted_text:
        raise HTTPException(status_code=422, detail="No readable text found in file.")

    metadata = create_resource(file_name, raw_bytes, extracted_text)
    return {
        "id": metadata["id"],
        "name": metadata["name"],
        "created_at": metadata["created_at"],
        "size_bytes": metadata["size_bytes"],
    }


def _extract_uploaded_text(payload: UploadRequest) -> str:
    file_name = payload.file_name.strip()
    if not file_name:
        raise HTTPException(status_code=400, detail="File name is required.")

    ext = file_name.lower().rsplit(".", 1)[-1] if "." in file_name else ""
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file type.")

    try:
        raw_bytes = base64.b64decode(payload.data_base64, validate=True)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid base64 file data.") from exc

    if not raw_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        from src.ocr_engine import extract_text_from_file
    except ImportError as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "OCR dependencies are missing. Install Python engine requirements: "
                "`pip install -r python_engine/requirements.txt`."
            ),
        ) from exc

    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as temp:
        temp.write(raw_bytes)
        temp_path = temp.name

    try:
        return extract_text_from_file(temp_path, original_name=file_name).strip()
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not extract text from `{file_name}`: {exc}",
        ) from exc
    finally:
        try:
            os.remove(temp_path)
        except OSError:
            pass


@app.post("/ocr/parse")
def parse_ocr_upload(payload: OcrParseRequest) -> dict:
    extracted_text = _extract_uploaded_text(payload)
    if not extracted_text:
        raise HTTPException(status_code=422, detail="No readable text found in file.")

    action = parse_ocr_action(extracted_text, payload.instruction or "")
    return {
        "file_name": payload.file_name,
        "extracted_text": extracted_text,
        "action": action,
    }


@app.delete("/resources/{resource_id}")
def remove_resource(resource_id: str) -> dict:
    ok = delete_resource(resource_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Resource not found.")
    return {"deleted": True, "id": resource_id}


@app.post("/agent/ask")
def ask_agent(payload: AskRequest) -> dict:
    try:
        question = payload.question.strip()
        if not question:
            raise HTTPException(status_code=400, detail="Question is required.")

        resources = load_resources()
        if payload.resource_ids:
            selected = []
            selected_ids = set(payload.resource_ids)
            for item in resources:
                if item.get("id") in selected_ids:
                    selected.append(item)
            resources = selected

        docs = []
        for item in resources:
            text = _repair_resource_text(item, read_resource_text(item))
            docs.append({"name": item["name"], "text": text})

        answer = answer_question(question, docs)
        return {"answer": answer, "resource_count": len(docs)}
    except HTTPException:
        raise
    except Exception as exc:
        return {
            "answer": (
                "I could not complete the RAG request because the Python engine hit an "
                f"internal processing issue: {exc}"
            ),
            "resource_count": 0,
            "error": str(exc),
        }
