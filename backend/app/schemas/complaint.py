from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class ActivityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str; action: str; actor: str; details: str | None; created_at: datetime

class ComplaintOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str; complaint_number: str; status: str
    source_channel: str | None; source_filename: str | None; raw_text: str | None
    complainant_name: str | None; complainant_org: str | None; email: str | None; country: str | None
    product_name: str | None; product_code: str | None; product_strength: str | None
    batch_number: str | None; dosage_form: str | None; grade: str | None
    manufacturing_date: str | None; expiry_date: str | None
    complaint_type: str | None; classification: str | None; adverse_event: bool
    quantity_affected: str | None; date_received: str | None; description: str | None
    risk_severity: int | None; risk_probability: int | None; risk_score: int | None
    risk_level: str | None; risk_rationale: str | None
    completeness_score: float | None; missing_fields: list | None
    is_duplicate: bool; duplicate_of: str | None; duplicate_candidates: list | None
    root_cause: Any | None; capa: Any | None; summary: str | None
    created_at: datetime; updated_at: datetime
    activities: list[ActivityOut] = []

class ComplaintCreate(BaseModel):
    form: dict
    ai: dict = {}

class ComplaintUpdate(BaseModel):
    status: str | None = None
    fields: dict | None = None

class ProcessTextIn(BaseModel):
    text: str

class StatsOut(BaseModel):
    total: int; open: int; open_critical: int; closed_this_month: int
    avg_completeness: float
    by_status: dict; by_risk: dict
    weekly: list; critical_alerts: list; recent: list

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []
    form_state: dict = {}

class ChatResponse(BaseModel):
    reply: str
    action: str
    form_updates: dict = {}
    risk_assessment: Any | None = None
    duplicates: list = []
