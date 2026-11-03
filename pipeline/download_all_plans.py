import os
import re
import sys
import json
import requests
import fitz # PyMuPDF
from urllib.parse import urljoin, unquote

sys.stdout.reconfigure(encoding='utf-8')

SAO_PAGE_URL = 'https://www.songyang-yasothon.go.th/data_12228'
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEST_DIR = os.path.join(BASE_DIR, 'source_pdfs')
os.makedirs(DEST_DIR, exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://www.songyang-yasothon.go.th/'
}

def clean_title(title: str) -> str:
    t = re.sub(r'^[-\s]+', '', title)
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def slugify(title: str, idx: int) -> str:
    t = clean_title(title)
    if '2571-2575' in t or '71-75' in t:
        return 'plan_2571_2575_main'
    if '2561 - 2565' in t or '2561-2565' in t:
        return 'plan_2561_2565_main'
    
    # 2566-2570 cases
    parts = ['plan', '2566_2570']
    
    if 'ทบทวน' in t:
        parts.append('review')
    elif 'แก้ไข' in t:
        parts.append('edit')
    elif 'เพิ่มเติม' in t:
        parts.append('add')
    elif 'เปลี่ยนแปลง' in t:
        parts.append('change')
        
    m_round = re.search(r'ครั้งที่\s*([0-9๑-๙]+)', t)
    m_slash_year = re.search(r'/([0-9]{2,4})', t)
    m_year = re.search(r'ปี\s*(?:พ\.ศ\.\s*)?([0-9]{2,4})', t)
    
    if m_round:
        parts.append(f'r{m_round.group(1)}')
    if m_slash_year:
        y = m_slash_year.group(1)
        if len(y) == 2: y = '25' + y
        parts.append(y)
    elif m_year:
        y = m_year.group(1)
        if len(y) == 2: y = '25' + y
        parts.append(y)
        
    slug = '_'.join(parts)
    if slug == 'plan_2566_2570':
        slug = f'plan_2566_2570_main_{idx:02d}'
    return slug

def main():
    print(f'Fetching plan document listing from {SAO_PAGE_URL}...')
    resp = requests.get(SAO_PAGE_URL, headers=HEADERS, timeout=25)
    resp.encoding = resp.apparent_encoding
    html = resp.text

    pattern = re.compile(r'<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', re.IGNORECASE | re.DOTALL)
    matches = pattern.findall(html)

    documents = []
    seen_urls = set()
    idx = 1

    for href, raw_text in matches:
        clean_text = clean_title(re.sub(r'<[^>]+>', '', raw_text))
        if not clean_text or not href:
            continue
        full_url = urljoin(SAO_PAGE_URL, href)
        if '.pdf' in href.lower() and ('แผน' in clean_text or 'ทบทวน' in clean_text or 'แก้ไข' in clean_text or 'เพิ่มเติม' in clean_text or 'เปลี่ยนแปลง' in clean_text):
            if full_url in seen_urls:
                continue
            seen_urls.add(full_url)
            slug = slugify(clean_text, idx)
            documents.append({
                'index': idx,
                'title': clean_text,
                'slug': slug,
                'url': full_url,
                'filename': f'{slug}.pdf'
            })
            idx += 1

    print(f'Discovered {len(documents)} official plan PDF documents.')

    # Check local pre-downloaded 71-75 file
    cached_71_75 = r'C:\Users\nextc\Downloads\แผนพัฒนาท้องถิ่น 71-75 บีบแล้ว.pdf'

    catalog = []
    for doc in documents:
        out_path = os.path.join(DEST_DIR, doc['filename'])
        print(f"\n[{doc['index']}/{len(documents)}] {doc['title']}")
        print(f" -> Target: {doc['filename']}")

        # If already exists or 71-75 local cache available
        if doc['slug'] == 'plan_2571_2575_main' and os.path.exists(cached_71_75) and not os.path.exists(out_path):
            print(f" -> Copying existing verified local file from {cached_71_75}...")
            with open(cached_71_75, 'rb') as src, open(out_path, 'wb') as dst:
                dst.write(src.read())
        elif not os.path.exists(out_path):
            print(f" -> Downloading from {doc['url']}...")
            try:
                r = requests.get(doc['url'], headers=HEADERS, stream=True, timeout=60)
                if r.status_code == 200:
                    with open(out_path, 'wb') as f:
                        for chunk in r.iter_content(chunk_size=65536):
                            if chunk:
                                f.write(chunk)
                    print(f" -> Download complete: {os.path.getsize(out_path):,} bytes")
                else:
                    print(f" -> HTTP Error {r.status_code}")
            except Exception as e:
                print(f" -> Failed to download: {e}")
        else:
            print(f" -> Already downloaded: {os.path.getsize(out_path):,} bytes")

        # Inspect PDF metadata
        file_size = os.path.getsize(out_path) if os.path.exists(out_path) else 0
        page_count = 0
        if file_size > 0:
            try:
                pdf = fitz.open(out_path)
                page_count = len(pdf)
                pdf.close()
            except Exception as e:
                print(f" -> Note on PDF parse: {e}")

        catalog.append({
            'index': doc['index'],
            'title': doc['title'],
            'slug': doc['slug'],
            'filename': doc['filename'],
            'url': doc['url'],
            'fileSize': file_size,
            'pageCount': page_count
        })

    catalog_path = os.path.join(DEST_DIR, 'catalog.json')
    with open(catalog_path, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)

    print(f"\nAll done! Downloaded & cataloged {len(catalog)} documents in {catalog_path}")

if __name__ == '__main__':
    main()
