from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, Header


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# ================= AUTH CONFIG =================
SECRET_KEY = os.environ.get("SECRET_KEY", "SUPER_SECRET_KEY_CHANGE_ME")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # React frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],          # GET, POST, PUT, DELETE, OPTIONS
    allow_headers=["*"],          # Authorization, Content-Type, etc.
)

api_router = APIRouter(prefix="/api")

class RelativeDelta:
    """Custom implementation to replace dateutil.relativedelta"""
    def __init__(self, dt1=None, dt2=None, months=0, years=0):
        if dt1 and dt2:
            # Calculate difference between two dates
            self.years = dt1.year - dt2.year
            self.months = dt1.month - dt2.month
            
            if self.months < 0:
                self.years -= 1
                self.months += 12
        else:
            # Store months to add
            self.years = years
            self.months = months
    
    def __radd__(self, dt):
        """Add months to a datetime object"""
        if isinstance(dt, datetime):
            total_months = dt.month + self.months + (self.years * 12)
            years_to_add = (total_months - 1) // 12
            new_month = ((total_months - 1) % 12) + 1
            new_year = dt.year + years_to_add
            
            # Handle day overflow (e.g., Jan 31 + 1 month = Feb 28/29)
            max_day_in_month = [31, 29 if self._is_leap_year(new_year) else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
            new_day = min(dt.day, max_day_in_month[new_month - 1])
            
            return dt.replace(year=new_year, month=new_month, day=new_day)
        return NotImplemented
    
    @staticmethod

    def _is_leap_year(year):
        """Check if a year is a leap year"""
        return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)

def relativedelta(*args, **kwargs):
    """Factory function to match dateutil.relativedelta interface"""
    if len(args) == 2:
        return RelativeDelta(args[0], args[1])
    return RelativeDelta(**kwargs)
def parse_area_to_guntas(area_str: str) -> float:
    """
    Converts area like:
    1.50.0  -> 150.00
    0.81.6  -> 81.60
    0.69.4  -> 69.40
    0.52.18 -> 52.18
    """
    try:
        parts = area_str.split('.')
        if len(parts) != 3:
            return 0.0

        whole = int(parts[0])
        guntas = int(parts[1])
        decimal = parts[2]

        # if decimal has 1 digit → treat as tenths (×10)
        if len(decimal) == 1:
            decimal_value = int(decimal) / 10
        else:
            decimal_value = int(decimal) / 100

        return whole * 100 + guntas + decimal_value

    except:
        return 0.0

def calculate_development_end_date(agreement_date: str, development_months: int) -> datetime:
    """Calculate development end date"""
    try:
        date_obj = datetime.strptime(agreement_date, "%d-%m-%Y")
        end_date = date_obj + relativedelta(months=development_months)
        return end_date
    except:
        return datetime.now()

def calculate_rent_months(dev_end_date: datetime, possession_status: str) -> int:
    """Calculate total rent months"""
    if possession_status.lower() == "given":
        return 0
    now = datetime.now()
    diff = relativedelta(now, dev_end_date)
    total_months = diff.years * 12 + diff.months
    return max(0, total_months)

def calculate_total_rent(total_months: int, rent_per_sqft: float, free_area_bu: float) -> float:
    """Calculate total rent"""
    return total_months * rent_per_sqft * free_area_bu

