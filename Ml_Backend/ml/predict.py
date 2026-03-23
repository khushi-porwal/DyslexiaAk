# import tensorflow as tf
# import numpy as np
# from ml.preprocess import preprocess_base64_image
# import os

# # -----------------------------
# # Load model ONCE
# # -----------------------------
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# MODEL_PATH = os.path.join(BASE_DIR, "model", "quickdraw_model.h5")
# LABELS_PATH = os.path.join(BASE_DIR, "labels.txt")

# model = tf.keras.models.load_model(MODEL_PATH)

# # Load labels
# with open(LABELS_PATH, "r") as f:
#     LABELS = [line.strip() for line in f.readlines()]

# # -----------------------------
# # Prediction function
# # -----------------------------
# def predict_drawing(base64_image: str, threshold: float = 0.75):
#     """
#     Args:
#         base64_image (str): base64 string from frontend canvas
#         threshold (float): confidence threshold

#     Returns:
#         dict
#     """

#     # Preprocess image (already shape = (1, 28, 28, 1))
#     image = preprocess_base64_image(base64_image)

#     # Predict
#     predictions = model.predict(image, verbose=0)[0]
#     confidence = float(np.max(predictions))
#     class_index = int(np.argmax(predictions))
#     label = LABELS[class_index]

#     # Confidence check
#     if confidence < threshold:
#         return {
#             "success": False,
#             "message": "Drawing not clear enough",
#             "confidence": round(confidence, 3),
#         }

#     return {
#         "success": True,
#         "prediction": label,
#         "confidence": round(confidence, 3),
#     }







import os

import numpy as np
import tensorflow as tf
from ml.preprocess import preprocess_base64_image

# -----------------------------
# Paths
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "model", "quickdraw_model.h5")
LABELS_PATH = os.path.join(BASE_DIR, "labels.txt")

# Allow tuning without code changes (used only to flag low confidence; no blocking)
DEFAULT_THRESHOLD = float(os.getenv("PREDICT_THRESHOLD", "0.2"))

# -----------------------------
# Load model once
# -----------------------------
try:
    model = tf.keras.models.load_model(MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Error loading model: {e}")

# -----------------------------
# Load labels
# -----------------------------
try:
    with open(LABELS_PATH, "r") as f:
        LABELS = [line.strip() for line in f.readlines()]
except Exception as e:
    raise RuntimeError(f"Error loading labels: {e}")

# -----------------------------
# Prediction function
# -----------------------------
def predict_drawing(base64_image: str, threshold: float = DEFAULT_THRESHOLD):
    """
    Predict drawing from base64 image.

    Args:
        base64_image (str): Base64 string from frontend canvas
        threshold (float): Minimum confidence threshold

    Returns:
        dict
    """

    try:
        # Preprocess image
        image = preprocess_base64_image(base64_image)

        # Run model prediction
        predictions = model.predict(image, verbose=0)[0]

        confidence = float(np.max(predictions))
        class_index = int(np.argmax(predictions))

        # Safety check
        if class_index >= len(LABELS):
            return {
                "success": False,
                "message": "Label index out of range",
                "confidence": 0,
            }

        label = LABELS[class_index]

        return {
            "success": True,
            "prediction": label,
            "confidence": round(confidence, 3),
            "lowConfidence": confidence < threshold,
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e),
            "confidence": 0,
        }








