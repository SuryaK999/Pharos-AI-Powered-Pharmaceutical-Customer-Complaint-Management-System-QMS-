import json
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from ...core.database import get_db
from ...models.complaint import Complaint, Activity
from ...schemas.complaint import (ComplaintOut, ComplaintCreate, ComplaintUpdate,
                                  ProcessTextIn, StatsOut, ChatRequest, ChatResponse)
from ...ai.graph import CHAT_GRAPH
from ...services.documents import parse_upload

router = APIRouter()

# ── Conversational AI Chat ─────────────────────────────
@router.post("/ai/chat", response_model=ChatResponse)
def ai_chat(body: ChatRequest):
    try:
        result = CHAT_GRAPH.invoke({
            "message": body.message,
            "history": [m.model_dump() for m in body.history],
            "form_state": body.form_state,
        })
    except Exception as e:
        raise HTTPException(500, f"AI processing failed: {str(e)}")
    fields = result.get("extracted_fields") or {}
    risk = result.get("risk") or {}
    return ChatResponse(
        reply=result.get("reply", "Done."),
        action=result.get("action", "general"),
        form_updates={k: v for k, v in fields.items() if v is not None and k != "reply"},
        risk_assessment=risk if risk else None,
        duplicates=risk.get("duplicates", []) if risk else [],
    )

@router.post("/ai/chat-upload", response_model=ChatResponse)
async def ai_chat_upload(
    file: UploadFile = File(...),
    message: str = Form(""),
    history: str = Form("[]"),
    form_state: str = Form("{}"),
):
    try:
        text = parse_upload(file.filename, await file.read())
    except ValueError as e:
        raise HTTPException(422, str(e))
    try:
        result = CHAT_GRAPH.invoke({
            "message": message or f"Extract complaint details from: {file.filename}",
            "history": json.loads(history),
            "form_state": json.loads(form_state),
            "document_text": text,
        })
    except Exception as e:
        raise HTTPException(500, f"AI processing failed: {str(e)}")
    fields = result.get("extracted_fields") or {}
    risk = result.get("risk") or {}
    return ChatResponse(
        reply=result.get("reply", "Document processed."),
        action=result.get("action", "extract"),
        form_updates={k: v for k, v in fields.items() if v is not None and k != "reply"},
        risk_assessment=risk if risk else None,
        duplicates=risk.get("duplicates", []) if risk else [],
    )

# ── Complaints CRUD ────────────────────────────────────
@router.get("/complaints", response_model=list[ComplaintOut])
def list_complaints(q: str = "", status: str = "", risk: str = "", db: Session = Depends(get_db)):
    query = db.query(Complaint)
    if status: query = query.filter(Complaint.status == status)
    if risk: query = query.filter(Complaint.risk_level == risk)
    if q:
        like = f"%{q}%"
        query = query.filter((Complaint.complaint_number.ilike(like)) |
                             (Complaint.product_name.ilike(like)) |
                             (Complaint.complainant_org.ilike(like)) |
                             (Complaint.batch_number.ilike(like)) |
                             (Complaint.description.ilike(like)))
    return query.order_by(Complaint.created_at.desc()).all()

@router.get("/complaints/{cid}", response_model=ComplaintOut)
def get_complaint(cid: str, db: Session = Depends(get_db)):
    c = db.query(Complaint).get(cid)
    if not c: raise HTTPException(404, "Complaint not found")
    return c

