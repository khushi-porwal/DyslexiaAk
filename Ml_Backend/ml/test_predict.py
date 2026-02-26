from predict import predict_drawing

with open("sample_base64.txt") as f:
    b64 = f.read()

result = predict_drawing(b64)
print(result)