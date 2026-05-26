import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from ai_module.freshness import predict_freshness, load_freshness_model
from ai_module.waste import predict_waste, load_waste_model
from ai_module.ngo import recommend_ngo, load_ngo_data
from ai_module.image_freshness import predict_image_freshness

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__)
CORS(app)

MODEL_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "datasets")

@app.route("/predict-freshness", methods=["POST"])
def freshness_endpoint():
    data = request.get_json(force=True)
    required = ["food_type", "cooked_hours_ago", "temperature_c", "humidity"]
    if not all(key in data for key in required):
        return jsonify({"error": "Missing one or more required keys: food_type, cooked_hours_ago, temperature_c, humidity"}), 400
    prediction = predict_freshness(
        data["food_type"],
        data["cooked_hours_ago"],
        data["temperature_c"],
        data["humidity"],
    )
    return jsonify({"freshness_prediction": prediction})

@app.route("/predict-waste", methods=["POST"])
def waste_endpoint():
    data = request.get_json(force=True)
    required = ["event_type", "guest_count", "food_prepared_kg"]
    if not all(key in data for key in required):
        return jsonify({"error": "Missing one or more required keys: event_type, guest_count, food_prepared_kg"}), 400
    prediction = predict_waste(
        data["event_type"],
        data["guest_count"],
        data["food_prepared_kg"],
    )
    return jsonify({"expected_waste_kg": round(prediction, 2)})

@app.route("/recommend-ngo", methods=["POST"])
def ngo_endpoint():
    data = request.get_json(force=True)
    required = ["donor_latitude", "donor_longitude", "urgency_level"]
    if not all(key in data for key in required):
        return jsonify({"error": "Missing one or more required keys: donor_latitude, donor_longitude, urgency_level"}), 400
    recommendations = recommend_ngo(
        data["donor_latitude"],
        data["donor_longitude"],
        data["urgency_level"],
    )
    return jsonify({"recommendations": recommendations})

@app.route("/predict-all", methods=["POST"])
def predict_all_endpoint():
    data = request.get_json(force=True)
    freshness = predict_freshness(
        data.get("food_type"),
        data.get("cooked_hours_ago"),
        data.get("temperature_c"),
        data.get("humidity"),
    )
    waste = predict_waste(
        data.get("event_type"),
        data.get("guest_count"),
        data.get("food_prepared_kg"),
    )
    recommendations = recommend_ngo(
        data.get("donor_latitude"),
        data.get("donor_longitude"),
        data.get("urgency_level"),
    )
    return jsonify({
        "freshness_prediction": freshness,
        "expected_waste_kg": round(waste, 2),
        "ngo_recommendations": recommendations,
    })

@app.route("/predict-image-freshness", methods=["POST"])
def image_freshness_endpoint():
    if "image_path" not in request.json:
        return jsonify({"error": "Missing required key: image_path"}), 400
    image_path = request.json["image_path"]
    try:
        prediction = predict_image_freshness(image_path)
        return jsonify({"image_freshness_prediction": prediction})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005, debug=True)