def calculate_real_value(free_area_bu: float, guntas: float) -> float:
    """Calculate real value per acre"""
    if guntas == 0:
        return 0
    return (free_area_bu / guntas) * 40

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)
def create_access_token(data: dict):
    to_encode = data.copy()
    to_encode["iat"] = datetime.utcnow()
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")

        if not username:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = await db.users.find_one({"username": username})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return user

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def calculate_agreement_expenses(agreement_data: dict) -> dict:
    """Calculate all agreement expenses"""
    agmt1 = (
        agreement_data.get('stamp_duty_1', 0) +
        agreement_data.get('regi_dd_1', 0) +
        agreement_data.get('handling_charges_1', 0) +
        agreement_data.get('adjudication_1', 0) +
        agreement_data.get('legal_expenses_1', 0)
    )
    
    agmt2 = (
        agreement_data.get('stamp_duty_2', 0) +
        agreement_data.get('regi_dd_2', 0) +
        agreement_data.get('handling_charges_2', 0) +
        agreement_data.get('legal_expenses_2', 0)
    )
    
    agmt3 = (
        agreement_data.get('stamp_duty_3', 0) +
        agreement_data.get('regi_dd_3', 0) +
        agreement_data.get('handling_charges_3', 0)
    )
    
    total = agmt1 + agmt2 + agmt3
    
    return {
        'agreement_1_expense': agmt1,
        'agreement_2_expense': agmt2,
        'agreement_3_expense': agmt3,
        'total_agreement_expense': total
    }


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ForgotPasswordRequest(BaseModel):
    username: str

# Models
class AgreementCreate(BaseModel):
    survey_no: str
    firm_name: Optional[str] = ""
    land_owner: Optional[str] = ""
    area: str
    doc_no_1: str
    agreement_date: str
    development_months: int
    possession_status: str
    rent_per_sqft: float
    free_area_bu: float
    free_area_cp: float
    agreement_value: float
    deposit_da: float
    stamp_duty_1: float = 0
    regi_dd_1: float = 0
    handling_charges_1: float = 0
    adjudication_1: float = 0
    legal_expenses_1: float = 0
    doc_no_2: Optional[str] = ""
    date_2: Optional[str] = ""
    stamp_duty_2: float = 0
    regi_dd_2: float = 0
    handling_charges_2: float = 0
    legal_expenses_2: float = 0
    doc_no_3: Optional[str] = ""
    stamp_duty_3: float = 0
    regi_dd_3: float = 0
    handling_charges_3: float = 0

class Agreement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    survey_no: str
    firm_name: str
    land_owner: str
    area: str
    area_in_guntas: float
    doc_no_1: str
    agreement_date: str
    development_months: int
    development_end_date: str
    possession_status: str
    rent_per_sqft: float
    free_area_bu: float
    free_area_cp: float
    total_months: int
    total_rent: float
    agreement_value: float
    deposit_da: float
    stamp_duty_1: float
    regi_dd_1: float
    handling_charges_1: float
    adjudication_1: float
    legal_expenses_1: float
    doc_no_2: str
    date_2: str
    stamp_duty_2: float
    regi_dd_2: float
    handling_charges_2: float
    legal_expenses_2: float
    doc_no_3: str
    stamp_duty_3: float
    regi_dd_3: float
    handling_charges_3: float
    agreement_1_expense: float
    agreement_2_expense: float
    agreement_3_expense: float
    total_agreement_expense: float
    real_value_per_acre: float
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class DashboardSummary(BaseModel):
    total_land_count: int
    total_area_guntas: float
    total_free_bu_area: float
    total_rent_value: float
    total_agreement_expenses: float
    net_project_cost: float



# Routes
@api_router.get("/")
async def root():
    return {"message": "Land Agreement Management API"}

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    user = await db.users.find_one({"username": data.username})

    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token({"sub": user["username"]})

    return {"access_token": token}
