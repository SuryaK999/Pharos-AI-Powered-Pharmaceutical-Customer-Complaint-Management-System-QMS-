import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, Float, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base

def _uid(): return str(uuid.uuid4())

class Complaint(Base):
    __tablename__ = "complaints"
    id = Column(String, primary_key=True, default=_uid)
    complaint_number = Column(String(20), unique=True, index=True)
    status = Column(String(20), default="submitted", index=True)  # draft|submitted|under_review|investigation|capa|closed
    source_channel = Column(String(30))
    source_filename = Column(String(255))
    raw_text = Column(Text)
    complainant_name = Column(String(120))
    complainant_org = Column(String(160))
    email = Column(String(160))
    country = Column(String(80))
    product_name = Column(String(160), index=True)
    product_code = Column(String(60))
    product_strength = Column(String(60))
    manufacturing_date = Column(String(20))
    expiry_date = Column(String(20))
    grade = Column(String(30))
    batch_number = Column(String(60), index=True)
    dosage_form = Column(String(80))
    complaint_type = Column(String(40))
    classification = Column(String(20))      # critical|major|minor
    adverse_event = Column(Boolean, default=False)
    quantity_affected = Column(String(80))
    date_received = Column(String(20))
    description = Column(Text)
    # AI Copilot — Risk Assessment (ICH Q9)
    risk_severity = Column(Integer)
    risk_probability = Column(Integer)
    risk_score = Column(Integer)
    risk_level = Column(String(20), index=True)  # low|medium|high|critical
    risk_rationale = Column(Text)
    completeness_score = Column(Float)
    missing_fields = Column(JSON, default=list)
    is_duplicate = Column(Boolean, default=False)
    duplicate_of = Column(String)
    duplicate_candidates = Column(JSON, default=list)
    root_cause = Column(JSON)
    capa = Column(JSON)
    summary = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    activities = relationship("Activity", back_populates="complaint", order_by="Activity.created_at")

class Activity(Base):
    __tablename__ = "activities"
    id = Column(String, primary_key=True, default=_uid)
    complaint_id = Column(String, ForeignKey("complaints.id"), index=True)
    action = Column(String(60))
    actor = Column(String(80), default="QA Officer")
    details = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    complaint = relationship("Complaint", back_populates="activities")
