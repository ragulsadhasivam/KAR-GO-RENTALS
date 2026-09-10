#!/usr/bin/env python3
"""
Removes the background from a vehicle photo and saves a clean transparent PNG.

Usage:
    python3 scripts/process_vehicle_image.py assets/source/baleno.jpg public/vehicles/baleno.png
    python3 scripts/process_vehicle_image.py assets/source/ertiga.jpg public/vehicles/ertiga.png

Designed for studio-style shots: a dark vignette/gradient backdrop with the car
lit up in the middle. Seeds GrabCut with definite-background samples all around
the border (capturing the full light-to-dark range of the gradient) and a
probable-foreground seed in the centre, then cleans/feathers the resulting mask.
"""
import sys
import cv2
import numpy as np


def remove_background(src_path: str, dst_path: str, force_fg_boxes=None):
    img = cv2.imread(src_path, cv2.IMREAD_COLOR)
    if img is None:
        raise SystemExit(f"Could not read image: {src_path}")

    h, w = img.shape[:2]

    mask = np.full((h, w), cv2.GC_PR_BGD, np.uint8)

    border = max(int(min(h, w) * 0.035), 8)
    mask[:border, :] = cv2.GC_BGD
    mask[-border:, :] = cv2.GC_BGD
    mask[:, :border] = cv2.GC_BGD
    mask[:, -border:] = cv2.GC_BGD

    cx0, cx1 = int(w * 0.08), int(w * 0.96)
    cy0, cy1 = int(h * 0.05), int(h * 0.94)
    mask[cy0:cy1, cx0:cx1] = cv2.GC_PR_FGD

    for (x0, y0, x1, y1) in (force_fg_boxes or []):
        mask[y0:y1, x0:x1] = cv2.GC_FGD

    bgd_model = np.zeros((1, 65), np.float64)
    fgd_model = np.zeros((1, 65), np.float64)
    cv2.grabCut(img, mask, None, bgd_model, fgd_model, 8, cv2.GC_INIT_WITH_MASK)

    fg_mask = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_OPEN, kernel, iterations=1)
    fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_CLOSE, kernel, iterations=2)

    contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        areas = sorted((cv2.contourArea(c) for c in contours), reverse=True)
        min_area = max(areas[0] * 0.02, 200) if areas else 200
        keep = [c for c in contours if cv2.contourArea(c) >= min_area]
        clean = np.zeros_like(fg_mask)
        cv2.drawContours(clean, keep, -1, 255, thickness=cv2.FILLED)
        fg_mask = clean

    alpha = cv2.GaussianBlur(fg_mask, (5, 5), 0)

    b, g, r = cv2.split(img)
    rgba = cv2.merge([b, g, r, alpha])

    ys, xs = np.where(alpha > 8)
    if len(xs) and len(ys):
        pad = 14
        x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad, w)
        y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad, h)
        rgba = rgba[y0:y1, x0:x1]

    cv2.imwrite(dst_path, rgba)
    print(f"Saved {dst_path} ({rgba.shape[1]}x{rgba.shape[0]})")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    boxes = []
    for arg in sys.argv[3:]:
        x0, y0, x1, y1 = (int(v) for v in arg.split(","))
        boxes.append((x0, y0, x1, y1))
    remove_background(sys.argv[1], sys.argv[2], boxes)
