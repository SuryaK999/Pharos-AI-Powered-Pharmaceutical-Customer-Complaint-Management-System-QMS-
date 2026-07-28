import io, email
from pypdf import PdfReader

def parse_upload(filename: str, content: bytes) -> str:
    """Lightweight document parsing (production OCR intentionally out of scope)."""
    lower = (filename or "").lower()
    
    if lower.endswith(".pdf"):
        reader = PdfReader(io.BytesIO(content))
        text = "\n".join((p.extract_text() or "") for p in reader.pages)
        
    elif lower.endswith(".docx"):
        import docx
        doc = docx.Document(io.BytesIO(content))
        text = "\n".join(paragraph.text for paragraph in doc.paragraphs)
        
    elif lower.endswith(".doc"):
        raise ValueError("Legacy .doc files are not supported. Please save the document as .docx and re-upload.")
        
    elif lower.endswith(".eml"):
        msg = email.message_from_bytes(content)
        parts = []
        for part in msg.walk():
            if part.get_content_type() == "text/plain":
                payload = part.get_payload(decode=True)
                if payload:
                    parts.append(payload.decode(part.get_content_charset() or "utf-8", errors="ignore"))
        text = "\n".join(parts) or str(msg.get_payload())
        
    elif lower.endswith((".txt", ".md", ".csv")):
        text = content.decode("utf-8", errors="ignore")
        
    else:
        raise ValueError("Unsupported file type. Please upload PDF, DOCX, EML, or TXT — or paste the text directly.")
        
    if not text.strip():
        raise ValueError("No readable text found in the document.")
        
    return text
