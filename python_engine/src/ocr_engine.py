import os
import re
import zipfile
import pytesseract
from src.preprocess import preprocess_image
from src.pdf_utils import extract_text_from_pdf, is_probably_readable_text, pdf_to_images
from src.config import PROCESSED_FOLDER


# OPTIONAL: SET TESSERACT PATH (Windows)
# If pytesseract doesn't detect tesseract automatically, uncomment:
#
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def ocr_from_image(image_path):
    processed_path = os.path.join(
        PROCESSED_FOLDER,
        "processed_" + os.path.basename(image_path)
    )

    processed_img = preprocess_image(image_path, save_path=processed_path)

    config = "--oem 3 --psm 6"
    text = pytesseract.image_to_string(processed_img, lang="eng", config=config)

    return text


def _read_text_file(file_path):
    for encoding in ("utf-8", "utf-8-sig", "cp1252", "latin-1"):
        try:
            with open(file_path, "r", encoding=encoding) as fp:
                return fp.read()
        except UnicodeDecodeError:
            continue
    with open(file_path, "rb") as fp:
        return fp.read().decode("utf-8", errors="ignore")


def _extract_docx_text(file_path):
    paragraphs = []
    with zipfile.ZipFile(file_path) as archive:
        xml_names = [
            name
            for name in archive.namelist()
            if name.startswith("word/") and name.endswith(".xml")
        ]
        for name in xml_names:
            xml = archive.read(name).decode("utf-8", errors="ignore")
            xml = re.sub(r"<w:tab[^>]*/>", "\t", xml)
            xml = re.sub(r"</w:p>", "\n", xml)
            text_parts = re.findall(r"<w:t[^>]*>(.*?)</w:t>", xml, flags=re.DOTALL)
            if text_parts:
                paragraphs.append(
                    "".join(text_parts)
                    .replace("&amp;", "&")
                    .replace("&lt;", "<")
                    .replace("&gt;", ">")
                    .replace("&quot;", '"')
                    .replace("&apos;", "'")
                )
    return "\n".join(part for part in paragraphs if part.strip())


def extract_text_from_file(file_path, original_name=None):
    source_name = original_name or file_path
    ext = source_name.lower().split(".")[-1]

    if ext in ["png", "jpg", "jpeg", "bmp", "tiff", "webp"]:
        return ocr_from_image(file_path)

    elif ext in ["txt", "md", "csv"]:
        return _read_text_file(file_path)

    elif ext == "docx":
        return _extract_docx_text(file_path)

    elif ext == "pdf":
        text = extract_text_from_pdf(file_path).strip()
        if is_probably_readable_text(text):
            return text

        try:
            images = pdf_to_images(file_path)
        except Exception as exc:
            raise RuntimeError(
                "This PDF appears to be scanned/image-only, and Poppler is not available "
                "for OCR conversion. Upload a text-based PDF/DOCX, or install Poppler and "
                "add its bin folder to PATH."
            ) from exc

        full_text = ""
        for idx, img_path in enumerate(images, start=1):
            full_text += f"\n\n===== PAGE {idx} =====\n\n"
            full_text += ocr_from_image(img_path)

        return full_text

    else:
        raise ValueError(f"Unsupported file type: .{ext}")
