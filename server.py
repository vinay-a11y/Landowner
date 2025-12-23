from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, Float, Integer, DateTime
from sqlalchemy.orm import sessionmaker, Session, declarative_base
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, Header


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Database Configuration
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "mysql+pymysql://root:143%40Vinay@localhost/landowner_db"
)
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()
# ================= AUTH CONFIG =================
SECRET_KEY = os.environ.get("SECRET_KEY", "")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ForgotPasswordRequest(BaseModel):
    username: str

class RegisterRequest(BaseModel):
    username: str
    password: str

# Pydantic Models
class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# SQLAlchemy Model
class AgreementDB(Base):
    __tablename__ = "agreements"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    survey_no = Column(String(100), nullable=False)
    firm_name = Column(String(200), default="")
    land_owner = Column(String(200), default="")
    area = Column(String(50), nullable=False)
    area_in_guntas = Column(Float, default=0.0)
    doc_no_1 = Column(String(100), nullable=False)
    agreement_date = Column(String(20), nullable=False)
    development_months = Column(Integer, nullable=False)
    development_end_date = Column(String(20), default="")
    possession_status = Column(String(50), nullable=False)
    rent_per_sqft = Column(Float, nullable=False)
    free_area_bu = Column(Float, nullable=False)
    free_area_cp = Column(Float, nullable=False)
    total_months = Column(Integer, default=0)
    total_rent = Column(Float, default=0.0)
    agreement_value = Column(Float, nullable=False)
    deposit_da = Column(Float, nullable=False)
    stamp_duty_1 = Column(Float, default=0.0)
    regi_dd_1 = Column(Float, default=0.0)
    handling_charges_1 = Column(Float, default=0.0)
    adjudication_1 = Column(Float, default=0.0)
    legal_expenses_1 = Column(Float, default=0.0)
    doc_no_2 = Column(String(100), default="")
    date_2 = Column(String(20), default="")
    stamp_duty_2 = Column(Float, default=0.0)
    regi_dd_2 = Column(Float, default=0.0)
    handling_charges_2 = Column(Float, default=0.0)
    legal_expenses_2 = Column(Float, default=0.0)
    doc_no_3 = Column(String(100), default="")
    stamp_duty_3 = Column(Float, default=0.0)
    regi_dd_3 = Column(Float, default=0.0)
    handling_charges_3 = Column(Float, default=0.0)
    agreement_1_expense = Column(Float, default=0.0)
    agreement_2_expense = Column(Float, default=0.0)
    agreement_3_expense = Column(Float, default=0.0)
    total_agreement_expense = Column(Float, default=0.0)
    real_value_per_acre = Column(Float, default=0.0)
    created_at = Column(String(50), default=lambda: datetime.now(timezone.utc).isoformat())

# Create tables
Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")

        user = db.query(UserDB).filter(UserDB.username == username).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return user

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def require_user(user=Depends(get_current_user)):
    """Reusable dependency that requires authenticated user"""
    return user

@api_router.post("/auth/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(UserDB).filter(UserDB.username == data.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    user = UserDB(
        username=data.username,
        password_hash=hash_password(data.password)
    )

    db.add(user)
    db.commit()

    return {"message": "User registered successfully"}

