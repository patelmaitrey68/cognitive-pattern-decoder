from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI()

# Load model
model = joblib.load("model/model.pkl")

class SessionInput(BaseModel):
    typingSpeed: float
    typedChars: float
    backspaceCount: float
    pasteCount: float
    avgPauseTime: float
    sessionTime: float


@app.get("/")
def root():
    return {"message": "ML Service is running 🚀"}


@app.post("/predict")
def predict(data: SessionInput):
    try:
        input_array = np.array([[
            data.typingSpeed,
            data.typedChars,
            data.backspaceCount,
            data.pasteCount,
            data.avgPauseTime,
            data.sessionTime
        ]])

        prediction = model.predict(input_array)

        return {"cluster": int(prediction[0])}

    except Exception as e:
        return {"error": str(e)}
