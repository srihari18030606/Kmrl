import json
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib

# load dataset
with open("dataset.json") as f:
    data = json.load(f)

df = pd.DataFrame(data)

# features
X = df[[
    "mileage",
    "cleaning",
    "alert",
    "job",
    "risk_memory",
    "rs_fit",
    "sig_fit",
    "tel_fit"
]]

# target
y = df["failure"]

# split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# model
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

# evaluation
preds = model.predict(X_test)
print(classification_report(y_test, preds))

# save model
joblib.dump(model, "maintenance_model.pkl")

print("Model saved")