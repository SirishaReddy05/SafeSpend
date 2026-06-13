import os
import re
import zlib
from pdf2image import convert_from_path
from src.config import PROCESSED_FOLDER


def _decode_pdf_literal(value):
    result = []
    index = 0
    while index < len(value):
        char = value[index]
        if char != "\\":
            result.append(char)
            index += 1
            continue

        index += 1
        if index >= len(value):
            break

        escaped = value[index]
        if escaped in "nrtbf":
            result.append({"n": "\n", "r": "\r", "t": "\t", "b": "\b", "f": "\f"}[escaped])
            index += 1
        elif escaped in "\\()":
            result.append(escaped)
            index += 1
        elif escaped in "\r\n":
            index += 1
            if escaped == "\r" and index < len(value) and value[index] == "\n":
                index += 1
        elif escaped.isdigit():
            digits = escaped
            index += 1
            for _ in range(2):
                if index < len(value) and value[index].isdigit():
                    digits += value[index]
                    index += 1
            result.append(chr(int(digits, 8)))
        else:
            result.append(escaped)
            index += 1

    return "".join(result)


def _decode_pdf_hex(value):
    compact = re.sub(r"\s+", "", value)
    if len(compact) % 2 == 1:
        compact += "0"
    try:
        raw = bytes.fromhex(compact)
    except ValueError:
        return ""
    for encoding in ("utf-16-be", "utf-8", "latin-1"):
        try:
            return raw.decode(encoding).replace("\x00", "")
        except UnicodeDecodeError:
            continue
    return raw.decode("latin-1", errors="ignore").replace("\x00", "")


def _extract_strings_from_content(content):
    text = []

    literal_pattern = re.compile(r"\((?:\\.|[^\\()])*\)")
    hex_pattern = re.compile(r"<([0-9A-Fa-f\s]+)>")

    for block in re.findall(rb"BT(.*?)ET", content, flags=re.DOTALL):
        block_text = block.decode("latin-1", errors="ignore")
        pieces = []
        for match in literal_pattern.finditer(block_text):
            pieces.append(_decode_pdf_literal(match.group(0)[1:-1]))
        for match in hex_pattern.finditer(block_text):
            pieces.append(_decode_pdf_hex(match.group(1)))
        if pieces:
            text.append(" ".join(piece for piece in pieces if piece.strip()))

    return "\n".join(line for line in text if line.strip())


def _iter_pdf_streams(raw):
    for match in re.finditer(rb"<<(.*?)>>\s*stream\r?\n(.*?)\r?\nendstream", raw, flags=re.DOTALL):
        dictionary = match.group(1)
        stream = match.group(2).strip(b"\r\n")
        if b"/FlateDecode" in dictionary:
            try:
                yield zlib.decompress(stream)
            except zlib.error:
                continue
        else:
            yield stream


def _optional_library_pdf_text(pdf_path):
    try:
        import fitz

        with fitz.open(pdf_path) as document:
            return "\n".join(page.get_text("text") for page in document)
    except Exception:
        pass

    try:
        from pypdf import PdfReader
    except ImportError:
        try:
            from PyPDF2 import PdfReader
        except ImportError:
            return ""

    try:
        reader = PdfReader(pdf_path)
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception:
        return ""


def normalize_extracted_text(text):
    text = text.replace("\x00", "")
    text = re.sub(r"(?<=\b[A-Za-z])\s+(?=[A-Za-z]\b)", "", text)
    text = re.sub(r"(?<=\b\d)\s+(?=[\d.]\b)", "", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def is_probably_readable_text(text):
    compact = text.strip()
    if len(compact) < 20:
        return False

    controls = sum((ord(ch) < 32 and ch not in "\n\r\t") or ord(ch) == 127 for ch in compact)
    letters = sum(ch.isalpha() for ch in compact)
    ascii_printable = sum((ch.isascii() and (ch.isprintable() or ch in "\n\r\t")) for ch in compact)

    length = max(len(compact), 1)
    return controls / length < 0.02 and letters / length > 0.2 and ascii_printable / length > 0.75


def extract_text_from_pdf(pdf_path):
    library_text = normalize_extracted_text(_optional_library_pdf_text(pdf_path))
    if library_text:
        return library_text

    with open(pdf_path, "rb") as fp:
        raw = fp.read()

    stream_text = "\n".join(_extract_strings_from_content(stream) for stream in _iter_pdf_streams(raw))
    return normalize_extracted_text(stream_text)


def pdf_to_images(pdf_path):
    try:
        import fitz

        image_paths = []
        with fitz.open(pdf_path) as document:
            for index, page in enumerate(document, start=1):
                pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
                img_path = os.path.join(PROCESSED_FOLDER, f"pdf_page_{index}.png")
                pixmap.save(img_path)
                image_paths.append(img_path)
        return image_paths
    except Exception:
        pass

    pages = convert_from_path(pdf_path, dpi=300)
    image_paths = []

    for i, page in enumerate(pages):
        img_path = os.path.join(PROCESSED_FOLDER, f"pdf_page_{i+1}.png")
        page.save(img_path, "PNG")
        image_paths.append(img_path)

    return image_paths
