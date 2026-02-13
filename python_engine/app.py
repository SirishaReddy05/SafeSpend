import os
from src.ocr_engine import extract_text_from_file
from src.config import INPUT_FOLDER, OUTPUT_FOLDER


if __name__ == "__main__":
    print("\n===== OCR TOOL (PDF/IMAGE) =====\n")
    print(f"📌 Put your file inside: {INPUT_FOLDER}")
    print("📌 Supported: PDF, PNG, JPG, JPEG, BMP, TIFF, WEBP\n")

    filename = input("Enter file name (example: test.pdf or image.jpg): ").strip()
    file_path = os.path.join(INPUT_FOLDER, filename)

    if not os.path.exists(file_path):
        print("\n❌ File not found. Check inputs folder.\n")
        exit()

    print("\n⏳ Processing... Please wait...\n")
    text = extract_text_from_file(file_path)

    output_text_file = os.path.join(OUTPUT_FOLDER, "extracted_text.txt")
    with open(output_text_file, "w", encoding="utf-8") as f:
        f.write(text)

    print("✅ OCR DONE!\n")
    print("📄 Extracted text saved at:")
    print(output_text_file)

    print("\n------ Extracted Text Preview ------\n")
    print(text[:1500])
    print("\n-----------------------------------\n")
