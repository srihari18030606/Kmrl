LAST_CLEANING_PLAN=[]
from ai_engine import predict_failure_probability
LAST_DEPOT_LAYOUT={}
def evaluate_trains(trains, traffic_level=3):

    HARD_MAINTENANCE_LIMIT = 30000

    SAFE_ZONE=20000
    CAUTION_ZONE = 26000
    CRITICAL_ZONE = 29000

    BASE_FLEET = 25
    BASE_MAINTENANCE_CAPACITY = 4

    # LAST_CLEANING_THRESHOLD =[]

    service = []
    standby = []
    maintenance = []

    # ---------------------------
    # STEP 1: HARD SAFETY FILTER
    # ---------------------------
    eligible = []

    for train in trains:
        reasons = []

        # if not train.fitness_valid:
        #     reasons.append("Fitness certificate invalid")

        if not train.fitness_rs:
            reasons.append("Rolling stock fitness invalid")

        if not train.fitness_signalling:
            reasons.append("Signalling fitness invalid")

        if not train.fitness_telecom:
            reasons.append("Telecom fitness invalid")

        if train.fitness_rs_expiry_days is not None and train.fitness_rs_expiry_days <= 0:
            reasons.append("Rolling stock certificate valid period lapsed")

        if train.fitness_signalling_expiry_days is not None and train.fitness_signalling_expiry_days <= 0:
            reasons.append("Signalling certificate valid period lapsed")

        if train.fitness_telecom_expiry_days is not None and train.fitness_telecom_expiry_days <= 0:
            reasons.append("Telecom certificate valid period lapsed")

        if train.open_job_card:
            reasons.append("Open job card pending")

        # if not train.cleaning_completed:
        #     reasons.append("Cleaning not completed")

        if train.mileage > HARD_MAINTENANCE_LIMIT:
            reasons.append("Exceeded maximum safe mileage limit")

        if train.sensor_alert:
            reasons.append("IoT sensor alert detected")

        if train.override_status=="maintenance":
            reasons.append("Supervisor forced maintenance")

        if reasons:
            maintenance.append({
                "train": train.name,
                "category": "maintenance",
                "why": f"Sent to maintenance because: {', '.join(reasons)}"
            })
        else:
            eligible.append(train)

    if not eligible and not maintenance:
        return {
            "service": [],
            "standby": [],
            "maintenance": maintenance
        }
    eligible_map={t.name: t for t in eligible}

    # MAX_CLEANING_BAYS = 5

    # urgent_clean = []
    # non_urgent = []

    # for train in eligible:
    #     if train.days_since_cleaning >= 7:
    #         urgent_clean.append(train)
    #     else:
    #         non_urgent.append(train)

    # # Sort urgent trains by priority
    # urgent_clean_sorted = sorted(
    #     urgent_clean,
    #     key=lambda t: (-t.days_since_cleaning, -t.branding_priority)
    # )

    # # Only top N get cleaning slots
    # cleaning_today = urgent_clean_sorted[:MAX_CLEANING_BAYS]

    # cleaning_names = {t.name for t in cleaning_today}

    # new_eligible = []
    # for train in eligible:
    #     if train.name in cleaning_names:
    #         maintenance.append({
    #             "train": train.name,
    #             "category": "cleaning",
    #             "why": f"Cleaning scheduled (urgent, {train.days_since_cleaning} days)"
    #         })
    #     else:
    #         new_eligible.append(train)

    # eligible = new_eligible

    # ---------------------------
