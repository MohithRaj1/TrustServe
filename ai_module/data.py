import pandas as pd
from math import radians, cos, sin, asin, sqrt

FOOD_TYPE_MAPPING = {
    "vegetables": 0,
    "fruits": 1,
    "dairy": 2,
    "grains": 3,
    "meat": 4,
    "bakery": 5,
}

EVENT_TYPE_MAPPING = {
    "wedding": 0,
    "party": 1,
    "hotel": 2,
    "home_function": 3,
}

FRESHNESS_LABEL = {
    "spoiled": 0,
    "fresh": 1,
}


def encode_food_type(food_type):
    return FOOD_TYPE_MAPPING.get(str(food_type).lower(), 0)


def encode_event_type(event_type):
    return EVENT_TYPE_MAPPING.get(str(event_type).lower(), 0)


def encode_freshness_label(label):
    return FRESHNESS_LABEL.get(str(label).lower(), 0)


def load_freshness_data(csv_path):
    df = pd.read_csv(csv_path)
    df["food_type_encoded"] = df["food_type"].apply(encode_food_type)
    df["freshness_encoded"] = df["freshness"].apply(encode_freshness_label)
    X = df[["food_type_encoded", "cooked_hours_ago", "temperature_c", "humidity"]]
    y = df["freshness_encoded"]
    return X, y


def load_waste_data(csv_path):
    df = pd.read_csv(csv_path)
    df["event_type_encoded"] = df["event_type"].apply(encode_event_type)
    X = df[["event_type_encoded", "guest_count", "food_prepared_kg"]]
    y = df["waste_quantity_kg"]
    return X, y


def load_ngo_data(csv_path):
    return pd.read_csv(csv_path)


def haversine_distance(lat1, lon1, lat2, lon2):
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    km = 6371 * c
    return km
