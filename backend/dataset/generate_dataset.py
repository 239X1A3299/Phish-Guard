"""
Dataset Generator - Creates a realistic synthetic URL dataset
for training the phishing detection model.

Generates features for legitimate and phishing URLs based on known patterns:
- Legitimate URLs: HTTPS, reasonable length, no IP addresses, no suspicious keywords
- Phishing URLs: IP addresses, suspicious keywords, @ symbols, shorteners, etc.

Run: python -m backend.dataset.generate_dataset
"""
import random
import csv
from pathlib import Path

import numpy as np

from backend.config import DATASET_PATH

# Seed for reproducibility
random.seed(42)
np.random.seed(42)

# Common legitimate domains and TLDs
LEGIT_DOMAINS = [
    "google", "facebook", "amazon", "wikipedia", "youtube", "twitter",
    "linkedin", "github", "stackoverflow", "microsoft", "apple", "netflix",
    "spotify", "drive", "gmail", "outlook", "yahoo", "paypal", "ebay",
    "reddit", "instagram", "whatsapp", "telegram", "zoom", "dropbox",
]

LEGIT_TLDS = ["com", "org", "net", "io", "co", "edu", "gov", "dev"]

# Phishing patterns
SUSPICIOUS_KEYWORDS = [
    "login", "verify", "account", "update", "bank", "secure",
    "signin", "wallet", "password", "confirm", "webscr", "auth",
    "paypal", "ebay", "free", "bonus", "click", "win", "prize",
    "offer", "rewards", "gift", "token", "session",
]

SUSPICIOUS_TLDS = ["tk", "ml", "ga", "cf", "gq", "xyz", "top", "club", "work", "loan", "men", "download"]

SHORTENERS = ["bit.ly", "tinyurl.com", "goo.gl", "t.co", "ow.ly", "is.gd", "cutt.ly", "rb.gy"]

# Feature names in the same order as the FeatureExtractor
FEATURE_COLUMNS = [
    "url_length",
    "num_dots",
    "num_hyphens",
    "num_slashes",
    "num_digits",
    "num_special_chars",
    "uses_https",
    "has_ip_address",
    "has_at_symbol",
    "has_hyphen",
    "num_subdomains",
    "num_suspicious_keywords",
    "has_suspicious_tld",
    "is_shortened",
    "domain_age_days",
    "has_dns_record",
    "has_valid_ssl",
    "has_whois",
    "path_length",
    "num_query_params",
    "has_hex_chars",
    "has_encoded_chars",
    "tld_length",
    "domain_length",
    "num_underscores",
    "num_percent",
    "num_ampersands",
    "num_question_marks",
    "num_equals",
    "num_tilde",
    "has_redirect_chars",
    "has_equals_chars",
    "has_tilde",
    "tld_has_digits",
    "domain_has_digits",
]


def generate_legitimate_url() -> dict:
    """Generate a realistic legitimate URL and extract its features."""
    domain = random.choice(LEGIT_DOMAINS)
    tld = random.choice(LEGIT_TLDS)
    subdomains = random.choice(["", "www.", "mail.", "blog.", "shop.", "support."])
    path_words = ["", "index", "products", "about", "contact", "help", "faq", "docs", "home"]
    path = random.choice(path_words)
    query = ""
    if random.random() < 0.3:
        query = f"?id={random.randint(100, 99999)}&page={random.randint(1, 5)}"

    url = f"https://{subdomains}{domain}.{tld}/{path}{query}"
    return compute_features(url)


def generate_phishing_url() -> dict:
    """Generate a realistic phishing URL and extract its features."""
    style = random.random()
    tld = random.choice(SUSPICIOUS_TLDS)
    keyword = random.choice(SUSPICIOUS_KEYWORDS)
    subdomains = "".join(random.choice("abcdefghijklmnopqrstuvwxyz") for _ in range(random.randint(3, 8)))

    if style < 0.25:
        # IP-based phishing
        ip = ".".join(str(random.randint(1, 254)) for _ in range(4))
        url = f"http://{ip}/{keyword}"
    elif style < 0.45:
        # Suspicious keyword + suspicious TLD
        url = f"http://{subdomains}-{keyword}.{tld}/login"
    elif style < 0.65:
        # Shortened URL
        shortener = random.choice(SHORTENERS)
        url = f"http://{shortener}/{random.choice('abcdefghijklmnopqrstuvwxyz')}{random.randint(100, 999)}"
    elif style < 0.8:
        # @ symbol misdirection
        url = f"http://{keyword}-{subdomains}.{tld}@2024-login.com/account"
    else:
        # Long URL with many special chars and query params
        url = (
            f"http://{subdomains}.{tld}/{keyword}/update?user=admin&session={random.randint(10000, 999999)}"
            f"&verify=1&redirect=%2Fprofile&token=abcd1234"
        )

    return compute_features(url)


