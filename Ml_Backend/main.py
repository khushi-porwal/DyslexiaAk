from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from ml.predict import predict_drawing

app = FastAPI(title="Dyslexia Drawing ML API")

# -------------------------
# Request schema
# -------------------------
class DrawingRequest(BaseModel):
    image: str           # base64 image
    target: str          # expected label (apple, banana, etc)

# -------------------------
# Prediction route
# -------------------------
@app.post("/predict")
def predict(req: DrawingRequest):
    result = predict_drawing(req.image)

    if not result["success"]:
        return {
            "success": False,
            "correct": False,
            "score": 0,
            "confidence": result["confidence"],
            "message": result["message"],
        }

    predicted = result["prediction"]
    correct = predicted == req.target

    return {
        "success": True,
        "predicted": predicted,
        "expected": req.target,
        "correct": correct,
        "score": 1 if correct else 0,
        "confidence": result["confidence"],
    }