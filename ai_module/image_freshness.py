import os

try:
    import cv2
    import numpy as np
except ImportError:
    cv2 = None
    np = None


def predict_image_freshness(image_path):
    if cv2 is None or np is None:
        raise ImportError("opencv-python is required for image freshness detection")
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError("Unable to read image file")
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    saturation = np.mean(hsv[:, :, 1])
    brightness = np.mean(hsv[:, :, 2])
    green_mask = cv2.inRange(hsv, (25, 40, 40), (95, 255, 255))
    green_ratio = np.sum(green_mask > 0) / float(image.shape[0] * image.shape[1])
    if green_ratio > 0.08 and saturation > 50 and brightness > 70:
        return "fresh"
    return "spoiled"
