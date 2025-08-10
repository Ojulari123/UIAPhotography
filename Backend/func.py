import re
import os
from fastapi import UploadFile
import uuid
from typing import Optional

def generate_slug(title: str) -> str:
    slug = title.lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = slug.strip("-")
    return slug

UPLOAD_DIR = "uploads"

def save_upload_file(upload_file: UploadFile) -> str:
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    ext = os.path.splitext(upload_file.filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as out_file:
        content = upload_file.file.read()
        out_file.write(content)

    return file_path
