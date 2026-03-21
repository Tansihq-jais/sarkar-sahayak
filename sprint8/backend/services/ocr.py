"""
OCR fallback using Tesseract for scanned PDFs.
Triggered when PyMuPDF extracts less than MIN_TEXT_LENGTH characters.
Supports English + Hindi (install tesseract with Hindi language pack).
"""

import logging
import tempfile
from pathlib import Path
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class OcrResult:
    full_text: str
    total_chars: int
    page_count: int
    error: str | None = None


def run_ocr(file_path: str | Path, lang: str = "eng+hin") -> OcrResult:
    """
    Convert PDF pages to images and run Tesseract OCR.
    Returns extracted text from all pages.
    
    Install requirements:
      - Tesseract: https://github.com/UB-Mannheim/tesseract/wiki (Windows)
      - Hindi lang pack: download hin.traineddata to Tesseract tessdata folder
      - pip install pytesseract pdf2image
    """
    try:
        import pytesseract
        from pdf2image import convert_from_path
        from PIL import Image
    except ImportError as e:
        return OcrResult(
            full_text="", total_chars=0, page_count=0,
            error=f"OCR dependencies not installed: {e}"
        )

    path = Path(file_path)
    if not path.exists():
        return OcrResult(
            full_text="", total_chars=0, page_count=0,
            error=f"File not found: {file_path}"
        )

    try:
        logger.info(f"Running OCR on {path.name} with lang={lang}")

        # Convert PDF to images (300 DPI for good OCR accuracy)
        with tempfile.TemporaryDirectory() as tmp_dir:
            images = convert_from_path(
                str(path),
                dpi=300,
                output_folder=tmp_dir,
                fmt="jpeg",
            )

            page_texts: list[str] = []
            for i, image in enumerate(images):
                text = pytesseract.image_to_string(
                    image,
                    lang=lang,
                    config="--psm 6",  # Assume uniform block of text
                )
                text = text.strip()
                if text:
                    page_texts.append(text)
                logger.debug(f"OCR page {i+1}: {len(text)} chars")

        full_text = "\n\n".join(page_texts)
        total_chars = len(full_text)

        logger.info(f"OCR complete: {total_chars} chars from {len(images)} pages")

        return OcrResult(
            full_text=full_text,
            total_chars=total_chars,
            page_count=len(images),
        )

    except Exception as e:
        logger.error(f"OCR failed for {path.name}: {e}")
        return OcrResult(
            full_text="", total_chars=0, page_count=0,
            error=str(e)
        )


def ocr_image(image_path: str | Path, lang: str = "eng+hin") -> str:
    """Run OCR on a single image file."""
    try:
        import pytesseract
        from PIL import Image

        img = Image.open(str(image_path))
        text = pytesseract.image_to_string(img, lang=lang, config="--psm 6")
        return text.strip()
    except Exception as e:
        logger.error(f"OCR image failed: {e}")
        return ""
