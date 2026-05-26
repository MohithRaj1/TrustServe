import os
import joblib
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from .data import load_freshness_data, FOOD_TYPE_MAPPING

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_FILE = os.path.join(BASE_DIR, "..", "models", "freshness_model.pkl")
ENCODER_FILE = os.path.join(BASE_DIR, "..", "models", "freshness_encoder.pkl")


def train_freshness_model(csv_path, model_path=MODEL_FILE, encoder_path=ENCODER_FILE):
    X, y = load_freshness_data(csv_path)
    model = DecisionTreeClassifier(random_state=42)
    model.fit(X, y)
    joblib.dump(model, model_path)
    joblib.dump(FOOD_TYPE_MAPPING, encoder_path)
    return model


def load_freshness_model(model_path=MODEL_FILE, encoder_path=ENCODER_FILE):
    model = joblib.load(model_path)
    encoder = joblib.load(encoder_path)
    return model, encoder


def predict_freshness(food_type, cooked_hours_ago, temperature_c, humidity, model=None, encoder=None):
    if model is None or encoder is None:
        model, encoder = load_freshness_model()
    food_encoded = encoder.get(str(food_type).lower(), 0)
    X = pd.DataFrame([
        [food_encoded, float(cooked_hours_ago), float(temperature_c), float(humidity)]
    ], columns=["food_type_encoded", "cooked_hours_ago", "temperature_c", "humidity"])
    prediction = model.predict(X)[0]
    return "fresh" if int(prediction) == 1 else "spoiled"
