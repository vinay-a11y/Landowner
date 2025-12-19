import pandas as pd
import requests
import math
from dateutil import parser

API_URL = "http://localhost:8000/api/agreements"
CSV_FILE = "Warehouse.csv"

# ---------- HELPERS ----------
def safe_float(val):
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return 0.0
    return float(val)

def safe_int(val):
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return 0
    return int(val)

def safe_str(val):
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return ""
    return str(val).strip()

def parse_date(val):
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return ""
    return parser.parse(str(val), dayfirst=True).strftime("%d-%m-%Y")

# ---------- LOAD CSV ----------
df = pd.read_csv(CSV_FILE)

for index, row in df.iterrows():
    payload = {
        "survey_no": safe_str(row.get("Servey No.")),
        "firm_name": safe_str(row.get("Firm Name")),
        "land_owner": safe_str(row.get("Land Owner")),
        "area": safe_str(row.get("Area")),

        "doc_no_1": safe_str(row.get("Doc. No.")),
        "agreement_date": parse_date(row.get("Date")),
        "development_months": safe_int(row.get("Development Period in months")),
        "possession_status": safe_str(row.get("Possation Status")),
        "rent_per_sqft": safe_float(row.get("Commited Rent in Rs./Sqft")),
        "free_area_bu": safe_float(row.get("Free Area (DA) - BU")),
        "free_area_cp": safe_float(row.get("Free Area (DA) - CP")),
        "agreement_value": safe_float(row.get("Agreement Value")),
        "deposit_da": safe_float(row.get("Deposit (DA)")),

        "stamp_duty_1": safe_float(row.get("Stamp duty")),
        "regi_dd_1": safe_float(row.get("Regi. D.D.")),
        "handling_charges_1": safe_float(row.get("Handling Charges")),
        "adjudication_1": safe_float(row.get("Adjudication")),
        "legal_expenses_1": safe_float(row.get("Legal & other Exp.")),

        "doc_no_2": safe_str(row.get("Doc. No.(POA)")),
        "date_2": parse_date(row.get("Date(POA)")),
        "stamp_duty_2": safe_float(row.get("Stamp duty(POA)")),
        "regi_dd_2": safe_float(row.get("Regi. D.D.(POA)")),
        "handling_charges_2": safe_float(row.get("Handling Charges(POA)")),
        "legal_expenses_2": safe_float(row.get("Legal & other Exp.(POA)")),

        "doc_no_3": safe_str(row.get("Doc. No. (A3)")),
        "stamp_duty_3": safe_float(row.get("Stamp duty(A3)")),
        "regi_dd_3": safe_float(row.get("Regi. D.D.(A3)")),
        "handling_charges_3": safe_float(row.get("Handling Charges(A3)")),
    }

    response = requests.post(API_URL, json=payload)

    if response.status_code == 201:
        print(f"✅ Row {index + 1} inserted")
    else:
        print(f"❌ Row {index + 1} failed:", response.text)
