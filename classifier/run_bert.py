# bert_service/run_bert.py
import os
import time
from flask import Flask, request, jsonify
import torch
import numpy as np
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from datetime import datetime
import pytz

# Config
BERT_MODEL_DIR = os.environ.get("BERT_MODEL_DIR", "./bert_malicious_safe_model")
PORT = int(os.environ.get("BERT_PORT", 5002))
MAX_LENGTH = int(os.environ.get("BERT_MAX_LENGTH", 128))
BATCH_SIZE = int(os.environ.get("BERT_BATCH_SIZE", 8))
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
TIMEZONE = os.environ.get("TZ_NAME", "Asia/Kolkata")

if not os.path.exists(BERT_MODEL_DIR):
    print(f"[WARN] BERT model dir '{BERT_MODEL_DIR}' not found locally; transformers may try remote hub.")

tokenizer = AutoTokenizer.from_pretrained(BERT_MODEL_DIR)
model = AutoModelForSequenceClassification.from_pretrained(BERT_MODEL_DIR)
model.to(DEVICE)
model.eval()

# id2label mapping
id2label = {}
if hasattr(model.config, "id2label") and model.config.id2label:
    try:
        id2label = {int(k): v for k, v in model.config.id2label.items()}
    except Exception:
        id2label = model.config.id2label
if not id2label:
    id2label = {i: f"LABEL_{i}" for i in range(model.config.num_labels)}

app = Flask(__name__)
tz = pytz.timezone(TIMEZONE)

def now_iso_tz():
    return datetime.now(tz).isoformat()

def predict_texts(texts):
    enc = tokenizer(texts, truncation=True, padding=True, max_length=MAX_LENGTH, return_tensors="pt")
    enc = {k: v.to(DEVICE) for k, v in enc.items()}
    with torch.no_grad():
        outputs = model(**enc)
        logits = outputs.logits
        probs = F.softmax(logits, dim=-1).cpu().numpy()
    results = []
    for p in probs:
        top_idx = int(np.argmax(p))
        top_score = float(p[top_idx])
        label_name = id2label.get(top_idx, f"LABEL_{top_idx}")
        probs_map = {id2label.get(i, f"LABEL_{i}"): float(prob) for i, prob in enumerate(p)}
        decision = "safe" if str(label_name).lower() == "safe" else "malicious"
        results.append({
            "label": label_name,
            "confidence": round(top_score, 6),
            "decision": decision,
            "all_probs": probs_map
        })
    return results

@app.route("/predict", methods=["POST"])
def predict():
    start = time.time()
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON payload"}), 400
    text = data.get("text") or data.get("message")
    if not text or not isinstance(text, str) or text.strip() == "":
        return jsonify({"error": "Missing 'text' or 'message' field"}), 400

    res = predict_texts([text])[0]

    end = time.time()
    resp_time_ms = round((end - start) * 1000, 3)

    payload = {
        "timestamp": now_iso_tz(),
        "response_time_ms": resp_time_ms,
        "source": "bert",
        "label": res["label"],
        "confidence": res["confidence"],
        "decision": res["decision"],
        "all_probs": res["all_probs"],
        "meta": {
            "model_dir": BERT_MODEL_DIR,
            "id2label_example": dict(list(id2label.items())[:10])
        }
    }
    return jsonify(payload), 200


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "device": DEVICE,
        "model_dir": BERT_MODEL_DIR,
        "id2label_example": dict(list(id2label.items())[:10])
    }), 200

if __name__ == "__main__":
    print(f"[START] BERT service starting on port {PORT} (device={DEVICE})")
    app.run(host="0.0.0.0", port=PORT)
