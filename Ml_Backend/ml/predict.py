import tensorflow as tf
import numpy as np
from ml.preprocess import preprocess_base64_image
import os

# -----------------------------
# Load model ONCE
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "model", "quickdraw_model.h5")
LABELS_PATH = os.path.join(BASE_DIR, "labels.txt")

model = tf.keras.models.load_model(MODEL_PATH)

# Load labels
with open(LABELS_PATH, "r") as f:
    LABELS = [line.strip() for line in f.readlines()]

# -----------------------------
# Prediction function
# -----------------------------
def predict_drawing(base64_image: str, threshold: float = 0.75):
    """
    Args:
        base64_image (str): base64 string from frontend canvas
        threshold (float): confidence threshold

    Returns:
        dict
    """

    # Preprocess image (already shape = (1, 28, 28, 1))
    image = preprocess_base64_image(base64_image)

    # Predict
    predictions = model.predict(image, verbose=0)[0]
    confidence = float(np.max(predictions))
    class_index = int(np.argmax(predictions))
    label = LABELS[class_index]

    # Confidence check
    if confidence < threshold:
        return {
            "success": False,
            "message": "Drawing not clear enough",
            "confidence": round(confidence, 3),
        }

    return {
        "success": True,
        "prediction": label,
        "confidence": round(confidence, 3),
    }