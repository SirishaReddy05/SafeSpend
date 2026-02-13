import cv2
import numpy as np


def deskew(binary_img):
    coords = np.column_stack(np.where(binary_img > 0))
    if len(coords) == 0:
        return binary_img

    angle = cv2.minAreaRect(coords)[-1]

    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle

    (h, w) = binary_img.shape[:2]
    center = (w // 2, h // 2)

    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(
        binary_img,
        M,
        (w, h),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REPLICATE
    )
    return rotated


def preprocess_image(image_path, save_path=None):
    img = cv2.imread(image_path)

    if img is None:
        raise ValueError(f"Could not read image: {image_path}")

    # 1) grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 2) denoise
    denoised = cv2.fastNlMeansDenoising(gray, None, 30, 7, 21)

    # 3) sharpen
    kernel = np.array([[0, -1, 0],
                       [-1, 5, -1],
                       [0, -1, 0]])
    sharp = cv2.filter2D(denoised, -1, kernel)

    # 4) adaptive threshold
    thresh = cv2.adaptiveThreshold(
        sharp,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        10
    )

    # 5) deskew
    final = deskew(thresh)

    if save_path:
        cv2.imwrite(save_path, final)

    return final
