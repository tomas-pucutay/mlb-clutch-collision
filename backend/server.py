from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.audio import synthesize_speech
from utils.langchain import create_story
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

@app.route("/generate_story", methods=["POST"])
def generate_story():
    data = request.json

    event = data.get("event", ""),
    batter_name = data.get("batter_name", ""),
    batter_season = data.get("batter_season", ""),
    pitcher_name = data.get("pitcher_name", ""),
    pitcher_season = data.get("pitcher_season", ""),
    user_choice = data.get("user_choice", "")

    if not event:
        return jsonify({"error": "Text is required"}), 400

    try:
        story = create_story(
            event=event,
            batter_name=batter_name,
            batter_season=batter_season,
            pitcher_name=pitcher_name,
            pitcher_season=pitcher_season,
            user_choice=user_choice
            )
        return jsonify({"story": story})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)
