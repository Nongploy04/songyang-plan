import sys
sys.stdout.reconfigure(encoding='utf-8')
import os
import fitz
from PIL import Image
import io

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

def render_and_save(doc, page_num_1based, out_path, max_dim=1650):
    page = doc[page_num_1based - 1]
    rect = page.rect
    zoom = max_dim / max(rect.width, rect.height)
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
    img = Image.open(io.BytesIO(pix.tobytes("png")))
    img.save(out_path, format="WEBP", quality=82, method=4)

def main():
    total_files = 0
    total_bytes = 0
    for slug, page_list in VOLUME_PAGES.items():
        pdf_path = os.path.join(PDF_DIR, f"{slug}.pdf")
        if not os.path.exists(pdf_path):
            print(f"Skipping missing {slug}")
            continue
        doc = fitz.open(pdf_path)
        doc_out_dir = os.path.join(OUT_ROOT, slug)
        os.makedirs(doc_out_dir, exist_ok=True)
        unique_pages = sorted(set(p for p in page_list if 1 <= p <= len(doc)))
        for p in unique_pages:
            out_file = os.path.join(doc_out_dir, f"p{p:03d}.webp")
            render_and_save(doc, p, out_file)
            total_files += 1
            total_bytes += os.path.getsize(out_file)
        print(f"{slug}: exported {len(unique_pages)} pages")

    print(f"Done! Exported {total_files} official page scans ({total_bytes / (1024*1024):.2f} MB total)")

if __name__ == "__main__":
    main()
