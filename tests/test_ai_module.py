import os
import unittest
from pathlib import Path
from app import app

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "datasets"

class TestAIIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = app.test_client()
        cls.MODEL_DIR = MODEL_DIR
        cls.DATA_DIR = DATA_DIR
        cls.MODEL_DIR.mkdir(exist_ok=True)
        from ai_module.freshness import train_freshness_model
        from ai_module.waste import train_waste_model
        from ai_module.ngo import save_ngo_data

        train_freshness_model(str(cls.DATA_DIR / "freshness_data.csv"), model_path=str(cls.MODEL_DIR / "freshness_model.pkl"), encoder_path=str(cls.MODEL_DIR / "freshness_encoder.pkl"))
        train_waste_model(str(cls.DATA_DIR / "waste_data.csv"), model_path=str(cls.MODEL_DIR / "waste_model.pkl"), encoder_path=str(cls.MODEL_DIR / "waste_encoder.pkl"))
        save_ngo_data(str(cls.DATA_DIR / "ngo_data.csv"), output_path=str(cls.MODEL_DIR / "ngo_data.pkl"))

    def test_predict_freshness_endpoint(self):
        response = self.client.post("/predict-freshness", json={
            "food_type": "vegetables",
            "cooked_hours_ago": 2,
            "temperature_c": 22,
            "humidity": 55,
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn(response.get_json()["freshness_prediction"], ["fresh", "spoiled"])

    def test_predict_waste_endpoint(self):
        response = self.client.post("/predict-waste", json={
            "event_type": "wedding",
            "guest_count": 120,
            "food_prepared_kg": 40,
        })
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.get_json()["expected_waste_kg"], float)

    def test_recommend_ngo_endpoint(self):
        response = self.client.post("/recommend-ngo", json={
            "donor_latitude": 12.9716,
            "donor_longitude": 77.5946,
            "urgency_level": "medium",
        })
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.get_json()["recommendations"], list)

    def test_predict_all_endpoint(self):
        response = self.client.post("/predict-all", json={
            "food_type": "fruits",
            "cooked_hours_ago": 1,
            "temperature_c": 20,
            "humidity": 45,
            "event_type": "party",
            "guest_count": 70,
            "food_prepared_kg": 20,
            "donor_latitude": 12.9716,
            "donor_longitude": 77.5946,
            "urgency_level": "low",
        })
        json_data = response.get_json()
        self.assertEqual(response.status_code, 200)
        self.assertIn("freshness_prediction", json_data)
        self.assertIn("expected_waste_kg", json_data)
        self.assertIn("ngo_recommendations", json_data)

if __name__ == "__main__":
    unittest.main()
