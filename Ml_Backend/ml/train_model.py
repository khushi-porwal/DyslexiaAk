import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
import os

DATA_PATH = "ml/data"

classes = ["apple", "banana", "circle"]

X = []
y = []

for i, label in enumerate(classes):
    data = np.load(os.path.join(DATA_PATH, f"{label}.npy"))

    data = data[:20000]
    X.append(data)
    y.append(np.full(len(data), i))

X = np.concatenate(X)
y = np.concatenate(y)

X = X.reshape(-1, 28, 28, 1) / 255.0

perm = np.random.permutation(len(X))
X = X[perm]
y = y[perm]

model = models.Sequential([
    layers.Conv2D(32, (3,3), activation="relu", input_shape=(28,28,1)),
    layers.MaxPooling2D(),
    layers.Conv2D(64, (3,3), activation="relu"),
    layers.MaxPooling2D(),
    layers.Flatten(),
    layers.Dense(128, activation="relu"),
    layers.Dense(len(classes), activation="softmax")
])

model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

model.fit(X, y, epochs=5, batch_size=64, validation_split=0.1)

model.save("ml/model/quickdraw_model.h5")