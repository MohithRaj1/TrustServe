import os
import joblib
import pandas as pd
from .data import load_ngo_data, haversine_distance

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "..", "datasets", "ngo_data.csv")
NGO_PICKLE = os.path.join(BASE_DIR, "..", "models", "ngo_data.pkl")


def save_ngo_data(csv_path=DATA_FILE, output_path=NGO_PICKLE):
    df = load_ngo_csv(csv_path)
    joblib.dump(df, output_path)
    return df


def load_ngo_csv(csv_path=DATA_FILE):
    return load_ngo_data_frame(csv_path)


def load_ngo_data(pickle_path=NGO_PICKLE, fallback_csv=DATA_FILE):
    try:
        return joblib.load(pickle_path)
    except Exception:
        return load_ngo_csv(fallback_csv)


def load_ngo_data_frame(csv_path=DATA_FILE):
    return pd.read_csv(csv_path)


def recommend_ngo(donor_latitude, donor_longitude, urgency_level, max_distance_km=15, ngo_df=None):
    if ngo_df is None:
        ngo_df = load_ngo_data()
    urgency_level = str(urgency_level).lower()
    results = []
    for _, row in ngo_df.iterrows():
        supported = str(row.get("urgency_level_supported", "low")).lower()
        if supported not in [urgency_level, "high"] and urgency_level == "high":
            continue
        distance = haversine_distance(
            float(donor_latitude), float(donor_longitude),
            float(row["latitude"]), float(row["longitude"]),
        )
        if distance > max_distance_km or distance > float(row.get("service_radius_km", max_distance_km)):
            continue
        available_capacity = int(row["capacity"] - row["current_load"])
        score = available_capacity - distance * 2
        if score >= 0:
            results.append({
                "ngo_name": row["ngo_name"],
                "ngo_type": row["ngo_type"],
                "distance_km": round(distance, 2),
                "available_capacity": available_capacity,
                "urgency_level_supported": row["urgency_level_supported"],
                "score": round(score, 2),
            })
    sorted_results = sorted(results, key=lambda item: (item["score"], item["distance_km"]), reverse=True)
    return sorted_results[:3]
