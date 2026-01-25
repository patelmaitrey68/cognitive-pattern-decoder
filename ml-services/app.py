# from flask import Flask, request, jsonify
# from predict import predict_user

# app = Flask(__name__)

# @app.route("/predict", methods=["POST"])
# def predict():
#     data = request.json

#     cluster = predict_user(data)

#     meanings = {
#         0: "Fast & confident coder",
#         1: "Careful problem solver",
#         2: "Debugging / copy-paste style"
#     }

#     return jsonify({
#         "cluster": cluster,
#         "behaviorType": meanings.get(cluster, "Unknown")
#     })

# if __name__ == "__main__":
#     app.run(port=5001)
import numpy as np
import joblib
from flask import jsonify
from sklearn.preprocessing import StandardScaler  # only if needed

model = joblib.load("model.pkl")
scaler = joblib.load("scaler.pkl")  # if you saved one

from fastapi import FastAPI
from predict import predict_user

app = FastAPI()


@app.get("/")
def root():
    return {"message": "ML Service is running 🚀"}


@app.route('/predict', methods=['POST'])
def predict():
    data = request.json

    # Match BACKEND field names
    features = [
        data.get("typingSpeed", 0),
        data.get("typedChars", 0),
        data.get("backspaceCount", 0),
        data.get("pasteCount", 0),
        data.get("avgPauseTime", 0),
        data.get("sessionTime", 0)
    ]

    X = np.array([features])
    X_scaled = scaler.transform(X)
    cluster = model.predict(X_scaled)[0]

    return jsonify({
        "cluster": int(cluster)
    })

