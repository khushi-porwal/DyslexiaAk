import base64
import io
import numpy as np
from PIL import Image

def preprocess_base64_image(base64_image: str):
    # Remove base64 header if present
    if "," in base64_image:
        base64_image = base64_image.split(",")[1]

    # Decode base64
    image_bytes = base64.b64decode(base64_image)

    # Load image
    image = Image.open(io.BytesIO(image_bytes)).convert("L")

    # Resize to 28x28
    image = image.resize((28, 28))

    # Convert to numpy
    image = np.array(image, dtype=np.float32)

    # Normalize
    image /= 255.0

    # ✅ IMPORTANT: add ONLY ONE channel + batch
    image = image.reshape(1, 28, 28, 1)

    return image