@router.post("/complaints", response_model=ComplaintOut)
def create_complaint(payload: ComplaintCreate, db: Session = Depends(get_db)):
    f, ai = payload.form, payload.ai or {}
    seq = db.query(func.count(Complaint.id)).scalar() + 1
    c = Complaint(
        complaint_number=f"CC-{datetime.utcnow().year}-{seq:04d}",
        status="submitted",
        source_channel=f.get("source_channel") or "verbal",
        source_filename=ai.get("source_filename"),
        raw_text=ai.get("raw_text"),
        complainant_name=f.get("complainant_name"), complainant_org=f.get("complainant_org"),
        email=f.get("email"), country=f.get("country"),
        product_name=f.get("product_name"), product_code=f.get("product_code"),
        product_strength=f.get("product_strength"),
        batch_number=f.get("batch_number"), dosage_form=f.get("dosage_form"),
        grade=f.get("grade"),
        manufacturing_date=f.get("manufacturing_date"),
        expiry_date=f.get("expiry_date"),
        complaint_type=f.get("complaint_type"), classification=f.get("classification"),
        adverse_event=bool(f.get("adverse_event")), quantity_affected=f.get("quantity_affected"),
        date_received=f.get("date_received"), description=f.get("description"),
    )
    r = ai.get("risk") or ai.get("risk_assessment") or {}
    if not r.get("error"):
        c.risk_severity, c.risk_probability = r.get("severity"), r.get("probability")
        c.risk_score, c.risk_level, c.risk_rationale = r.get("score"), r.get("risk_level"), r.get("rationale")
    comp = ai.get("completeness") or {}
    c.completeness_score, c.missing_fields = comp.get("score"), comp.get("missing_fields") or []
    dups = ai.get("duplicates") or []
    c.duplicate_candidates = dups
    if dups and dups[0].get("similarity", 0) >= 70:
        c.is_duplicate, c.duplicate_of = True, dups[0]["id"]
    c.capa, c.summary = ai.get("capa"), ai.get("summary")
    db.add(c)
    db.flush()
    db.add(Activity(complaint_id=c.id, action="logged",
                    details=f"Complaint logged via AI Copilot ({c.source_channel}). Risk: {(c.risk_level or 'n/a').upper()}."))
    if c.adverse_event:
        db.add(Activity(complaint_id=c.id, action="pv_flag",
                        details="Adverse event flagged — pharmacovigilance notification queued."))
    if c.is_duplicate:
        db.add(Activity(complaint_id=c.id, action="duplicate",
                        details=f"Possible duplicate of {dups[0]['complaint_number']} ({dups[0]['similarity']}% match)."))
    db.commit(); db.refresh(c)
    return c

@router.patch("/complaints/{cid}", response_model=ComplaintOut)
def update_complaint(cid: str, payload: ComplaintUpdate, db: Session = Depends(get_db)):
    c = db.query(Complaint).get(cid)
    if not c: raise HTTPException(404, "Complaint not found")
    if payload.status and payload.status != c.status:
        c.status = payload.status
        db.add(Activity(complaint_id=c.id, action="status_change",
                        details=f"Status moved to {payload.status.replace('_', ' ')}."))
    if payload.fields:
        for k, v in payload.fields.items():
            if hasattr(c, k): setattr(c, k, v)
        db.add(Activity(complaint_id=c.id, action="edited", details="Record fields updated."))
    db.commit(); db.refresh(c)
    return c

# ── Dashboard ──────────────────────────────────────────
@router.get("/stats", response_model=StatsOut)
def stats(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    all_c = db.query(Complaint).all()
    open_c = [c for c in all_c if c.status != "closed"]
    by_status, by_risk = {}, {}
    for c in all_c:
        by_status[c.status] = by_status.get(c.status, 0) + 1
        if c.risk_level: by_risk[c.risk_level] = by_risk.get(c.risk_level, 0) + 1
    weekly = []
    for w in range(7, -1, -1):
        start = now - timedelta(days=(w + 1) * 7); end = now - timedelta(days=w * 7)
        weekly.append({"label": f"W{end.isocalendar()[1]:02d}",
                       "count": sum(1 for c in all_c if c.created_at and start <= c.created_at < end)})
    alerts = [c for c in open_c if c.risk_level in ("critical", "high")]
    alerts.sort(key=lambda c: -(c.risk_score or 0))
    comp = [c.completeness_score for c in all_c if c.completeness_score is not None]
    return StatsOut(
        total=len(all_c), open=len(open_c),
        open_critical=sum(1 for c in open_c if c.risk_level == "critical"),
        closed_this_month=sum(1 for c in all_c if c.status == "closed" and c.updated_at and c.updated_at.month == now.month),
        avg_completeness=round(sum(comp) / len(comp), 1) if comp else 0.0,
        by_status=by_status, by_risk=by_risk, weekly=weekly,
        critical_alerts=[ComplaintOut.model_validate(c).model_dump() for c in alerts[:4]],
        recent=[ComplaintOut.model_validate(c).model_dump()
                for c in sorted(all_c, key=lambda x: x.created_at, reverse=True)[:6]],
    )
