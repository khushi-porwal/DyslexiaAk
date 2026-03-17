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
    try:
        result = predict_drawing(req.image)
    except Exception as e:
        return {
            "success": False,
            "correct": False,
            "score": 0,
            "confidence": 0,
            "message": str(e) or "Image processing failed",
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
        "lowConfidence": result.get("lowConfidence", False),
    }













# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# from ml.predict import predict_drawing

# app = FastAPI(title="Dyslexia Drawing ML API", version="1.0")


# # -------------------------
# # Request Schema
# # -------------------------
# class DrawingRequest(BaseModel):
#     image: str
#     target: str


# # -------------------------
# # Health Check Route
# # -------------------------
# @app.get("/")
# def root():
#     return {"message": "Dyslexia Drawing ML API is running"}


# # -------------------------
# # Prediction Route
# # -------------------------
# @app.post("/predict")
# def predict(req: DrawingRequest):

#     try:

#         # Run prediction
#         result = predict_drawing(req.image)

#         if not result["success"]:
#             return {
#                 "success": False,
#                 "correct": False,
#                 "score": 0,
#                 "confidence": result.get("confidence", 0),
#                 "message": result.get("message", "Prediction failed")
#             }

#         predicted = result["prediction"]
#         expected = req.target

#         correct = predicted == expected

#         return {
#             "success": True,
#             "predicted": predicted,
#             "expected": expected,
#             "correct": correct,
#             "score": 1 if correct else 0,
#             "confidence": result["confidence"]
#         }

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
