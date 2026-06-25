import json
from database import SessionLocal
from models import Train

db = SessionLocal()

trains = db.query(Train).all()

data = []

for t in trains:
    data.append({
        "name": t.name,
        "fitness_rs": t.fitness_rs,
        "fitness_signalling": t.fitness_signalling,
        "fitness_telecom": t.fitness_telecom,
        "fitness_rs_expiry_days": t.fitness_rs_expiry_days,
        "fitness_signalling_expiry_days": t.fitness_signalling_expiry_days,
        "fitness_telecom_expiry_days": t.fitness_telecom_expiry_days,
        "open_job_card": t.open_job_card,
        "days_since_cleaning": t.days_since_cleaning,
        "sensor_alert": t.sensor_alert,
        "mileage": t.mileage,
        "is_branded": t.is_branded,
        "contract_total_exposure": t.contract_total_exposure,
        "exposure_achieved": t.exposure_achieved,
        "contract_days_remaining": t.contract_days_remaining,
        "override_status": t.override_status,
        "depot_id": t.depot_id,
        "predicted_maintenance_risk": t.predicted_maintenance_risk
    })

with open("train_seed.json", "w") as f:
    json.dump(data, f, indent=4)

print(f"Exported {len(data)} trains.")