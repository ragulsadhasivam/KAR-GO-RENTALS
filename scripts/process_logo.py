#!/usr/bin/env python3
"""
Prepares the KAR GO RENTALS logo for use in the app.

This performs NO colour modification of any kind — the original white +
purple artwork is passed through pixel-for-pixel. The only thing generated
is an alpha (transparency) channel so the logo's near-black studio backdrop
drops away cleanly against the app's own dark background, plus tight crops
for the icon-only mark and the full mark+wordmark lockup.

Usage:
    python3 scripts/process_logo.py
"""
import cv2
import numpy as np

SRC = "Logo.png"


def cutout(img):
    """Build an alpha mask that keeps the logo artwork and drops the backdrop,
    without touching a single RGB value of the source image."""
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.int32)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]

    # the purple accent glow is dim in the source (low V) but distinctly
    # saturated/hued, unlike the neutral near-black backdrop — that's what
    # lets us keep it as foreground without ever changing its colour.
    purple_glow = (h >= 95) & (h <= 155) & (s >= 60) & (v >= 8)

    fg_mask = ((v > 58) | purple_glow).astype(np.uint8) * 255

    # the dark backdrop has faint render grain; instead of a morphology
    # cleanup (which would blur crisp chrome edges) we keep only genuinely
    # large shapes (letters / sweeps / glow) and drop every stray speckle.
    n, labels, stats, _ = cv2.connectedComponentsWithStats(fg_mask, connectivity=8)
    clean = np.zeros_like(fg_mask)
    min_area = 220
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] >= min_area:
            clean[labels == i] = 255
    fg_mask = clean

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_CLOSE, kernel, iterations=1)
    alpha = cv2.GaussianBlur(fg_mask, (3, 3), 0)

    b, g, r = cv2.split(img)  # original, untouched colour channels
    return cv2.merge([b, g, r, alpha])


def crop(rgba, y0, y1, x0, x1, pad=16):
    h, w = rgba.shape[:2]
    y0, y1 = max(y0 - pad, 0), min(y1 + pad, h)
    x0, x1 = max(x0 - pad, 0), min(x1 + pad, w)
    return rgba[y0:y1, x0:x1]


def main():
    img = cv2.imread(SRC)
    rgba = cutout(img)

    icon = crop(rgba, 385, 575, 75, 1205, pad=6)
    cv2.imwrite("public/logo-mark.png", icon)
    print("Saved public/logo-mark.png", icon.shape)

    full = crop(rgba, 375, 795, 75, 1205)
    cv2.imwrite("public/logo-full.png", full)
    print("Saved public/logo-full.png", full.shape)


if __name__ == "__main__":
    main()
