import os
from pdf2image import convert_from_path
from src.config import PROCESSED_FOLDER


def pdf_to_images(pdf_path):
    pages = convert_from_path(pdf_path, dpi=300)
    image_paths = []

    for i, page in enumerate(pages):
        img_path = os.path.join(PROCESSED_FOLDER, f"pdf_page_{i+1}.png")
        page.save(img_path, "PNG")
        image_paths.append(img_path)

    return image_paths
