"""Seed realistic pharmaceutical complaint records (API + FDF). Run: python seed.py"""
from datetime import datetime, timedelta
from app.core.database import SessionLocal, engine, Base
from app.models.complaint import Complaint, Activity

Base.metadata.create_all(bind=engine)
db = SessionLocal()
db.query(Activity).delete(); db.query(Complaint).delete()

def d(days_ago): return datetime(2026, 7, 28) - timedelta(days=days_ago)

SEEDS = [
 dict(n="CC-2026-0031", days=24, status="closed", org="Helix Pharma Distributors", country="USA",
   product="Metformin HCl 500 mg Tablets", code="MET-500-TAB", batch="MET2602A", form="Tablet (FDF)",
   type="product_quality", cls="minor", ae=False, qty="35 cartons", recv="2026-07-02",
   desc="Mottled appearance observed on tablet surface across multiple blisters. No assay impact suspected; cosmetic deviation reported by wholesaler QC.",
   sev=2, prob=2, comp=100.0, sumr="Cosmetic mottling on Metformin 500 mg tablets, batch MET2602A. No patient safety impact identified. Closed after visual inspection review and granulation moisture check."),
 dict(n="CC-2026-0032", days=21, status="capa", org="Nordic Medicines Oy", country="Finland",
   product="Salbutamol Inhaler 100 mcg", code="SAL-100-MDI", batch="SAL2601B", form="MDI (FDF)",
   type="delivery_documentation", cls="major", ae=False, qty="60 units", recv="2026-07-05",
   desc="Actuator nozzle clogging reported by pharmacies; delivered dose inconsistent in 60 units returned from two chains.",
   sev=3, prob=3, comp=100.0, sumr="Actuator clogging of Salbutamol MDI batch SAL2601B causing dose inconsistency. CAPA underway on actuator supplier tooling and emitted-dose testing."),
 dict(n="CC-2026-0033", days=18, status="investigation", org="Apex Hospital Supplies", country="India",
   product="Ceftriaxone Sodium 1 g for Injection", code="CFX-1G-INJ", batch="CFX-24052", form="Sterile powder (FDF)",
   type="contamination", cls="critical", ae=True, qty="18 vials", recv="2026-07-08",
   desc="Visible white particulate in reconstituted vials. Product was administered to a 68-year-old patient before detection; patient developed infusion-site reaction and fever, recovered. Pharmacovigilance notified.",
   sev=5, prob=3, comp=100.0, sumr="Particulate contamination in Ceftriaxone 1 g injection, batch CFX-24052, with one adverse event (recovered). Market hold applied; sterility and particulate investigation in progress; FDA Field Alert assessment within 3 working days."),
 dict(n="CC-2026-0034", days=15, status="under_review", org="Iberia Farma S.L.", country="Spain",
   product="Omeprazole 20 mg Capsules", code="OMP-20-CAP", batch="OMP2603C", form="Capsule (FDF)",
   type="labeling", cls="minor", ae=False, qty="2,400 packs", recv="2026-07-11",
   desc="Incorrect package insert version (missing updated renal impairment warning) detected in market packs during pharmacy audit.",
   sev=2, prob=3, comp=87.5, sumr="Outdated leaflet version in Omeprazole 20 mg packs, batch OMP2603C. Labeling deviation under review; corrective reprint and distribution check planned."),
 dict(n="CC-2026-0035", days=12, status="investigation", org="Atlas API Trading", country="USA",
   product="Atorvastatin Calcium API", code="ATV-API-020", batch="ATV2406-114", form="API powder",
   type="efficacy_potency", cls="major", ae=False, qty="2 drums (50 kg)", recv="2026-07-14",
   desc="Customer OOS result: assay 97.1% vs specification 98.0-102.0% on incoming inspection. Retain samples requested for confirmatory HPLC.",
   sev=3, prob=2, comp=100.0, sumr="Assay OOS (97.1%) on Atorvastatin Calcium API batch ATV2406-114 reported by customer. Investigation opened with retain testing, OOS lab investigation and stability correlation."),
 dict(n="CC-2026-0036", days=10, status="submitted", org="Maple Leaf Pharmacy Group", country="Canada",
   product="Paracetamol 650 mg Tablets", code="PCM-650-TAB", batch="PCM2604D", form="Tablet (FDF)",
   type="efficacy_potency", cls="major", ae=False, qty="500 cartons", recv="2026-07-16",
   desc="Dissolution failure at 30-minute stage (72% vs NLT 80%) found in customer surveillance testing of two cartons.",
   sev=3, prob=3, comp=87.5, sumr="Dissolution failure reported for Paracetamol 650 mg batch PCM2604D. Complaint logged; dissolution investigation and granulation/lubrication review initiated."),
 dict(n="CC-2026-0037", days=7, status="under_review", org="Sahara Medical Stores", country="Nigeria",
   product="Amoxicillin 500 mg Hard Capsules", code="AMX-500-CAP", batch="AMX-24088", form="Capsule (FDF)",
   type="product_quality", cls="major", ae=False, qty="80 cartons", recv="2026-07-19",
   desc="Capsule shells found brittle and fractured inside blisters after exposure to high-humidity storage; content uniformity concern raised by distributor.",
   sev=3, prob=3, comp=100.0, sumr="Brittle capsule shells in Amoxicillin 500 mg batch AMX-24088 after humidity exposure. Stability and shell moisture investigation under review."),
 dict(n="CC-2026-0038", days=4, status="under_review", org="MedPharm Distribution GmbH", country="Germany",
   product="Amoxicillin 500 mg Hard Capsules", code="AMX-500-CAP", batch="AMX-24091", form="Capsule (FDF)",
   type="packaging", cls="major", ae=False, qty="120 cartons", recv="2026-07-23",
   desc="Compromised blister seals with delamination and loose capsules; yellowish-brown discoloration suggesting moisture ingress. Quarantined at distributor warehouse; two pharmacies reported the same defect.",
   sev=4, prob=4, comp=100.0, sumr="Blister seal failure and moisture-related discoloration in Amoxicillin 500 mg batch AMX-24091, German market. High risk to stability; quarantine confirmed, seal-integrity investigation opened."),
 dict(n="CC-2026-0039", days=2, status="submitted", org="Andes Salud S.A.", country="Chile",
   product="Ibuprofen API", code="IBU-API-011", batch="IBU2502-077", form="API powder",
   type="product_quality", cls="minor", ae=False, qty="1 drum (25 kg)", recv="2026-07-25",
   desc="Faint solvent-like odor noted on drum opening during incoming inspection; CoA within specification. Customer requests residual solvent confirmation.",
   sev=2, prob=2, comp=75.0, sumr="Odor deviation reported for Ibuprofen API batch IBU2502-077. Residual solvent GC confirmation requested; low preliminary risk."),
 dict(n="CC-2026-0040", days=1, status="draft", org="Rhein Biotech GmbH", country="Germany",
   product="Azithromycin 250 mg Tablets", code="AZI-250-TAB", batch="AZI2605E", form="Tablet (FDF)",
   type="delivery_documentation", cls="minor", ae=False, qty=None, recv="2026-07-26",
   desc="Certificate of Analysis missing for one shipped carton; customer requesting reissue.",
   sev=1, prob=1, comp=62.5, sumr="Documentation complaint: missing CoA for Azithromycin 250 mg batch AZI2605E. Administrative resolution in draft."),
]