@api_router.post("/auth/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    user = await db.users.find_one({"username": data.username})

    if not user:
        return {"message": "If user exists, reset instructions sent"}

    # Later: email / OTP reset logic
    return {"message": "Password reset instructions sent"}

@api_router.post("/agreements", response_model=Agreement)
async def create_agreement(input_data: AgreementCreate):
    # Calculate derived fields
    area_guntas = parse_area_to_guntas(input_data.area)
    dev_end_date = calculate_development_end_date(input_data.agreement_date, input_data.development_months)
    total_months = calculate_rent_months(dev_end_date, input_data.possession_status)
    total_rent = calculate_total_rent(total_months, input_data.rent_per_sqft, input_data.free_area_bu)
    real_value = calculate_real_value(input_data.free_area_bu, area_guntas)
    expenses = calculate_agreement_expenses(input_data.model_dump())
    
    agreement_dict = input_data.model_dump()
    agreement_dict.update({
        'id': str(uuid.uuid4()),
        'area_in_guntas': area_guntas,
        'development_end_date': dev_end_date.strftime("%d-%m-%Y"),
        'total_months': total_months,
        'total_rent': total_rent,
        'real_value_per_acre': real_value,
        'created_at': datetime.now(timezone.utc).isoformat(),
        **expenses
    })
    
    agreement_obj = Agreement(**agreement_dict)
    doc = agreement_obj.model_dump()
    
    await db.agreements.insert_one(doc)
    return agreement_obj

@api_router.get("/agreements", response_model=List[Agreement])
async def get_agreements(
    skip: int = 0,
    limit: int = 100,
    sort_by: Optional[str] = None,
    sort_order: int = -1
):
    query = {}
    sort_field = sort_by if sort_by else "created_at"
    
    agreements = await db.agreements.find(query, {"_id": 0}).sort(sort_field, sort_order).skip(skip).limit(limit).to_list(limit)
    return agreements

@api_router.get("/agreements/{agreement_id}", response_model=Agreement)
async def get_agreement(agreement_id: str):
    agreement = await db.agreements.find_one({"id": agreement_id}, {"_id": 0})
    if not agreement:
        raise HTTPException(status_code=404, detail="Agreement not found")
    return agreement

@api_router.put("/agreements/{agreement_id}", response_model=Agreement)
async def update_agreement(agreement_id: str, input_data: AgreementCreate):
    # Recalculate all derived fields
    area_guntas = parse_area_to_guntas(input_data.area)
    dev_end_date = calculate_development_end_date(input_data.agreement_date, input_data.development_months)
    total_months = calculate_rent_months(dev_end_date, input_data.possession_status)
    total_rent = calculate_total_rent(total_months, input_data.rent_per_sqft, input_data.free_area_bu)
    real_value = calculate_real_value(input_data.free_area_bu, area_guntas)
    expenses = calculate_agreement_expenses(input_data.model_dump())
    
    agreement_dict = input_data.model_dump()
    agreement_dict.update({
        'id': agreement_id,
        'area_in_guntas': area_guntas,
        'development_end_date': dev_end_date.strftime("%d-%m-%Y"),
        'total_months': total_months,
        'total_rent': total_rent,
        'real_value_per_acre': real_value,
        **expenses
    })
    
    existing = await db.agreements.find_one({"id": agreement_id})
    if existing:
        agreement_dict['created_at'] = existing.get('created_at', datetime.now(timezone.utc).isoformat())
    else:
        agreement_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.agreements.update_one(
        {"id": agreement_id},
        {"$set": agreement_dict},
        upsert=True
    )
    
    agreement_obj = Agreement(**agreement_dict)
    return agreement_obj

    
@api_router.delete("/agreements/{agreement_id}")
async def delete_agreement(agreement_id: str):
    result = await db.agreements.delete_one({"id": agreement_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Agreement not found")
    return {"message": "Agreement deleted successfully"}

@api_router.get("/dashboard/summary", response_model=DashboardSummary)
async def get_dashboard_summary():
    agreements = await db.agreements.find({}, {"_id": 0}).to_list(1000)
    
    total_count = len(agreements)
    total_area = sum(a.get('area_in_guntas', 0) for a in agreements)
    total_free_bu = sum(a.get('free_area_bu', 0) for a in agreements)
    total_rent = sum(a.get('total_rent', 0) for a in agreements)
    total_expenses = sum(a.get('total_agreement_expense', 0) for a in agreements)
    net_cost = total_expenses + sum(a.get('deposit_da', 0) for a in agreements)
    
    return DashboardSummary(
        total_land_count=total_count,
        total_area_guntas=total_area,
        total_free_bu_area=total_free_bu,
        total_rent_value=total_rent,
        total_agreement_expenses=total_expenses,
        net_project_cost=net_cost
    )

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