@api_router.post("/auth/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.username == data.username).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token({"sub": user.username})
    return {"access_token": token}

@api_router.post("/auth/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    # Placeholder for email / OTP
    return {"message": "If user exists, reset instructions sent"}

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
    model_config = ConfigDict(from_attributes=True)
    
    id: str
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
    created_at: str

class DashboardSummary(BaseModel):
    total_land_count: int
    total_area_guntas: float
    total_free_bu_area: float
    total_rent_value: float
    total_agreement_expenses: float
    net_project_cost: float

# Routes
@api_router.get("/")
def root():
    return {"message": "Land Agreement Management API"}

@api_router.post("/agreements", response_model=Agreement)
def create_agreement(
    input_data: AgreementCreate, 
    db: Session = Depends(get_db),
    user: UserDB = Depends(require_user)
):
    # Calculate derived fields
    area_guntas = parse_area_to_guntas(input_data.area)
    dev_end_date = calculate_development_end_date(input_data.agreement_date, input_data.development_months)
    total_months = calculate_rent_months(dev_end_date, input_data.possession_status)
    total_rent = calculate_total_rent(total_months, input_data.rent_per_sqft, input_data.free_area_bu)
    real_value = calculate_real_value(input_data.free_area_bu, area_guntas)
    expenses = calculate_agreement_expenses(input_data.model_dump())
    
    # Create database object
    db_agreement = AgreementDB(
        id=str(uuid.uuid4()),
        **input_data.model_dump(),
        area_in_guntas=area_guntas,
        development_end_date=dev_end_date.strftime("%d-%m-%Y"),
        total_months=total_months,
        total_rent=total_rent,
        real_value_per_acre=real_value,
        created_at=datetime.now(timezone.utc).isoformat(),
        **expenses
    )
    
    db.add(db_agreement)
    db.commit()
    db.refresh(db_agreement)
    
    return db_agreement

@api_router.get("/agreements", response_model=List[Agreement])
def get_agreements(
    skip: int = 0,
    limit: int = 100,
    sort_by: Optional[str] = None,
    sort_order: int = -1,
    db: Session = Depends(get_db),
    user: UserDB = Depends(require_user)
):
    # Determine sort field
    sort_field = getattr(AgreementDB, sort_by if sort_by else "created_at")
    
    # Apply sorting
    if sort_order == -1:
        query = db.query(AgreementDB).order_by(sort_field.desc())
    else:
        query = db.query(AgreementDB).order_by(sort_field.asc())
    
    # Apply pagination
    agreements = query.offset(skip).limit(limit).all()
    
    return agreements

@api_router.get("/agreements/{agreement_id}", response_model=Agreement)
def get_agreement(
    agreement_id: str, 
    db: Session = Depends(get_db),
    user: UserDB = Depends(require_user)
):
    agreement = db.query(AgreementDB).filter(AgreementDB.id == agreement_id).first()
    if not agreement:
        raise HTTPException(status_code=404, detail="Agreement not found")
    return agreement

@api_router.put("/agreements/{agreement_id}", response_model=Agreement)
def update_agreement(
    agreement_id: str, 
    input_data: AgreementCreate, 
    db: Session = Depends(get_db),
    user: UserDB = Depends(require_user)
):
    # Check if agreement exists
    db_agreement = db.query(AgreementDB).filter(AgreementDB.id == agreement_id).first()
    
    # Recalculate all derived fields
    area_guntas = parse_area_to_guntas(input_data.area)
    dev_end_date = calculate_development_end_date(input_data.agreement_date, input_data.development_months)
    total_months = calculate_rent_months(dev_end_date, input_data.possession_status)
    total_rent = calculate_total_rent(total_months, input_data.rent_per_sqft, input_data.free_area_bu)
    real_value = calculate_real_value(input_data.free_area_bu, area_guntas)
    expenses = calculate_agreement_expenses(input_data.model_dump())
    
    if db_agreement:
        # Update existing agreement
        for key, value in input_data.model_dump().items():
            setattr(db_agreement, key, value)
        
        db_agreement.area_in_guntas = area_guntas
        db_agreement.development_end_date = dev_end_date.strftime("%d-%m-%Y")
        db_agreement.total_months = total_months
        db_agreement.total_rent = total_rent
        db_agreement.real_value_per_acre = real_value
        db_agreement.agreement_1_expense = expenses['agreement_1_expense']
        db_agreement.agreement_2_expense = expenses['agreement_2_expense']
        db_agreement.agreement_3_expense = expenses['agreement_3_expense']
        db_agreement.total_agreement_expense = expenses['total_agreement_expense']
    else:
        # Create new agreement with specified ID
        db_agreement = AgreementDB(
            id=agreement_id,
            **input_data.model_dump(),
            area_in_guntas=area_guntas,
            development_end_date=dev_end_date.strftime("%d-%m-%Y"),
            total_months=total_months,
            total_rent=total_rent,
            real_value_per_acre=real_value,
            created_at=datetime.now(timezone.utc).isoformat(),
            **expenses
        )
        db.add(db_agreement)
    
    db.commit()
    db.refresh(db_agreement)
    
    return db_agreement

@api_router.delete("/agreements/{agreement_id}")
def delete_agreement(
    agreement_id: str, 
    db: Session = Depends(get_db),
    user: UserDB = Depends(require_user)
):
    db_agreement = db.query(AgreementDB).filter(AgreementDB.id == agreement_id).first()
    if not db_agreement:
        raise HTTPException(status_code=404, detail="Agreement not found")
    
    db.delete(db_agreement)
    db.commit()
    
    return {"message": "Agreement deleted successfully"}

@api_router.get("/dashboard/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    user: UserDB = Depends(require_user)
):
    agreements = db.query(AgreementDB).all()
    
    total_count = len(agreements)
    total_area = sum(a.area_in_guntas for a in agreements)
    total_free_bu = sum(a.free_area_bu for a in agreements)
    total_rent = sum(a.total_rent for a in agreements)
    total_expenses = sum(a.total_agreement_expense for a in agreements)
    net_cost = total_expenses + sum(a.deposit_da for a in agreements)
    
    return DashboardSummary(
        total_land_count=total_count,
        total_area_guntas=total_area,
        total_free_bu_area=total_free_bu,
        total_rent_value=total_rent,
        total_agreement_expenses=total_expenses,
        net_project_cost=net_cost
    )

app.include_router(api_router)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
