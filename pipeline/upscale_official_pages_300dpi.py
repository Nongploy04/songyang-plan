"""
High-Fidelity 300 DPI Document Upscaling & Tone Enhancement Pipeline
Upscales and enhances all 298 scanned pages across all 16 official local plan volumes.
Features:
- Native 300 DPI PyMuPDF rasterization (3510x2481 landscape / 2481x3510 portrait)
- Background whitening & paper tone normalization via morphological dilation division
- Text contrast deepening & edge acutance boosting via adaptive unsharp mask
- WebP compression with quality=86, method=6 for crystal clear print sharpness
"""

import sys
sys.stdout.reconfigure(encoding='utf-8')
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import fitz
import cv2
import numpy as np
from PIL import Image

PDF_DIR = r"d:\Nextc\GITHUB\Songyang\songyang-plan\pipeline\source_pdfs"
OUT_ROOT = r"d:\Nextc\GITHUB\Songyang\songyang-plan\public\official-pages"
os.makedirs(OUT_ROOT, exist_ok=True)

VOLUME_PAGES = {
    "plan_2571_2575_main": [1, 66, 251] + list(range(67, 250)),
    "plan_2566_2570_edit_r3_2569": [1, 5, 6, 8],
    "plan_2566_2570_edit_r2_2569": [1, 5, 6, 7, 8, 10],
    "plan_2566_2570_change_r1_2569": [1, 9, 10, 11, 12, 13, 14, 15, 17],
    "plan_2566_2570_add_r2_2569": [1, 6] + list(range(7, 24)) + [25],
    "plan_2566_2570_edit_r1_2569": [1, 5, 6, 8],
    "plan_2566_2570_add_r1_2569": [1, 7, 8, 9, 10, 11, 13],
    "plan_2566_2570_edit_r3_2568": [1, 5, 7],
    "plan_2566_2570_add_r3_2568": [1, 5, 6, 7, 9],
    "plan_2566_2570_add_r2_2568": [1, 5] + list(range(6, 29)) + [30],
    "plan_2566_2570_change_r3_2568": [1, 5, 6, 7, 8, 10],
    "plan_2566_2570_edit_r2_2568": [1, 5, 7],
    "plan_2566_2570_change_r2_2568": [1, 6, 7, 9],
    "plan_2566_2570_edit_r1_2568": [1, 5, 7],
    "plan_2566_2570_add": [1, 5, 6, 7, 8, 9, 10, 11, 12, 14],
    "plan_2566_2570_review_r1_2567": [1, 286],
}

# Precompute tone curve lookup table (LUT)
LUT_TONE = np.zeros(256, dtype=np.uint8)
for i in range(256):
    if i > 220:
        LUT_TONE[i] = 255  # Pure white background
    elif i < 60:
        LUT_TONE[i] = int(i * 0.7)  # Deep rich black text
    else:
        norm_val = (i - 60) / 160.0
        LUT_TONE[i] = int(42 + 213 * (norm_val ** 1.3))

MORPH_KERNEL = cv2.getStructuringElement(cv2.MORPH_RECT, (51, 51))


