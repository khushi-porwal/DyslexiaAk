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
        # Defensive: ensure we got a dict
        if not isinstance(result, dict):
            return {
                "success": False,
                "correct": False,
                "score": 0,
                "confidence": 0,
                "message": "Prediction service returned invalid response",
            }

        # Handle model/reporting errors before accessing prediction fields
        if not result.get("success"):
            return {
                "success": False,
                "correct": False,
                "score": 0,
                "confidence": result.get("confidence", 0),
                "message": result.get("message", "Prediction failed"),
            }

        predicted = result.get("prediction")
        if predicted is None:
            return {
                "success": False,
                "correct": False,
                "score": 0,
                "confidence": result.get("confidence", 0),
                "message": "Prediction missing",
            }

        correct = predicted == req.target

        return {
            "success": True,
            "predicted": predicted,
            "expected": req.target,
            "correct": correct,
            "score": 1 if correct else 0,
            "confidence": result.get("confidence", 0),
            "lowConfidence": result.get("lowConfidence", False),
        }

    except Exception as e:
        # Catch-all to avoid 500s and bubble the error back to client
        return {
            "success": False,
            "correct": False,
            "score": 0,
            "confidence": 0,
            "message": str(e) or "Unexpected error",
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
