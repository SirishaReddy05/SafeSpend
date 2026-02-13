import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

INPUT_FOLDER = os.path.join(BASE_DIR, "inputs")
OUTPUT_FOLDER = os.path.join(BASE_DIR, "outputs")
PROCESSED_FOLDER = os.path.join(OUTPUT_FOLDER, "processed_images")

# Create folders automatically
os.makedirs(INPUT_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)
