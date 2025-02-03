from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.audio import synthesize_speech

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

if __name__ == "__main__":
    app.run(port=5000, debug=True)
