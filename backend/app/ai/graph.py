"""LangGraph intake pipeline.

  START -> extract -> [ agent_risk | agent_completeness | agent_duplicates ]
        -> agent_root_cause -> agent_capa -> summarize -> END
"""
import re
from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from .llm import complete
from . import prompts
from ..core.config import settings
from ..core.database import SessionLocal
from ..models.complaint import Complaint


class IntakeState(TypedDict, total=False):
    raw_text: str
    source: str
    extracted: dict
    risk: dict
    completeness: dict
    duplicates: list
    root_cause: dict
    capa: dict
    summary: str


REQUIRED_FIELDS = [
    "complainant_org", "product_name", "batch_number", "description",
    "complaint_type", "date_received", "country", "quantity_affected",
]


def _tok(text: str):
    return set(
        w for w in re.findall(r"[a-z0-9]{3,}", (text or "").lower())
        if w not in {"the", "and", "with", "for", "was", "were", "that", "this"}
    )


# ── nodes ──────────────────────────────────────────────
def node_extract(state: IntakeState):
    data = complete(prompts.EXTRACTION_SYSTEM, prompts.user_for("extract", state))
    return {"extracted": data}


def node_risk(state: IntakeState):
    data = complete(prompts.RISK_SYSTEM, prompts.user_for("risk", state))
    try:
        s, p = int(data.get("severity") or 3), int(data.get("probability") or 3)
        score = s * p
        level = "low" if score <= 4 else "medium" if score <= 9 else "high" if score <= 14 else "critical"
        data.update(severity=s, probability=p, score=score, risk_level=level)
    except Exception:
        pass
    return {"risk": data}


def node_completeness(state: IntakeState):
    ext = state.get("extracted") or {}
    missing = [f for f in REQUIRED_FIELDS if not ext.get(f)]
    score = round(100 * (len(REQUIRED_FIELDS) - len(missing)) / len(REQUIRED_FIELDS), 1)
    return {"completeness": {"score": score, "missing_fields": missing, "checked_fields": REQUIRED_FIELDS}}


def node_duplicates(state: IntakeState):
    ext = state.get("extracted") or {}
    prod = (ext.get("product_name") or "").lower()
    batch = re.sub(r"[^a-z0-9]", "", (ext.get("batch_number") or "").lower())
    desc_toks = _tok(ext.get("description"))
    out = []
    db = SessionLocal()
    try:
        for c in db.query(Complaint).order_by(Complaint.created_at.desc()).limit(200):
            s = 0.0
            cb = re.sub(r"[^a-z0-9]", "", (c.batch_number or "").lower())
            if batch and cb and batch == cb:
                s += 0.45
            cp = (c.product_name or "").lower()
            if prod and cp and (prod in cp or cp in prod):
                s += 0.25
            union = desc_toks | _tok(c.description)
            inter = desc_toks & _tok(c.description)
            if union:
                s += 0.30 * len(inter) / len(union)
            if s >= 0.5:
                out.append({
                    "id": c.id,
                    "complaint_number": c.complaint_number,
                    "product_name": c.product_name,
                    "batch_number": c.batch_number,
                    "status": c.status,
                    "similarity": round(s * 100),
                })
    finally:
        db.close()
    out.sort(key=lambda x: -x["similarity"])
    return {"duplicates": out[:3]}


def node_root_cause(state: IntakeState):
    return {"root_cause": complete(
        prompts.ROOT_CAUSE_SYSTEM, prompts.user_for("rc", state),
        model=settings.model_context,
    )}


def node_capa(state: IntakeState):
    return {"capa": complete(
        prompts.CAPA_SYSTEM, prompts.user_for("capa", state),
        model=settings.model_context,
    )}


def node_summarize(state: IntakeState):
    data = complete(prompts.SUMMARY_SYSTEM, prompts.user_for("sum", state))
    return {"summary": data.get("summary") or data.get("error") or ""}


# ── graph ──────────────────────────────────────────────
def build_graph():
    g = StateGraph(IntakeState)
    g.add_node("extract", node_extract)
    g.add_node("agent_risk", node_risk)
    g.add_node("agent_completeness", node_completeness)
    g.add_node("agent_duplicates", node_duplicates)
    g.add_node("agent_root_cause", node_root_cause)
    g.add_node("agent_capa", node_capa)
    g.add_node("summarize", node_summarize)

    g.add_edge(START, "extract")
    g.add_edge("extract", "agent_risk")
    g.add_edge("extract", "agent_completeness")
    g.add_edge("extract", "agent_duplicates")
    g.add_edge("agent_risk", "agent_root_cause")
    g.add_edge("agent_completeness", "agent_root_cause")
    g.add_edge("agent_duplicates", "agent_root_cause")
    g.add_edge("agent_root_cause", "agent_capa")
    g.add_edge("agent_capa", "summarize")
    g.add_edge("summarize", END)
    return g.compile()


GRAPH = build_graph()