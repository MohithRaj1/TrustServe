import os
from ai_module.waste import train_waste_model

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "datasets", "waste_data.csv")
MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "waste_model.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "..", "models", "waste_encoder.pkl")

if __name__ == "__main__":
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    model = train_waste_model(DATA_PATH, model_path=MODEL_PATH, encoder_path=ENCODER_PATH)
    print("Waste prediction model trained and saved to:")
    print(f"  - {MODEL_PATH}")
    print(f"  - {ENCODER_PATH}")
