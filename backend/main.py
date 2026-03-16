# from turtle import update

# from xgboost import train

from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import models, schemas, crud, induction
from database import engine, SessionLocal, Base

import copy

from fastapi import File,UploadFile
import csv
from io import StringIO

from pydantic import BaseModel

class SimulationInput(BaseModel):
    traffic_level: int
    hypothetical_overrides: dict | None = None
    hypothetical_sensor_alerts: list[str] | None = None



Base.metadata.create_all(bind=engine)

# app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

        

@app.get("/trains", response_model=list[schemas.TrainResponse])
def read_trains(db: Session = Depends(get_db)):
    return crud.get_trains(db)

@app.post("/trains")
def add_train(train: schemas.TrainBase, db: Session = Depends(get_db)):
    return crud.create_train(db, train)

from fastapi import Query

from datetime import datetime
import json

@app.get("/generate-induction")
def generate_induction(
    traffic_level: int = Query(3, ge=1, le=5),
    db: Session = Depends(get_db)
):
    trains = crud.get_trains(db)

    result = induction.evaluate_trains(
        trains,
        traffic_level=traffic_level
    )

    # Create audit log entry
    log_entry = models.InductionLog(
        traffic_level=traffic_level,
        service_trains=json.dumps([t["train"] for t in result["service"]]),
        standby_trains=json.dumps([t["train"] for t in result["standby"]]),
        maintenance_trains=json.dumps([t["train"] for t in result["maintenance"]])
    )

    db.add(log_entry)

    # Auto-clear override
    for train in trains:
        if train.override_status is not None:
            train.override_status = None

    db.commit()

    return result

@app.post("/upload-branding")
async def upload_branding(file: UploadFile = File(...), db: Session = Depends(get_db)):

        contents = await file.read()
        decoded = contents.decode("utf-8")
        csv_reader = csv.DictReader(StringIO(decoded))

        updated = 0
        unknown_trains = []
        invalid_rows = []

        for row in csv_reader:
            try:
                name = row["name"]
                is_branded = bool(int(row["is_branded"]))
                total = float(row["contract_total_exposure"])
                achieved = float(row["exposure_achieved"])
                days = int(row["contract_days_remaining"])

                if total < 0 or achieved < 0:
                    invalid_rows.append(row)
                    continue

            except Exception:
                invalid_rows.append(row)
                continue

            train = db.query(models.Train).filter(models.Train.name == name).first()

            if train:
                train.is_branded = is_branded
                train.contract_total_exposure = total
                train.exposure_achieved = achieved
                train.contract_days_remaining = days
                updated += 1
            else:
                unknown_trains.append(name)

        db.commit()

        return {
            "updated_trains": updated,
            "unknown_trains": unknown_trains,
            "invalid_rows": invalid_rows
        }

@app.delete("/reset-database")
def reset_database(db: Session = Depends(get_db)):
    crud.delete_all_trains(db)
    return {"message": "All trains deleted successfully"}

from pydantic import BaseModel

class MaximoUpdate(BaseModel):
    train_name: str
    open_job_card: bool | None = None
    # fitness_valid: bool | None = None
    fitness_rs: bool | None = None
    fitness_signalling: bool | None = None
    fitness_telecom: bool | None = None
    fitness_rs_expiry_days: int | None = None
    fitness_signalling_expiry_days: int | None = None
    fitness_telecom_expiry_days: int | None = None


@app.patch("/maximo-update")
def maximo_update(update: MaximoUpdate, db: Session = Depends(get_db)):
    train = db.query(models.Train).filter(models.Train.name == update.train_name).first()

    if not train:
        return {"error": "Train not found"}

    if update.open_job_card is not None:
        train.open_job_card = update.open_job_card

    # if update.fitness_valid is not None:
    #     train.fitness_valid = update.fitness_valid

    if update.fitness_rs is not None:
      train.fitness_rs = update.fitness_rs

    if update.fitness_signalling is not None:
      train.fitness_signalling = update.fitness_signalling

    if update.fitness_telecom is not None:
       train.fitness_telecom = update.fitness_telecom

    if update.fitness_rs_expiry_days is not None:
       train.fitness_rs_expiry_days = update.fitness_rs_expiry_days

    if update.fitness_signalling_expiry_days is not None:
        train.fitness_signalling_expiry_days = update.fitness_signalling_expiry_days

    if update.fitness_telecom_expiry_days is not None:
        train.fitness_telecom_expiry_days = update.fitness_telecom_expiry_days

    db.commit()
    return {"message": "Maximo data updated"}

from pydantic import BaseModel, Field

