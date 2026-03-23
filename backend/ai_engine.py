import joblib
import numpy as np
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "ai_models", "maintenance_model.pkl")

model = joblib.load(MODEL_PATH)

def predict_failure_probability(train):

    features = np.array([[
        train.mileage,
        train.days_since_cleaning,
        int(train.sensor_alert),
        int(train.open_job_card),
        train.predicted_maintenance_risk,
        int(train.fitness_rs),
        int(train.fitness_signalling),
        int(train.fitness_telecom)
    ]])

    prob = model.predict_proba(features)[0][1]

    return prob