# logistic_service/run_logistic.py
import os
import time
from flask import Flask, request, jsonify
import joblib
import numpy as np
from datetime import datetime
import pytz

# Config
MODEL_BUNDLE_PATH = os.environ.get("LOGREG_JOBLIB_PATH", "./logreg_safe_malicious.joblib")
PORT = int(os.environ.get("LOGREG_PORT", 5001))
TIMEZONE = os.environ.get("TZ_NAME", "Asia/Kolkata")  # use Asia/Kolkata for timestamps

# Load bundle
if not os.path.exists(MODEL_BUNDLE_PATH):
    raise FileNotFoundError(f"Logistic joblib not found at: {MODEL_BUNDLE_PATH}")

bundle = joblib.load(MODEL_BUNDLE_PATH)
for k in ("model", "vectorizer", "label_encoder"):
    if k not in bundle:
        raise RuntimeError(f"Missing '{k}' in joblib bundle. Expected keys: model, vectorizer, label_encoder")

logreg_clf = bundle["model"]
tfidf = bundle["vectorizer"]
label_encoder = bundle["label_encoder"]
logreg_classes = list(label_encoder.classes_)

app = Flask(__name__)

tz = pytz.timezone(TIMEZONE)

def now_iso_tz():
    return datetime.now(tz).isoformat()

def predict_proba(texts):
    X = tfidf.transform([t if t is not None else "" for t in texts])
    probas = logreg_clf.predict_proba(X)  # shape (n, n_classes)
    return probas

@app.route("/predict", methods=["POST"])
def predict():
    start = time.time()
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON payload"}), 400
    text = data.get("text") or data.get("message")
    if not text or not isinstance(text, str) or text.strip() == "":
        return jsonify({"error": "Missing 'text' or 'message' field"}), 400

    probas = predict_proba([text])[0]
    sorted_idx = np.argsort(probas)[::-1]
    top_idx = int(sorted_idx[0])
    top_label = logreg_classes[top_idx]
    top_conf = float(probas[top_idx])
    probs_map = {cls: float(prob) for cls, prob in zip(logreg_classes, probas)}
    decision = "safe" if str(top_label).lower() == "safe" else "malicious"

    end = time.time()
    resp_time_ms = round((end - start) * 1000, 3)

    payload = {
        "timestamp": now_iso_tz(),
        "response_time_ms": resp_time_ms,
        "source": "logistic",
        "label": top_label,
        "confidence": round(top_conf, 6),
        "decision": decision,
        "all_probs": probs_map,
        "meta": {
            "bundle_path": MODEL_BUNDLE_PATH,
            "classes": logreg_classes
        }
    }
    return jsonify(payload), 200

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "bundle_path": MODEL_BUNDLE_PATH,
        "classes": logreg_classes
    }), 200

if __name__ == "__main__":
    print(f"[START] Logistic service starting on port {PORT}")
    app.run(host="0.0.0.0", port=PORT)