class IoTUpdate(BaseModel):
    train_name: str
    sensor_alert: bool | None = None
    mileage: float | None = Field(default=None,ge=0)


@app.patch("/iot-update")
def iot_update(update: IoTUpdate, db: Session = Depends(get_db)):
    train = db.query(models.Train).filter(models.Train.name == update.train_name).first()

    if not train:
        return {"error": "Train not found"}

    if update.sensor_alert is not None:
        train.sensor_alert = update.sensor_alert

    if update.mileage is not None:
        train.mileage = update.mileage

    db.commit()
    return {"message": "IoT data updated"}

class CleaningUpdate(BaseModel):
    train_name: str
    days_since_cleaning: int = Field(..., ge=0,le=30)


@app.patch("/cleaning-update")
def cleaning_update(update: CleaningUpdate, db: Session = Depends(get_db)):

    train = db.query(models.Train).filter(models.Train.name == update.train_name).first()

    if not train:
        return {"error": "Train not found"}

    train.days_since_cleaning = update.days_since_cleaning

    db.commit()

    return {"message": "Cleaning data updated"}


from typing import Literal
class SupervisorUpdate(BaseModel):
    train_name: str
    override_status: Literal["standby","maintenance"]# "standby" or "maintenance"


@app.patch("/supervisor-update")
def supervisor_update(update: SupervisorUpdate, db: Session = Depends(get_db)):

    train = db.query(models.Train).filter(models.Train.name == update.train_name).first()

    if not train:
        return {"error": "Train not found"}

    if update.override_status not in ["standby", "maintenance"]:
        return {"error": "Invalid override status"}

    train.override_status = update.override_status
    db.commit()

    return {"message": "Supervisor override applied"}


@app.get("/induction-logs")
def get_induction_logs(db: Session = Depends(get_db)):
    logs = db.query(models.InductionLog).all()

    return [
        {
            "id": log.id,
            "timestamp": log.timestamp,
            "traffic_level": log.traffic_level,
            "service": json.loads(log.service_trains),
            "standby": json.loads(log.standby_trains),
            "maintenance": json.loads(log.maintenance_trains),
        }
        for log in logs
    ]

import random

@app.post("/populate-database")
def populate_database(db: Session = Depends(get_db)):

    # Clear existing trains
    db.query(models.Train).delete()

    for i in range(1, 11):
        is_branded=random.choice([True, False])

        if is_branded:
            total=random.uniform(50, 150)
            achieved=random.uniform(0, total*0.8)
            days=random.randint(5,20)

        else:
            total=0
            achieved=0
            days=0
        train = models.Train(
            name=f"T-{i}",
            fitness_rs=random.choice([True, True, True, False]),
            fitness_signalling=random.choice([True, True, True, False]),
            fitness_telecom=random.choice([True, True, True, False]),
            fitness_rs_expiry_days=random.randint(1, 30),
            fitness_signalling_expiry_days=random.randint(1, 30),
            fitness_telecom_expiry_days=random.randint(1, 30),
            open_job_card=random.choice([False, False, True]),
            days_since_cleaning=random.randint(0, 10),
            # cleaning_completed=random.choice([True, True, False]),
            sensor_alert=False,
            mileage=random.randint(1000, 35000),
            # branding_priority=random.randint(0, 10),
            # contract_total_exposure=random.uniform(50, 150),
            # exposure_achieved=random.uniform(0, 40)
            is_branded=is_branded,
            contract_total_exposure=total,
            exposure_achieved=achieved,
            contract_days_remaining=days,
            override_status=None
        )

        db.add(train)

    db.commit()

    return {"message": "10 sample trains created successfully"}


@app.get("/cleaning-plan")
def get_cleaning_plan():
    from induction import LAST_CLEANING_PLAN
    return {
        "cleaning_trains": LAST_CLEANING_PLAN
    }

@app.get("/depot-layout")
def get_depot_layout():
    from induction import LAST_DEPOT_LAYOUT
    return LAST_DEPOT_LAYOUT

@app.post("/simulate-induction")
def simulate_induction(input: SimulationInput, db: Session = Depends(get_db)):

    trains = crud.get_trains(db)
    sim_trains = copy.deepcopy(trains)

    # Apply hypothetical changes
    if input.hypothetical_sensor_alerts:
        for t in sim_trains:
            if t.name in input.hypothetical_sensor_alerts:
                t.sensor_alert = True

    if input.hypothetical_overrides:
        for t in sim_trains:
            if t.name in input.hypothetical_overrides:
                t.override_status = input.hypothetical_overrides[t.name]

    # Preserve real global state
    old_cleaning = induction.LAST_CLEANING_PLAN.copy()
    old_layout = induction.LAST_DEPOT_LAYOUT.copy()

    result = induction.evaluate_trains(
        sim_trains,
        traffic_level=input.traffic_level
    )

    # Restore real state
    induction.LAST_CLEANING_PLAN = old_cleaning
    induction.LAST_DEPOT_LAYOUT = old_layout

    return result

