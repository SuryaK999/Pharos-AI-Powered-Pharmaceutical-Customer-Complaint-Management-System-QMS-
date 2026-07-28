"""LangGraph conversational complaint assistant.

  START -> classify_intent -> [agent_log | agent_edit | agent_extract | agent_respond]
                           -> agent_risk -> agent_respond -> END
"""
import json as _json
import re
from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from .llm import complete
from . import prompts
from ..core.config import settings
from ..core.database import SessionLocal
from ..models.complaint import Complaint


class ChatState(TypedDict, total=False):
    message: str
    history: list
    form_state: dict
    document_text: str
    intent: str
    extracted_fields: dict
    risk: dict
    reply: str
    action: str


def _to_str(val) -> str:
    if isinstance(val, list):
        return " ".join(str(v) for v in val)
    return str(val) if val is not None else ""


def _tok(text):
    return set(
        w for w in re.findall(r"[a-z0-9]{3,}", _to_str(text).lower())
        if w not in {"the", "and", "with", "for", "was", "were", "that", "this"}
    )


def _find_duplicates(form: dict) -> list:
    prod = _to_str(form.get("product_name")).lower()
    batch = re.sub(r"[^a-z0-9]", "", _to_str(form.get("batch_number")).lower())
    desc_toks = _tok(form.get("description"))
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
                out.append({"id": c.id, "complaint_number": c.complaint_number,
                            "product_name": c.product_name, "batch_number": c.batch_number,
                            "status": c.status, "similarity": round(s * 100)})
    finally:
        db.close()
    out.sort(key=lambda x: -x["similarity"])
    return out[:3]


# ── nodes ──────────────────────────────────────────────
def node_classify(state: ChatState):
    ctx = prompts.history_text(state.get("history") or [])
    has_doc = bool(state.get("document_text"))
    user_msg = f"Conversation so far:\n{ctx}\n\nUser message: {state.get('message', '')}"
    if has_doc:
        user_msg += "\n\n(A document was uploaded with this message)"
    data = complete(prompts.INTENT_SYSTEM, user_msg, temperature=0.0, max_tokens=60)
    intent = data.get("intent", "general")
    if has_doc and intent == "general":
        intent = "extract"
    return {"intent": intent}


def node_log(state: ChatState):
    ctx = prompts.history_text(state.get("history") or [])
    user = f"Conversation:\n{ctx}\n\nUser complaint: {state.get('message', '')}"
    data = complete(prompts.LOG_SYSTEM, user)
    return {"extracted_fields": data, "action": "log"}


def node_edit(state: ChatState):
    form_json = _json.dumps(state.get("form_state") or {}, indent=1, default=str)
    system = prompts.EDIT_SYSTEM.replace("{form_json}", form_json)
    ctx = prompts.history_text(state.get("history") or [])
    user = f"Conversation:\n{ctx}\n\nUser edit request: {state.get('message', '')}"
    data = complete(system, user)
    updates = data.get("updates") or {}
    reply = data.get("reply") or f"Updated {len(updates)} field(s)."
    return {"extracted_fields": updates, "reply": reply, "action": "edit"}


def node_extract(state: ChatState):
    doc = state.get("document_text") or ""
    msg = state.get("message") or "Extract complaint details from this document."
    user = f"User instruction: {msg}\n\nDOCUMENT CONTENT:\n{doc[:6000]}"
    data = complete(prompts.LOG_SYSTEM, user)
    return {"extracted_fields": data, "action": "extract"}


def node_risk(state: ChatState):
    form = dict(state.get("form_state") or {})
    updates = state.get("extracted_fields") or {}
    form.update({k: v for k, v in updates.items() if v is not None})
    form_json = _json.dumps(form, indent=1, default=str)
    data = complete(prompts.RISK_SYSTEM, f"Complaint form data:\n{form_json}")
    try:
        s, p = int(data.get("severity") or 3), int(data.get("probability") or 3)
        score = s * p
        level = "low" if score <= 4 else "medium" if score <= 9 else "high" if score <= 14 else "critical"
        data.update(severity=s, probability=p, score=score, risk_level=level)
    except Exception:
        pass
    data["duplicates"] = _find_duplicates(form)
    return {"risk": data}


def node_respond(state: ChatState):
    intent = state.get("intent", "general")
    action = state.get("action", intent)

    if intent == "general" and not state.get("extracted_fields"):
        ctx = prompts.history_text(state.get("history") or [])
        data = complete(prompts.RESPOND_SYSTEM,
                        f"Conversation:\n{ctx}\n\nUser: {state.get('message', '')}",
                        max_tokens=300)
        reply = data.get("reply") or data.get("response") or str(data)
        return {"reply": reply, "action": "general"}

    fields = state.get("extracted_fields") or {}
    risk = state.get("risk") or {}

    if action == "log":
        filled = [k for k, v in fields.items() if v is not None and v != "" and k != "reply"]
        reply = (
            f"I've logged this complaint and extracted {len(filled)} fields into the form. "
            f"Risk: {(risk.get('risk_level') or 'n/a').upper()} "
            f"(S{risk.get('severity', '?')} x P{risk.get('probability', '?')} = {risk.get('score', '?')}). "
            f"{risk.get('rationale', '')} "
            f"You can edit any field, e.g. \"change batch number to BMX24602\"."
        )
    elif action == "edit":
        reply = state.get("reply") or f"Updated {len(fields)} field(s)."
        if risk.get("risk_level"):
            reply += f" Risk re-assessed: {risk['risk_level'].upper()} (score {risk.get('score', '?')})."
    elif action == "extract":
        filled = [k for k, v in fields.items() if v is not None and v != "" and k != "reply"]
        reply = (
            f"Extracted {len(filled)} fields from the document. "
            f"Risk: {(risk.get('risk_level') or 'n/a').upper()}. "
            f"Refine any field by typing, e.g. \"the affected quantity is 48 capsules\"."
        )
    else:
        reply = state.get("reply") or "Done."

    return {"reply": reply, "action": action}


# ── routing ────────────────────────────────────────────
def route_by_intent(state: ChatState) -> str:
    intent = state.get("intent", "general")
    return {"log": "agent_log", "edit": "agent_edit", "extract": "agent_extract"}.get(intent, "agent_respond")


# ── build ──────────────────────────────────────────────
def build_chat_graph():
    g = StateGraph(ChatState)
    g.add_node("classify_intent", node_classify)
    g.add_node("agent_log", node_log)
    g.add_node("agent_edit", node_edit)
    g.add_node("agent_extract", node_extract)
    g.add_node("agent_risk", node_risk)
    g.add_node("agent_respond", node_respond)

    g.add_edge(START, "classify_intent")
    g.add_conditional_edges("classify_intent", route_by_intent, {
        "agent_log": "agent_log",
        "agent_edit": "agent_edit",
        "agent_extract": "agent_extract",
        "agent_respond": "agent_respond",
    })
    g.add_edge("agent_log", "agent_risk")
    g.add_edge("agent_edit", "agent_risk")
    g.add_edge("agent_extract", "agent_risk")
    g.add_edge("agent_risk", "agent_respond")
    g.add_edge("agent_respond", END)
    return g.compile()


CHAT_GRAPH = build_chat_graph()