RISK_LEVEL = lambda s: "low" if s <= 4 else "medium" if s <= 9 else "high" if s <= 14 else "critical"

for i, sd in enumerate(SEEDS):
    score = sd["sev"] * sd["prob"]
    c = Complaint(
        complaint_number=sd["n"], status=sd["status"], source_channel="email",
        complainant_org=sd["org"], country=sd["country"], product_name=sd["product"],
        product_code=sd["code"], batch_number=sd["batch"], dosage_form=sd["form"],
        complaint_type=sd["type"], classification=sd["cls"], adverse_event=sd["ae"],
        quantity_affected=sd["qty"], date_received=sd["recv"], description=sd["desc"],
        risk_severity=sd["sev"], risk_probability=sd["prob"], risk_score=score,
        risk_level=RISK_LEVEL(score),
        risk_rationale="Seeded assessment per ICH Q9 matrix.",
        completeness_score=sd["comp"], missing_fields=[],
        summary=sd["sumr"], created_at=d(sd["days"]), updated_at=d(max(0, sd["days"] - 3)),
    )
    db.add(c); db.flush()
    db.add(Activity(complaint_id=c.id, action="logged", details="Complaint logged via AI intake (email).", created_at=d(sd["days"])))
    db.add(Activity(complaint_id=c.id, action="classified", details=f"AI risk classification: {c.risk_level.upper()} (S{sd['sev']} x P{sd['prob']} = {score}).", created_at=d(sd["days"])))
    if sd["ae"]:
        db.add(Activity(complaint_id=c.id, action="pv_flag", details="Adverse event flagged — pharmacovigilance notified.", created_at=d(sd["days"] - 1)))
    if sd["status"] in ("investigation", "capa", "closed"):
        db.add(Activity(complaint_id=c.id, action="status_change", details=f"Status moved to {sd['status'].replace('_',' ')}.", created_at=d(max(0, sd["days"] - 2))))
db.commit(); db.close()
print(f"Seeded {len(SEEDS)} complaints.")
