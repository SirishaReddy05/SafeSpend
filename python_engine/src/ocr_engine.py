import os
import pytesseract
from src.preprocess import preprocess_image
from src.pdf_utils import pdf_to_images
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


def extract_text_from_file(file_path):
    ext = file_path.lower().split(".")[-1]

    if ext in ["png", "jpg", "jpeg", "bmp", "tiff", "webp"]:
        return ocr_from_image(file_path)

    elif ext == "pdf":
        images = pdf_to_images(file_path)

        full_text = ""
        for idx, img_path in enumerate(images, start=1):
            full_text += f"\n\n===== PAGE {idx} =====\n\n"
            full_text += ocr_from_image(img_path)

        return full_text

    else:
        return "Unsupported file type"
