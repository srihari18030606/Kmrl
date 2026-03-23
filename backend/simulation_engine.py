import random

MAINTENANCE_MEMORY = {}

SERVICE_KM_MEAN = 250
SERVICE_KM_VAR = 30

STANDBY_KM_MEAN = 40
STANDBY_KM_VAR = 20

FAILURE_BASE_PROB = 0.03
HIGH_MILEAGE_FAILURE_MULTIPLIER = 2

def advance_one_day(trains, service_list, standby_list, maintenance_list):

    service_names = {t["train"] for t in service_list}
    standby_names = {t["train"] for t in standby_list}
    maintenance_names = {t["train"] for t in maintenance_list}

    # initialize memory for newly entered maintenance trains
    for m in maintenance_names:
        if m not in MAINTENANCE_MEMORY:
            MAINTENANCE_MEMORY[m] = 0

    for train in trains:

        if train.name in maintenance_names:
            MAINTENANCE_MEMORY[train.name] = MAINTENANCE_MEMORY.get(train.name, 0) + 1

        # --- Cleaning age increases for all ---
        train.days_since_cleaning += 1

        # --- Branding time passes ---
        if train.contract_days_remaining is not None:
            train.contract_days_remaining -= 1

        # ================= SERVICE =================
        if train.name in service_names:

            km = random.gauss(SERVICE_KM_MEAN, SERVICE_KM_VAR)
            train.mileage += max(0, km)

            # good performance reduces risk slightly
            train.predicted_maintenance_risk = max(
                0,
                train.predicted_maintenance_risk - 0.03
            )

        # ================= STANDBY =================
        elif train.name in standby_names:

            km = random.gauss(STANDBY_KM_MEAN, STANDBY_KM_VAR)
            train.mileage += max(0, km)

            train.predicted_maintenance_risk = max(
                0,
                train.predicted_maintenance_risk - 0.01
            )

        # ================= MAINTENANCE =================
        elif train.name in maintenance_names:

            days = MAINTENANCE_MEMORY.get(train.name, 1)

            base_prob = 0.2
            queue_bonus = min(0.6, days * 0.08)

            repair_prob = base_prob + queue_bonus

            if random.random() < repair_prob:
                train.open_job_card = False
                train.sensor_alert = False
                train.fitness_rs = True
                train.fitness_signalling = True
                train.fitness_telecom = True

                train.days_since_cleaning = 0
                train.mileage = 15000 + random.randint(-500, 500)

                train.predicted_maintenance_risk = max(
                    0,
                    train.predicted_maintenance_risk - 0.2
                )

                # remove from maintenance memory
                if train.name in MAINTENANCE_MEMORY:
                    del MAINTENANCE_MEMORY[train.name]

        # ================= FAILURE EMERGENCE =================

        failure_prob = FAILURE_BASE_PROB

        if train.mileage > 26000:
            failure_prob *= HIGH_MILEAGE_FAILURE_MULTIPLIER

        if random.random() < failure_prob:
            train.sensor_alert = True
            train.predicted_maintenance_risk = min(
                1,
                train.predicted_maintenance_risk + 0.15
            )