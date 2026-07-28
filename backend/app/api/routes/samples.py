import os

from fastapi import APIRouter

router = APIRouter()

SAMPLES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "samples")

@router.get("")
def get_samples():
    samples = []
    if os.path.exists(SAMPLES_DIR):
        for filename in os.listdir(SAMPLES_DIR):
            filepath = os.path.join(SAMPLES_DIR, filename)
            if os.path.isfile(filepath):
                with open(filepath, "r", encoding="utf-8") as f:
                    samples.append({
                        "filename": filename,
                        "content": f.read()
                    })
    return samples
