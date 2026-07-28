import json
from .llm import complete
from ..models.complaint import Complaint

ANALYSIS_SYSTEM_PROMPT = """You are an expert Pharmaceutical Quality Assurance (QA) and QMS AI assistant.
Your task is to analyze a logged complaint and generate a structured JSON object containing three sections: root_cause, capa, and summary.

The JSON output MUST perfectly match this structure:
{
  "root_cause": {
    "ishikawa_category": "man | machine | material | method | measurement | mother_nature",
    "probable_causes": ["probable cause 1", "probable cause 2"],
    "five_whys": ["Why 1?", "Why 2?", "Why 3?", "Why 4?", "Why 5 (Root Cause)?"]
  },
  "capa": {
    "immediate_actions": ["action 1", "action 2"],
    "corrective_actions": ["action 1", "action 2"],
    "preventive_actions": ["action 1", "action 2"],
    "regulatory_consideration": "Brief explanation of regulatory impact (e.g. FDA field alert required)"
  },
  "summary": "A concise, professional executive brief (2-3 sentences) summarizing the issue, risk, and next steps."
}

Ensure the analysis is highly professional, plausible for the pharma industry, and directly addresses the facts provided in the complaint.
DO NOT include markdown code blocks, just output the raw JSON.
"""

def analyze_complaint(c: Complaint) -> dict:
    complaint_data = {
        "complaint_number": c.complaint_number,
        "product_name": c.product_name,
        "batch_number": c.batch_number,
        "dosage_form": c.dosage_form,
        "complaint_type": c.complaint_type,
        "adverse_event": c.adverse_event,
        "description": c.description,
        "risk_level": c.risk_level,
        "risk_rationale": c.risk_rationale,
    }
    
    user_prompt = f"Analyze the following complaint data and return the required JSON structure:\n\n{json.dumps(complaint_data, indent=2)}"
    
    from ..core.config import settings
    # Complete using our LLM wrapper with the reasoning model
    data = complete(ANALYSIS_SYSTEM_PROMPT, user_prompt, model=settings.model_context, max_tokens=1500)
    
    return data