@app.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):

    trains = crud.get_trains(db)

    alerts = []

    branded_overdue = [
        t.name for t in trains
        if t.is_branded and t.contract_days_remaining is not None and t.contract_days_remaining < 0
    ]

    if len(branded_overdue) > 0:
        alerts.append({
            "type": "branding",
            "message": f"{len(branded_overdue)} trains overdue branding exposure"
        })

    high_mileage = [
        t.name for t in trains if t.mileage > 28000
    ]

    if len(high_mileage) / len(trains) > 0.3:
        alerts.append({
            "type": "maintenance",
            "message": "Clustered high-mileage risk in fleet"
        })

    dirty = [
        t.name for t in trains if t.days_since_cleaning > 7
    ]

    if len(dirty) / len(trains) >  0.3:
        alerts.append({
            "type": "cleaning",
            "message": "Cleaning backlog risk detected"
        })

    return alerts

@app.get("/fleet-health")
def fleet_health(db: Session = Depends(get_db)):

    trains = crud.get_trains(db)

    total = len(trains)

    service_ready = len([
        t for t in trains
        if t.fitness_rs and t.fitness_signalling and t.fitness_telecom and not t.open_job_card
    ])

    avg_mileage = sum(t.mileage for t in trains) / total if total else 0

    cleaning_backlog = len([
        t for t in trains if t.days_since_cleaning > 6
    ]) / total if total else 0

    branding_risk = len([
        t for t in trains
        if t.is_branded and t.contract_days_remaining is not None and t.contract_days_remaining < 3
    ]) / total if total else 0

    return {
        "service_ready_ratio": service_ready / total if total else 0,
        "avg_mileage": avg_mileage,
        "cleaning_backlog_ratio": cleaning_backlog,
        "branding_risk_ratio": branding_risk
    }

@app.get("/decision-breakdown/{train_name}")
def get_decision_breakdown(train_name: str, db: Session = Depends(get_db)):

    train = db.query(models.Train).filter(models.Train.name == train_name).first()

    if not train:
        return {"error": "Train not found"}

    return induction.decision_breakdown(train)

@app.get("/resource-utilization")
def resource_utilization():

    cleaning_used = len(induction.LAST_CLEANING_PLAN)

    layout = induction.LAST_DEPOT_LAYOUT

    total_slots = 5 * 4
    occupied = sum(len(v) for v in layout.values()) if layout else 0

    active_tracks = sum(1 for v in layout.values() if len(v) > 0) if layout else 0

    return {
        "cleaning_bays_used": cleaning_used,
        "active_tracks": active_tracks,
        "occupancy_ratio": occupied / total_slots if total_slots else 0
    }

@app.get("/depot-summary")
def depot_summary(db: Session = Depends(get_db)):

    trains = crud.get_trains(db)

    depots = {}

    for t in trains:
        depots.setdefault(t.depot_id, []).append(t)

    return {
        d: {
            "fleet_size": len(ts),
            "avg_mileage": (sum(t.mileage for t in ts)/len(ts)) if len(ts) > 0 else 0
        }
        for d, ts in depots.items()
    }

@app.get("/shunting-index")
def shunting_index():
    layout = induction.LAST_DEPOT_LAYOUT

    if not layout:
        return {"shunting_complexity_index": 0}

    sizes = [len(v) for v in layout.values()]

    if not sizes:
        return {"shunting_complexity_index": 0}

    return {
        "shunting_complexity_index": max(sizes) - min(sizes)
    }

@app.get("/daily-report")
def daily_report(db: Session = Depends(get_db)):

    trains = crud.get_trains(db)

    total = len(trains)
    high_mileage = len([t for t in trains if t.mileage > 28000])
    dirty = len([t for t in trains if t.days_since_cleaning > 6])
    safety_clear = len([
        t for t in trains
        if t.fitness_rs and t.fitness_signalling and t.fitness_telecom
    ])

    standby_margin = total - safety_clear

    return {
        "fleet_size": total,
        "high_mileage_trains": high_mileage,
        "cleaning_backlog": dirty,
        "safety_clearance_ratio": safety_clear / total if total else 0,
        "standby_margin_estimate": standby_margin,
        "system_status": "Stable" if high_mileage < total * 0.25 else "Attention Required"
    }