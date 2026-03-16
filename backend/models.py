from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime
from database import Base


class Train(Base):
    __tablename__ = "trains"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True,index=True,nullable=False)
    # fitness_valid = Column(Boolean)
    fitness_rs = Column(Boolean, nullable=False, default=True)
    fitness_signalling = Column(Boolean, nullable=False, default=True)
    fitness_telecom = Column(Boolean, nullable=False, default=True)

    fitness_rs_expiry_days = Column(Integer, nullable=True)
    fitness_signalling_expiry_days = Column(Integer, nullable=True)
    fitness_telecom_expiry_days = Column(Integer, nullable=True)
    open_job_card = Column(Boolean,nullable=False,default=False)
    # cleaning_completed = Column(Boolean)
    days_since_cleaning = Column(Integer)
    sensor_alert=Column(Boolean,default=False)
    # parking_slot = Column(Integer, nullable=True)
    mileage = Column(Float)
    # branding_priority = Column(Integer)
    is_branded = Column(Boolean, default=False)
    contract_total_exposure = Column(Float, nullable=True)
    exposure_achieved = Column(Float, default=0)

    contract_days_remaining = Column(Integer, nullable=True)
    override_status=Column(String,nullable=True)
    depot_id = Column(Integer, default=1)
    last_service_date = Column(DateTime, nullable=True)
    predicted_maintenance_risk=Column(Float, default=0)



from sqlalchemy import DateTime
from datetime import datetime
import json

class InductionLog(Base):
    __tablename__ = "induction_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    traffic_level = Column(Integer)
    service_trains = Column(String)
    standby_trains = Column(String)
    maintenance_trains = Column(String)