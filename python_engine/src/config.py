import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

INPUT_FOLDER = os.path.join(BASE_DIR, "inputs")
OUTPUT_FOLDER = os.path.join(BASE_DIR, "outputs")
PROCESSED_FOLDER = os.path.join(OUTPUT_FOLDER, "processed_images")
RESOURCES_FOLDER = os.path.join(BASE_DIR, "resources")
RESOURCE_FILES_FOLDER = os.path.join(RESOURCES_FOLDER, "files")
RESOURCE_TEXT_FOLDER = os.path.join(RESOURCES_FOLDER, "texts")
RESOURCE_DB_FILE = os.path.join(RESOURCES_FOLDER, "resources.json")

# Create folders automatically
os.makedirs(INPUT_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)
os.makedirs(RESOURCES_FOLDER, exist_ok=True)
os.makedirs(RESOURCE_FILES_FOLDER, exist_ok=True)
os.makedirs(RESOURCE_TEXT_FOLDER, exist_ok=True)
