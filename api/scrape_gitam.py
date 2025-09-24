#!/usr/bin/env python3
"""
scrape_gitam.py
Crawl https://www.gitam.edu and produce structured JSON with pages, extracted contacts,
program names, FAQs, images and PDFs. Obeys robots.txt by default.

Usage:
  pip install -r requirements.txt
  python scrape_gitam.py --start-url https://www.gitam.edu --max-pages 500 --delay 1.0 --download-assets

Output:
  - gitam_site.json     (full structured output)
  - assets/             (optional downloaded images and pdfs)
"""

import argparse
import json
import re
import time
import os
from collections import deque
from urllib.parse import urlparse, urljoin

import requests
from bs4 import BeautifulSoup
from urllib.robotparser import RobotFileParser
import tldextract

# -----------------------
# Helpers & config
# -----------------------
HEADERS = {
    "User-Agent": "CampusBotScraper/1.0 (+https://github.com/yourname) - polite scraping for research"
}

EMAIL_RE = re.compile(r"[a-zA-Z0-9.\-_+%]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
PHONE_RE = re.compile(r"(?:\+?\d{1,3}[-.\s]?)?(?:\d{2,4}[-.\s]?){2,4}\d{2,4}")

PROGRAM_KEYWORDS = [
    "b.tech", "btech", "m.tech", "mtech", "mba", "bba", "bsc", "msc", "phd", "mca",
    "b.com", "m.com", "b.pharm", "m.pharm", "law", "llb", "b.arch", "bca"
]


def is_same_domain(start_domain, url):
    try:
        e1 = tldextract.extract(start_domain)
        e2 = tldextract.extract(url)
        return (e1.domain == e2.domain and e1.suffix == e2.suffix)
    except Exception:
        return False


def normalize_url(base, href):
    if not href:
        return None
    href = href.strip()
    if href.startswith("mailto:") or href.startswith("tel:") or href.startswith("javascript:"):
        return None
    # remove fragment
    href = href.split("#")[0]
    if href.startswith("//"):
        href = "https:" + href
    if href.startswith("http://") or href.startswith("https://"):
        return href
    return urljoin(base, href)


def extract_contacts(text):
    emails = set(re.findall(EMAIL_RE, text))
    phones = set(re.findall(PHONE_RE, text))
    # Filter false positives (very short numbers)
    phones = {p.strip() for p in phones if len(re.sub(r"\D", "", p)) >= 6}
    return list(sorted(emails)), list(sorted(phones))


def extract_programs(soup):
    text = soup.get_text(" ", strip=True).lower()
    found = set()
    for kw in PROGRAM_KEYWORDS:
        if kw in text:
            # find surrounding words to capture program names
            for line in text.split("."):
                if kw in line:
                    found.add(line.strip())
    return list(found)


def extract_faqs(soup):
    faqs = []
    # common patterns: <section id="faq">, headings "FAQ", "Frequently Asked"
    faq_nodes = []
    for header in soup.find_all(['h1','h2','h3','h4']):
        htxt = header.get_text(" ", strip=True).lower()
        if "faq" in htxt or "frequently" in htxt:
            # look for sibling lists or next elements
            nxt = header.find_next_sibling()
            if nxt:
                faq_nodes.append(nxt)
    # fallback: look for accordion or dl
    for node in faq_nodes:
        # try lists
        for li in node.find_all("li"):
            faqs.append(li.get_text(" ", strip=True))
        for p in node.find_all("p"):
            faqs.append(p.get_text(" ", strip=True))
    # If still empty try question/answer heuristics: <strong>Q: ...</strong>
    if not faqs:
        for strong in soup.find_all("strong"):
            txt = strong.get_text(" ", strip=True)
            if txt.endswith("?"):
                ans = strong.find_next_sibling("p")
                faqs.append({"q": txt, "a": ans.get_text(" ", strip=True) if ans else ""})
    return faqs


def parse_page(url, html):
    soup = BeautifulSoup(html, "lxml")
    title = soup.title.string.strip() if soup.title and soup.title.string else ""
    meta_desc = ""
    md = soup.find("meta", attrs={"name":"description"})
    if md and md.get("content"):
        meta_desc = md.get("content").strip()
    # headings
    headings = []
    for tag in ["h1","h2","h3"]:
        for h in soup.find_all(tag):
            headings.append({"tag": tag, "text": h.get_text(" ", strip=True)})
    # text snippets (first 8 paragraphs)
    paragraphs = [p.get_text(" ", strip=True) for p in soup.find_all("p")]
    snippets = paragraphs[:8]
    # images and pdfs
    imgs = []
    for img in soup.find_all("img"):
        src = img.get("src") or img.get("data-src")
        if src:
            imgs.append(src)
    pdfs = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.lower().endswith(".pdf"):
            pdfs.append(href)
    # emails and phones
    full_text = soup.get_text(" ", strip=True)
    emails, phones = extract_contacts(full_text)
    # programs (heuristic)
    programs = extract_programs(soup)
    # faqs (heuristic)
    faqs = extract_faqs(soup)
    # links
    links = []
    for a in soup.find_all("a", href=True):
        links.append(a["href"])
    return {
        "title": title,
        "meta_description": meta_desc,
        "headings": headings,
        "snippets": snippets,
        "images": imgs,
        "pdfs": pdfs,
        "emails": emails,
        "phones": phones,
        "programs": programs,
        "faqs": faqs,
        "links": links,
    }

# -----------------------
# Main crawler
# -----------------------
def crawl(start_url, max_pages=500, delay=1.0, download_assets=False, assets_dir="assets"):
    parsed = urlparse(start_url)
    base_domain = f"{parsed.scheme}://{parsed.netloc}"
    rp = RobotFileParser()
    robots_url = urljoin(base_domain, "/robots.txt")
    try:
        rp.set_url(robots_url)
        rp.read()
        print(f"[INFO] Loaded robots.txt from {robots_url}")
    except Exception as e:
        print(f"[WARN] Could not load robots.txt: {e}")

    # prepare
    session = requests.Session()
    session.headers.update(HEADERS)
    q = deque([start_url])
    visited = set()
    pages = {}
    aggregated_programs = set()
    aggregated_emails = set()
    aggregated_phones = set()
    page_count = 0

    if download_assets and not os.path.exists(assets_dir):
        os.makedirs(assets_dir, exist_ok=True)

    while q and page_count < max_pages:
        url = q.popleft()
        if url in visited:
            continue
        # normalize
        if not is_same_domain(base_domain, url):
            continue
        if not rp.can_fetch(HEADERS["User-Agent"], url):
            print(f"[ROBOT] Skipping {url} (disallowed by robots.txt)")
            continue
        try:
            print(f"[FETCH] {url}")
            r = session.get(url, timeout=20)
            time.sleep(delay)
            if r.status_code != 200:
                print(f"[WARN] status {r.status_code} for {url}")
                visited.add(url)
                continue
            data = parse_page(url, r.text)
            pages[url] = data
            page_count += 1
            visited.add(url)

            # aggregate
            for p in data.get("programs", []):
                aggregated_programs.add(p)
            for e in data.get("emails", []):
                aggregated_emails.add(e)
            for ph in data.get("phones", []):
                aggregated_phones.add(ph)

            # add internal links
            for href in data.get("links", []):
                norm = normalize_url(url, href)
                if not norm:
                    continue
                # keep only same host
                if is_same_domain(base_domain, norm) and norm not in visited:
                    # avoid login or mailto or fragments
                    if norm.startswith(base_domain):
                        q.append(norm)

            # download assets: images and pdfs
            if download_assets:
                for src in data.get("images", []) + data.get("pdfs", []):
                    src_url = normalize_url(url, src)
                    if not src_url:
                        continue
                    try:
                        fname = os.path.basename(urlparse(src_url).path)
                        if not fname:
                            continue
                        outpath = os.path.join(assets_dir, fname)
                        if os.path.exists(outpath):
                            continue
                        print(f"[ASSET] Downloading {src_url} -> {outpath}")
                        rr = session.get(src_url, timeout=30)
                        if rr.status_code == 200:
                            with open(outpath, "wb") as f:
                                f.write(rr.content)
                    except Exception as e:
                        print(f"[ASSET ERR] {e} for {src_url}")

        except Exception as ex:
            print(f"[ERROR] Failed to fetch {url}: {ex}")
            visited.add(url)
            continue

    # final output
    output = {
        "start_url": start_url,
        "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "page_count": page_count,
        "pages": pages,
        "aggregated": {
            "programs": sorted(list(aggregated_programs)),
            "emails": sorted(list(aggregated_emails)),
            "phones": sorted(list(aggregated_phones)),
        }
    }

    with open("gitam_site.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"[DONE] Saved gitam_site.json ({page_count} pages).")
    return output

# -----------------------
# CLI
# -----------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--start-url", default="https://www.gitam.edu", help="Start URL to crawl")
    parser.add_argument("--max-pages", type=int, default=500, help="Maximum pages to crawl")
    parser.add_argument("--delay", type=float, default=1.0, help="Delay between requests (seconds)")
    parser.add_argument("--download-assets", action="store_true", help="Download images & PDFs into assets/")
    args = parser.parse_args()

    crawl(args.start_url, max_pages=args.max_pages, delay=args.delay, download_assets=args.download_assets)