# STEP 2: ADVANCED CLEANING MODEL
# ---------------------------

    BASE_FLEET = 25
    BASE_CLEANING_BAYS = 3

    fleet_size = len(eligible)
    effective_bays = max(1, round(BASE_CLEANING_BAYS * (fleet_size / BASE_FLEET)))

    critical = []
    dirty = []
    mild = []
    clean = []

    for train in eligible:
        d = train.days_since_cleaning

        if d >= 14:
            critical.append(train)
        elif d >= 10:
            dirty.append(train)
        elif d >= 5:
            mild.append(train)
        else:
            clean.append(train)

    # Critical trains MUST be cleaned
    cleaning_today = sorted(
        critical,
        key=lambda t: (-t.days_since_cleaning)
    )

    remaining_capacity = max(0, effective_bays - len(cleaning_today))

    dirty_count = len(dirty) + len(critical)
    total_count = len(eligible)

    if total_count == 0:
        hygiene_pressure = 1
    else:
        dirty_ratio = dirty_count / total_count

        if dirty_ratio >= 0.6:
            hygiene_pressure = 1.3
        elif dirty_ratio >= 0.4:
            hygiene_pressure = 1.15
        elif dirty_ratio >= 0.2:
            hygiene_pressure = 1.05
        else:
            hygiene_pressure = 1

    # Traffic-aware aggression
    aggression_factor = {
        1: 1.3,
        2: 1.1,
        3: 1.0,
        4: 0.8,
        5: 0.6
    }[traffic_level]

    # additional_slots = max(0, round(remaining_capacity * aggression_factor))
    adjusted_aggression = aggression_factor * hygiene_pressure
    additional_slots = max(0, round(remaining_capacity * adjusted_aggression))

    dirty_sorted = sorted(
        dirty,
        key=lambda t: (-t.days_since_cleaning)
    )

    cleaning_today.extend(dirty_sorted[:additional_slots])



    global LAST_CLEANING_PLAN
    LAST_CLEANING_PLAN = [t.name for t in cleaning_today]

    cleaning_names = {t.name for t in cleaning_today}

    new_eligible = []

    for train in eligible:
        if train.name in cleaning_names:
            
                d = train.days_since_cleaning
                if d >= 14:
                    level = "critical"
                elif d >= 10:
                    level = "dirty"
                elif d >= 5:
                    level = "mild"
                else:
                    level = "routine"

                maintenance.append({
                "train": train.name,
                "category": "cleaning",
                "why": f"Cleaning scheduled ({level} hygiene level, {d} days since last cleaning)"
                })
        
        else:
            new_eligible.append(train)

    eligible = new_eligible

    eligible_map = {t.name: t for t in eligible}

    all_trains_map = {t.name: t for t in trains} 

    if not eligible and not maintenance:
        return {
            "service": [],
            "standby": [],
            "maintenance": maintenance
        }
    
    # ---------------------------
    # STEP X: MAINTENANCE CAPACITY MODEL
    # ---------------------------

    # fleet_size = len(eligible) + len(maintenance)
    # maintenance_capacity = max(1, round(BASE_MAINTENANCE_CAPACITY * (fleet_size / BASE_FLEET)))

    # if len(maintenance) > maintenance_capacity:

    #     def severity_key(m):
    #         if "Exceeded maximum safe mileage limit" in m["why"]:
    #             return 3
    #         if m["category"] == "cleaning":
    #             return 2
    #         return 1

    #     maintenance_sorted = sorted(maintenance, key=severity_key, reverse=True)

    #     accepted_maintenance = maintenance_sorted[:maintenance_capacity]
    #     overflow = maintenance_sorted[maintenance_capacity:]

    #     overflow_names = {m["train"] for m in overflow}

    #     overflow_trains = [
    #         t for t in trains if t.name in overflow_names
    #     ]

    #     eligible.extend(overflow_trains)
    #     eligible_map = {t.name: t for t in eligible}

    #     maintenance = accepted_maintenance

    fleet_size = len(eligible) + len(maintenance)
    maintenance_capacity = max(1, round(BASE_MAINTENANCE_CAPACITY * (fleet_size / BASE_FLEET)))

    # Separate HARD maintenance (safety issues) from SOFT maintenance (cleaning)
    hard_maintenance = []
    soft_maintenance = []

    for m in maintenance:
        if m["category"] == "cleaning" and "critical" in m["why"]:
            hard_maintenance.append(m)
        elif m["category"] == "cleaning":
            soft_maintenance.append(m)
        else:
            hard_maintenance.append(m)

    # Hard maintenance must ALWAYS remain in maintenance
    available_slots = maintenance_capacity - len(hard_maintenance)

    if available_slots < 0:
        available_slots = 0

    soft_maintenance_sorted = sorted(
        soft_maintenance,
        key=lambda m: all_trains_map[m["train"]].days_since_cleaning,
        reverse=True
    )

    accepted_soft = soft_maintenance_sorted[:available_slots]
    overflow_soft = soft_maintenance_sorted[available_slots:]

    # Only overflow cleaning trains go back to eligible pool
    overflow_names = {m["train"] for m in overflow_soft}

    overflow_trains = [
        t for t in trains if t.name in overflow_names
    ]

    eligible.extend(overflow_trains)
    eligible_map = {t.name: t for t in eligible}

    maintenance = hard_maintenance + accepted_soft


    branding_urgency = {}

    for train in eligible:
        if train.is_branded and train.contract_days_remaining is not None and train.contract_total_exposure is not None:

            remaining = max(0, train.contract_total_exposure - train.exposure_achieved)

            # Contract completed
            if remaining == 0:
                branding_urgency[train.name] = 0
                continue

            # Exposure pressure (how much still pending)
            exposure_pressure = remaining / train.contract_total_exposure

            # Time pressure (how close to deadline)
            if train.contract_days_remaining > 0:
                time_pressure = 1 / train.contract_days_remaining
            else:
                # time_pressure = 2  # overdue panic multiplier
                time_pressure = 1 + (2 / (abs(train.contract_days_remaining) + 1))  # smoother escalation when overdue

            # Nonlinear escalation
            raw_risk = exposure_pressure * (1 + (5 * time_pressure))
            risk = min(raw_risk,5)

            # if remaining<=0:
            #     branding_urgency[train.name] = 0
            #     continue

            branding_urgency[train.name] = risk
        else:
            branding_urgency[train.name] = 0
    # ---------------------------
    # STEP 2: FIXED SCORING
    # ---------------------------
    # max_mileage = max(t.mileage for t in eligible)
    # if max_mileage == 0:
    #     max_mileage = 1

    max_branding = max(branding_urgency.values()) if branding_urgency else 1
    if max_branding == 0:
        max_branding = 1

    scored = []

    traffic_weight_map = {
        1: (0.45, 0.55),
        2: (0.50, 0.50),
        3: (0.55, 0.45),
        4: (0.65, 0.35),
        5: (0.75, 0.25)
    }

    mileage_weight, branding_weight = traffic_weight_map[traffic_level]

    for train in eligible:

        # mileage_factor = 1 - (train.mileage / max_mileage)
        m = train.mileage

        if m < SAFE_ZONE:
            mileage_factor = 1.0

        elif m < CAUTION_ZONE:
            mileage_factor = 0.75

        elif m < CRITICAL_ZONE:
            mileage_factor = 0.4

        elif m < HARD_MAINTENANCE_LIMIT:
            mileage_factor = 0.15

        else:
            mileage_factor = 0

        branding_factor = branding_urgency[train.name] / max_branding

        d = train.days_since_cleaning

        if d >= 14:
            cleanliness_penalty = 0.25
        elif d >= 10:
            cleanliness_penalty = 0.15
        elif d >= 5:
            cleanliness_penalty = 0.05
        else:
            cleanliness_penalty = 0

        score = (mileage_factor * mileage_weight) + (branding_factor * branding_weight) - cleanliness_penalty

        ai_risk = predict_failure_probability(train)
        score = score * (1 - ai_risk)

        score=max(0,min(score,1))

        scored.append({
            "train": train.name,
            "score": round(score, 3),
            "mileage": train.mileage,
            "branding": round(branding_urgency[train.name], 3),
            "ai_risk": round(ai_risk, 3)
        })

    # scored.sort(key=lambda x: x["score"], reverse=True)
    # scored.sort(key=lambda x:
    scored.sort(key=lambda x: (-x["score"], x["mileage"], x["train"]))

    # ---------------------------
    # STEP 3: TRAFFIC-BASED SERVICE SPLIT
    # ---------------------------
    demand_map = {
        1: 0.4,
        2: 0.55,
        3: 0.7,
        4: 0.85,
        5: 0.95
    }

    percentage = demand_map[traffic_level]
    service_count = round(len(scored) * percentage)

    # Ensure at least 1 standby if more than 1 eligible
    if len(scored) > 1 and service_count >= len(scored):
        service_count = len(scored) - 1

    if service_count == 0 and len(scored) > 0:
        service_count = 1

        # ---------------------------
    # STEP 4: INITIAL CATEGORIZATION
    # ---------------------------

    ranked_service = []
    ranked_standby = []

    for index, train in enumerate(scored):
        if index < service_count:
            ranked_service.append(train)
        else:
            ranked_standby.append(train)

    # ---------------------------
    # STEP 5: APPLY SUPERVISOR STANDBY OVERRIDE
    # ---------------------------

    final_service = []
    final_standby = []

    # Move overridden trains to standby
        # First process ranked_service (keep non-forced in service)
    forced_standby = []

    for train in ranked_service:
        original_train = eligible_map[train["train"]]

        if original_train.override_status == "standby":
            train["forced"] = True
            forced_standby.append(train)
        else:
            train["forced"] = False
            final_service.append(train)

    # Add normal ranked standby trains first
    for train in ranked_standby:
        train["forced"] = False
        final_standby.append(train)

    # Then add forced standby trains at the END
    final_standby.extend(forced_standby)

    while len(final_service)<service_count and len(final_standby)>0:
        promoted_train=final_standby.pop(0)
        promoted_train["forced"]=False
        final_service.append(promoted_train)

    # ===========================
    # NEW STEP: BRANDING EXPOSURE CONSUMPTION
    # ===========================

    traffic_exposure_weight = {
        1: 1.2,
        2: 1.5,
        3: 1.8,
        4: 2.1,
        5: 2.5
    }[traffic_level]

    for train in final_service:
        original = eligible_map[train["train"]]

        if original.is_branded:
            original.exposure_achieved += traffic_exposure_weight


    # STEP 6: DEPOT GEOMETRY PARKING
    # ---------------------------

    TRACK_CAPACITY = 5

    track1 = []
    track2 = []
    track3 = []
    track4 = []
    inspection = []

    # --- Assign maintenance to Inspection Line ---
    for i, m in enumerate(maintenance):
        m["track"] = "IBL"
        m["position"] = i + 1

    # --- Place service trains by ranking ---
    for train in final_service:
        if len(track1) < TRACK_CAPACITY:
            track1.append(train)
        elif len(track2) < TRACK_CAPACITY:
            track2.append(train)
        elif len(track3) < TRACK_CAPACITY:
            track3.append(train)
        else:
            track4.append(train)

    # --- Place standby trains ---
    for train in final_standby:
        if len(track3) < TRACK_CAPACITY:
            track3.append(train)
        else:
            track4.append(train)

    def build_service_output(track_list, track_no):
        for idx, train in enumerate(track_list):

            decision_explanation = (
                f"Cleared all safety checks. "
                f"Mileage: {train['mileage']} km (maintenance risk band considered). "
                f"Branding contract pressure influenced selection (urgency score: {train['branding']}). "
                f"AI Predicted Failure Risk: {train['ai_risk']}. "
                f"Composite score: {train['score']}. "
                f"Selected for service due to highest operational suitability."
            )

            parking_explanation = (
                f"Track {track_no}, Position {idx+1}. "
                f"Estimated shunting moves: {idx}."
            )

            service.append({
                "train": train["train"],
                "score": train["score"],
                "track": track_no,
                "position": idx + 1,
                "shunting_moves": idx,
                "why": decision_explanation,
                "parking": parking_explanation
            })

    def build_standby_output(track_list, track_no):
        for idx, train in enumerate(track_list):

            if train.get("forced", False):
                decision_explanation = (
                    f"Cleared all safety checks. "
                    f"Supervisor forced standby override applied."
                )
            else:
                decision_explanation = (
                    f"Cleared all safety checks. "
                    f"Mileage: {train['mileage']} km. "
                    f"Branding contract pressure score : {train['branding']}. "
                    f"Composite score: {train['score']}. "
                    f"Assigned to standby based on ranking."
                )

            parking_explanation = (
                f"Track {track_no}, Position {idx+1}. "
                f"Estimated shunting moves: {idx}."
            )

            standby.append({
                "train": train["train"],
                "score": train["score"],
                "track": track_no,
                "position": idx + 1,
                "shunting_moves": idx,
                "why": decision_explanation,
                "parking": parking_explanation
            })

    global LAST_DEPOT_LAYOUT
    LAST_DEPOT_LAYOUT = {
        "track1": [t["train"] for t in track1],
        "track2": [t["train"] for t in track2],
        "track3": [t["train"] for t in track3],
        "track4": [t["train"] for t in track4],
        "inspection": [m["train"] for m in maintenance]
    }

    build_service_output(track1, 1)
    build_service_output(track2, 2)

    build_standby_output(track3, 3)
    build_standby_output(track4, 4)

    return {
        "service": service,
        "standby": standby,
        "maintenance": maintenance
    }

def decision_breakdown(train):

    SAFE_ZONE = 20000
    CAUTION_ZONE = 26000
    CRITICAL_ZONE = 29000
    HARD_MAINTENANCE_LIMIT = 30000

    m = train.mileage

    if m < SAFE_ZONE:
        mileage_factor = 1.0
    elif m < CAUTION_ZONE:
        mileage_factor = 0.75
    elif m < CRITICAL_ZONE:
        mileage_factor = 0.4
    elif m < HARD_MAINTENANCE_LIMIT:
        mileage_factor = 0.15
    else:
        mileage_factor = 0

    cleanliness_penalty = 0
    if train.days_since_cleaning >= 9:
        cleanliness_penalty = 0.25
    elif train.days_since_cleaning >= 6:
        cleanliness_penalty = 0.15
    elif train.days_since_cleaning >= 3:
        cleanliness_penalty = 0.05

    branding_flag = train.is_branded

    return {
        "mileage_factor": mileage_factor,
        "cleanliness_penalty": cleanliness_penalty,
        "branding_active": branding_flag
    }