def compute_features(url: str) -> dict:
    """Compute all features from a URL string (offline, no network)."""
    f = {}
    f["url_length"] = len(url)
    f["num_dots"] = url.count(".")
    f["num_hyphens"] = url.count("-")
    f["num_slashes"] = url.count("/")
    f["num_digits"] = sum(c.isdigit() for c in url)
    f["num_special_chars"] = sum(not c.isalnum() and c not in ".-_/:?&=#%+~@" for c in url)
    f["uses_https"] = 1 if url.startswith("https://") else 0
    f["has_ip_address"] = 1 if (
        sum(c.isdigit() for c in url.split('/')[2].split('.')[:4] if c.isdigit()) >= 4
        and url.replace("http://", "").replace("https://", "").split("/")[0].count(".") == 3
    ) else 0
    f["has_at_symbol"] = 1 if "@" in url else 0
    f["has_hyphen"] = 1 if "-" in url else 0
    f["num_underscores"] = url.count("_")
    f["num_percent"] = url.count("%")
    f["num_ampersands"] = url.count("&")
    f["num_question_marks"] = url.count("?")
    f["num_equals"] = url.count("=")
    f["num_tilde"] = url.count("~")
    f["has_redirect_chars"] = 1 if "//" in url else 0
    f["has_equals_chars"] = 1 if "=" in url else 0
    f["has_tilde"] = 1 if "~" in url else 0
    f["has_hex_chars"] = 1 if "%" in url else 0
    f["has_encoded_chars"] = 1 if "%" in url else 0

    # Domain analysis (simple heuristic)
    domain_part = url.split("/")[2] if len(url.split("/")) > 2 else url
    if "@" in domain_part:
        domain_part = domain_part.split("@")[-1]
    parts = domain_part.split(".")
    if f["has_ip_address"]:
        domain = domain_part
        tld = parts[-1] if len(parts) > 1 else ""
        subdomain = ""
    else:
        tld = parts[-1] if len(parts) > 1 else ""
        domain = parts[-2] if len(parts) > 1 else parts[0]
        subdomain = ".".join(parts[:-2]) if len(parts) > 2 else ""

    f["num_subdomains"] = len([s for s in subdomain.split(".") if s])
    f["num_suspicious_keywords"] = sum(1 for kw in SUSPICIOUS_KEYWORDS if kw in url.lower())
    f["has_suspicious_tld"] = 1 if tld.lower() in SUSPICIOUS_TLDS else 0
    f["is_shortened"] = 1 if any(s in url.lower() for s in SHORTENERS) else 0
    f["tld_length"] = len(tld)
    f["domain_length"] = len(domain)
    f["tld_has_digits"] = 1 if any(c.isdigit() for c in tld) else 0
    f["domain_has_digits"] = 1 if any(c.isdigit() for c in domain) else 0

    # Network-simulated features
    is_legit_like = domain in LEGIT_DOMAINS and f["uses_https"] == 1
    f["domain_age_days"] = random.randint(2000, 8000) if is_legit_like else random.randint(1, 400)
    f["has_dns_record"] = 1 if is_legit_like or random.random() > 0.3 else 0
    f["has_valid_ssl"] = 1 if is_legit_like or random.random() > 0.3 else 0
    f["has_whois"] = 1 if is_legit_like or random.random() > 0.2 else 0

    # Path and query
    from urllib.parse import urlparse, parse_qs
    parsed = urlparse(url)
    f["path_length"] = len(parsed.path)
    f["num_query_params"] = len(parse_qs(parsed.query))

    return f


def generate_dataset(num_samples: int = 2000, output_path: Path = DATASET_PATH) -> None:
    """
    Generate a balanced dataset of legitimate and phishing URLs.
    """
    half = num_samples // 2
    rows = []

    for _ in range(half):
        features = generate_legitimate_url()
        features["label"] = 0  # legitimate
        rows.append(features)

    for _ in range(half):
        features = generate_phishing_url()
        features["label"] = 1  # phishing
        rows.append(features)

    # Shuffle
    random.shuffle(rows)

    # Write CSV
    output_path.parent.mkdir(parents=True, exist_ok=True)
    columns = FEATURE_COLUMNS + ["label"]
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        writer.writerows(rows)

    legit_count = sum(1 for r in rows if r["label"] == 0)
    phish_count = sum(1 for r in rows if r["label"] == 1)
    print(f"✅ Dataset generated: {len(rows)} samples")
    print(f"   Legitimate: {legit_count} | Phishing: {phish_count}")
    print(f"   Saved to: {output_path}")


if __name__ == "__main__":
    generate_dataset()