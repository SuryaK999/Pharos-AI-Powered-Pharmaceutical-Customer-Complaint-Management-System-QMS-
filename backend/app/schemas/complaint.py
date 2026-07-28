from pydantic import BaseModel, ConfigDict
from typing import Optional, Any
from datetime import datetime

class ActivityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str; action: str; actor: str; details: Optional[str]; created_at: datetime

class ComplaintOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str; complaint_number: str; status: str
    source_channel: Optional[str]; source_filename: Optional[str]; raw_text: Optional[str]
    complainant_name: Optional[str]; complainant_org: Optional[str]; email: Optional[str]; country: Optional[str]
    product_name: Optional[str]; product_code: Optional[str]; batch_number: Optional[str]; dosage_form: Optional[str]
    complaint_type: Optional[str]; classification: Optional[str]; adverse_event: bool
    quantity_affected: Optional[str]; date_received: Optional[str]; description: Optional[str]
    risk_severity: Optional[int]; risk_probability: Optional[int]; risk_score: Optional[int]
    risk_level: Optional[str]; risk_rationale: Optional[str]
    completeness_score: Optional[float]; missing_fields: Optional[list]
    is_duplicate: bool; duplicate_of: Optional[str]; duplicate_candidates: Optional[list]
    root_cause: Optional[Any]; capa: Optional[Any]; summary: Optional[str]
    created_at: datetime; updated_at: datetime
    activities: list[ActivityOut] = []

class ComplaintCreate(BaseModel):
    form: dict
    ai: dict = {}

class ComplaintUpdate(BaseModel):
    status: Optional[str] = None
    fields: Optional[dict] = None

class ProcessTextIn(BaseModel):
    text: str

class StatsOut(BaseModel):
    total: int; open: int; open_critical: int; closed_this_month: int
    avg_completeness: float
    by_status: dict; by_risk: dict
    weekly: list; critical_alerts: list; recent: list
