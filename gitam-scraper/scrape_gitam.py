import requests
from bs4 import BeautifulSoup
import json

BASE_URL = "https://www.gitam.edu"
PAGES = [
    "/",  # home
    "/about",  # about page
    "/academics",  # academics
    "/admissions",  # admissions
    "/campus-life",  # campus life
    "/contact-us",  # contact
]

def scrape_page(url):
    """Scrapes text content from a given page URL"""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        # Get only text content
        text = soup.get_text(separator=" ", strip=True)
        return text[:5000]  # keep first 5000 chars only
    except Exception as e:
        return f"Error scraping {url}: {e}"

def main():
    data = {}
    for page in PAGES:
        full_url = BASE_URL + page
        print(f"Scraping {full_url} ...")
        data[full_url] = scrape_page(full_url)

    # Save into JSON
    with open("gitam_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print("✅ Data saved into gitam_data.json")

if __name__ == "__main__":
    main()
