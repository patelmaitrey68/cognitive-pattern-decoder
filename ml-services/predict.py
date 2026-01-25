import joblib
import pandas as pd
from preprocess import preprocess_data

model = joblib.load("model.pkl")
scaler = joblib.load("scaler.pkl")

def predict_user(session_data):
    # Ensure ALL features exist (fill missing with 0)
    required_columns = [
        "typingSpeed",
        "typedChars",
        "backspaceCount",
        "pasteCount",
        "pasteCharacters",
        "saveCount",
        "fileSwitchCount",
        "cursorMoveCount",
        "avgPauseTime",
        "sessionTime"
    ]

    for col in required_columns:
        if col not in session_data:
            session_data[col] = 0

    df = pd.DataFrame([session_data])
    X = preprocess_data(df)
    X_scaled = scaler.transform(X)

    cluster = model.predict(X_scaled)[0]
    return int(cluster)
