from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.audio import synthesize_speech
import pandas as pd

CSV_PATH = "backend/data/batch_prediction.csv"
df = pd.read_csv(CSV_PATH)

app = Flask(__name__)
CORS(app)

@app.route("/synthesize", methods=["POST"])
def synthesize():
    data = request.json
    text = data.get("text", "")
    
    if not text:
        return jsonify({"error": "Texto not found"}), 400

    try:
        audio_content = synthesize_speech(text)
        return jsonify({"audio": f"data:audio/mp3;base64,{audio_content}"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get_event", methods=["GET"])
def predict_event():
    batter_season = request.args.get("batter_season")
    batter_id = request.args.get("batter_id")
    pitcher_season = request.args.get("pitcher_season")
    pitcher_id = request.args.get("pitcher_id")

    if not all([batter_season, batter_id, pitcher_season, pitcher_id]):
        return jsonify({"error": "You missed some parameters"}), 400

    filtered_df = df[
        (df["batter_season"] == int(batter_season)) &
        (df["batter_id"] == int(batter_id)) &
        (df["pitcher_season"] == int(pitcher_season)) &
        (df["pitcher_id"] == int(pitcher_id))
    ]

    if filtered_df.empty:
        return jsonify({"error": "No coincidences"}), 404

    event_type = filtered_df.iloc[0]["event_type"]
    return jsonify({"event_type": event_type})

@app.route("/get_play_events", methods=["GET"])
def get_play_events():
    batter_season = request.args.get("batter_season")
    batter_id = request.args.get("batter_id")
    pitcher_season = request.args.get("pitcher_season")
    pitcher_id = request.args.get("pitcher_id")

    if not all([batter_season, batter_id, pitcher_season, pitcher_id]):
        return jsonify({"error": "You missed some parameters"}), 400

    filtered_df = df[
        (df["batter_season"] == int(batter_season)) &
        (df["batter_id"] == int(batter_id)) &
        (df["pitcher_season"] == int(pitcher_season)) &
        (df["pitcher_id"] == int(pitcher_id))
    ]

    if filtered_df.empty:
        return jsonify({"error": "No coincidences"}), 404

    play_events = filtered_df.iloc[0]["play_events"]
    return jsonify({"play_events": play_events})

if __name__ == "__main__":
    app.run(port=5000, debug=True)
