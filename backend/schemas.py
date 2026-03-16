from pydantic import BaseModel,Field
from typing import Optional

class TrainBase(BaseModel):
    name: str
    # fitness_valid: bool
    fitness_rs: bool
    fitness_signalling: bool
    fitness_telecom: bool

    fitness_rs_expiry_days: int | None = None
    fitness_signalling_expiry_days: int | None = None
    fitness_telecom_expiry_days: int | None = None
    open_job_card: bool
    # cleaning_completed: bool
    days_since_cleaning: int = Field(..., ge=0)
    # sensor_alert: bool
    # override_status
    # parking_slot: int | None = None
    mileage: float=Field(...,ge=0)
    # branding_priority: int = Field(...,ge=0)
    is_branded: bool = False
    contract_total_exposure: float | None = None
    exposure_achieved: float = 0
    contract_days_remaining: int | None = None

class TrainResponse(TrainBase):
    id: int
    sensor_alert: bool
    override_status: Optional[str] = None

    model_config = {
        "from_attributes": True
    }