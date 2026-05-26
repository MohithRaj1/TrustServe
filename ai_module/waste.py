import os
import joblib
import pandas as pd
from sklearn.linear_model import LinearRegression
from .data import load_waste_data, EVENT_TYPE_MAPPING

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_FILE = os.path.join(BASE_DIR, "..", "models", "waste_model.pkl")
ENCODER_FILE = os.path.join(BASE_DIR, "..", "models", "waste_encoder.pkl")


def train_waste_model(csv_path, model_path=MODEL_FILE, encoder_path=ENCODER_FILE):
    X, y = load_waste_data(csv_path)
    model = LinearRegression()
    model.fit(X, y)
    joblib.dump(model, model_path)
    joblib.dump(EVENT_TYPE_MAPPING, encoder_path)
    return model


def load_waste_model(model_path=MODEL_FILE, encoder_path=ENCODER_FILE):
    model = joblib.load(model_path)
    encoder = joblib.load(encoder_path)
    return model, encoder


def predict_waste(event_type, guest_count, food_prepared_kg, model=None, encoder=None):
    if model is None or encoder is None:
        model, encoder = load_waste_model()
    event_encoded = encoder.get(str(event_type).lower(), 0)
    X = pd.DataFrame([
        [event_encoded, float(guest_count), float(food_prepared_kg)]
    ], columns=["event_type_encoded", "guest_count", "food_prepared_kg"])
    prediction = model.predict(X)[0]
    return float(prediction)
