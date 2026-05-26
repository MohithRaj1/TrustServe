import os
from ai_module.ngo import save_ngo_data

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "datasets", "ngo_data.csv")
PICKLE_PATH = os.path.join(BASE_DIR, "..", "models", "ngo_data.pkl")

if __name__ == "__main__":
    os.makedirs(os.path.dirname(PICKLE_PATH), exist_ok=True)
    df = save_ngo_data(DATA_PATH, PICKLE_PATH)
    print("NGO dataset saved to:")
    print(f"  - {PICKLE_PATH}")
    print(f"Loaded {len(df)} NGO records.")
