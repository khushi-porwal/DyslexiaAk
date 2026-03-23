import base64
import io
import numpy as np
from PIL import Image


def preprocess_base64_image(base64_image: str):
    """
    Convert base64 canvas image into model input format.

    Steps:
    1. Decode base64 image
    2. Convert to grayscale
    3. Crop drawing area
    4. Resize to 28x28
    5. Normalize pixels
    6. Add batch & channel dimension

    Returns:
        numpy array of shape (1, 28, 28, 1)
    """

    try:
        if "," in base64_image:
            base64_image = base64_image.split(",")[1]

        image_bytes = base64.b64decode(base64_image)
        image = Image.open(io.BytesIO(image_bytes)).convert("L")
        image = np.array(image)

        # Invert: canvas is black ink on white bg; QuickDraw bitmaps are white ink on black bg
        image = 255 - image

        # Find stroke pixels (now bright on dark background)
        coords = np.column_stack(np.where(image > 20))

        if coords.size > 0:
            y0, x0 = coords.min(axis=0)
            y1, x1 = coords.max(axis=0) + 1
            image = image[y0:y1, x0:x1]

        image = Image.fromarray(image)

        try:
            image = image.resize((28, 28), Image.Resampling.LANCZOS)
        except Exception:
            image = image.resize((28, 28))

        image = np.array(image).astype("float32")
        image = image / 255.0
        image = image.reshape(1, 28, 28, 1)

        return image

    except Exception as e:
        raise ValueError(f"Preprocess Error: {e}") from e