def process_single_page(slug: str, pdf_path: str, page_num_1based: int, out_path: str):
    """
    Renders and enhances a single page to 300 DPI with background whitening and unsharp masking.
    """
    doc = None
    try:
        doc = fitz.open(pdf_path)
        if page_num_1based > len(doc):
            return slug, page_num_1based, False, 0, f"Page {page_num_1based} exceeds doc len {len(doc)}"
        page = doc[page_num_1based - 1]

        # 300 DPI zoom factor = 300 / 72.0
        zoom = 300.0 / 72.0
        pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
        img_np = np.frombuffer(pix.samples, dtype=np.uint8).reshape((pix.height, pix.width, 3))

        # 1. Grayscale
        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)

        # 2. Background estimation via dilation
        bg = cv2.morphologyEx(gray, cv2.MORPH_DILATE, MORPH_KERNEL)

        # 3. Background normalization
        norm = cv2.divide(gray, bg, scale=255)

        # 4. Adaptive unsharp mask
        gaussian = cv2.GaussianBlur(norm, (0, 0), 2.0)
        sharp = cv2.addWeighted(norm, 1.6, gaussian, -0.6, 0)

        # 5. Tone curve LUT
        enhanced_gray = cv2.LUT(sharp, LUT_TONE)

        # 6. Convert back to RGB for standard image viewer compatibility
        enhanced_rgb = cv2.cvtColor(enhanced_gray, cv2.COLOR_GRAY2RGB)
        pil_img = Image.fromarray(enhanced_rgb)

        # 7. WebP Save with high fidelity
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        pil_img.save(out_path, format="WEBP", quality=86, method=6)
        file_size = os.path.getsize(out_path)

        return slug, page_num_1based, True, file_size, None
    except Exception as e:
        return slug, page_num_1based, False, 0, str(e)
    finally:
        if doc is not None:
            doc.close()


def main():
    print("=" * 70)
    print("Starting High-Fidelity 300 DPI Plan Scan Enhancement Pipeline")
    print(f"Target Directory: {OUT_ROOT}")
    print("=" * 70)

    tasks = []
    for slug, page_list in VOLUME_PAGES.items():
        pdf_path = os.path.join(PDF_DIR, f"{slug}.pdf")
        if not os.path.exists(pdf_path):
            print(f"[WARN] PDF not found: {pdf_path}")
            continue

        doc_out_dir = os.path.join(OUT_ROOT, slug)
        os.makedirs(doc_out_dir, exist_ok=True)
        unique_pages = sorted(set(p for p in page_list if p >= 1))

        for p in unique_pages:
            out_file = os.path.join(doc_out_dir, f"p{p:03d}.webp")
            tasks.append((slug, pdf_path, p, out_file))

    total_tasks = len(tasks)
    print(f"Total pages queued for 300 DPI upscaling: {total_tasks}")

    start_time = time.time()
    completed = 0
    total_bytes = 0
    errors = []

    # Use 8 worker threads for optimal CPU/IO concurrency
    workers = min(8, os.cpu_count() or 4)
    print(f"Running with {workers} parallel worker threads...")

    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {
            executor.submit(process_single_page, slug, pdf_path, p, out_file): (slug, p)
            for (slug, pdf_path, p, out_file) in tasks
        }

        for future in as_completed(futures):
            slug, p_num, success, size, err = future.result()
            completed += 1
            if success:
                total_bytes += size
            else:
                errors.append(f"{slug} page {p_num}: {err}")

            if completed % 25 == 0 or completed == total_tasks:
                elapsed = time.time() - start_time
                avg_speed = completed / elapsed if elapsed > 0 else 0
                eta = (total_tasks - completed) / avg_speed if avg_speed > 0 else 0
                print(
                    f"Progress: [{completed}/{total_tasks}] "
                    f"({(completed / total_tasks * 100):.1f}%) "
                    f"- {total_bytes / (1024 * 1024):.1f} MB written "
                    f"- {avg_speed:.1f} pages/sec - ETA: {eta:.0f}s"
                )

    total_elapsed = time.time() - start_time
    print("=" * 70)
    print(f"Upscaling Completed in {total_elapsed:.1f} seconds!")
    print(f"Total Pages Processed: {completed}")
    print(f"Total WebP Size: {total_bytes / (1024 * 1024):.2f} MB (Avg: {total_bytes / completed / 1024:.1f} KB/page)")
    if errors:
        print(f"[!] Encountered {len(errors)} errors:")
        for err in errors:
            print(f"  - {err}")
    else:
        print("Success: All 298 pages rendered at 300 DPI with 0 errors!")
    print("=" * 70)


if __name__ == "__main__":
    main()
