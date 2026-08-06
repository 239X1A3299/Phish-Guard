"""
URL Feature Extractor for the Phishing Detection System.

Extracts a comprehensive set of features from URLs that are used
by the machine learning model to classify phishing vs legitimate sites.

Features extracted:
- URL length, dots, hyphens, slashes, digits, special chars
- HTTPS usage, IP address presence, @ symbol, hyphen
- Subdomain count, suspicious keywords, TLD analysis
- URL shortener detection, WHOIS, DNS, SSL checks
"""
import re
import socket
import ssl
from urllib.parse import urlparse, parse_qs, unquote
from datetime import datetime
import dns.resolver
import whois
import tldextract
from backend.config import SUSPICIOUS_KEYWORDS, SUSPICIOUS_TLDS, URL_SHORTENERS


class FeatureExtractor:
    """Extracts a fixed set of features from a URL for ML prediction."""

    # List of all feature names in the exact order they are extracted.
    # The ML model is trained on these exact features, so the order
    # must remain stable between training and inference.
    FEATURE_NAMES = [
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

    def __init__(self, timeout: int = 3):
        """Initialize with a network timeout for external lookups."""
        self.timeout = timeout

    def extract(self, url: str) -> dict:
        """
        Extract all features from a URL.
        Returns a dictionary of feature_name -> value.
        Every key in FEATURE_NAMES will be present in the result.
        """
        # Normalize URL - add https:// if scheme is missing
        url = self._normalize_url(url)

        features = {}

        # ---- Lexical features -------------------------------------------------
        features["url_length"] = len(url)
        features["num_dots"] = url.count(".")
        features["num_hyphens"] = url.count("-")
        features["num_slashes"] = url.count("/")
        features["num_digits"] = sum(c.isdigit() for c in url)
        features["num_special_chars"] = sum(
            (not c.isalnum() and c not in ".-_/:?&=#%+~@") for c in url
        )
        features["uses_https"] = 1 if url.startswith("https://") else 0
        features["has_ip_address"] = 1 if self._contains_ip(url) else 0
        features["has_at_symbol"] = 1 if "@" in url else 0
        features["has_hyphen"] = 1 if "-" in url else 0
        features["num_underscores"] = url.count("_")
        features["num_percent"] = url.count("%")
        features["num_ampersands"] = url.count("&")
        features["num_question_marks"] = url.count("?")
        features["num_equals"] = url.count("=")
        features["num_tilde"] = url.count("~")
        features["has_redirect_chars"] = 1 if "//" in url else 0
        features["has_equals_chars"] = 1 if "=" in url else 0
        features["has_tilde"] = 1 if "~" in url else 0
        features["has_hex_chars"] = 1 if re.search(r"%[0-9a-fA-F]{2}", url) else 0
        features["has_encoded_chars"] = 1 if re.search(r"%[0-9a-fA-F]{2}", unquote(url)) else 0

        # ---- Domain analysis --------------------------------------------------
        extracted = tldextract.extract(url)
        subdomain = extracted.subdomain
        domain = extracted.domain
        tld = extracted.suffix

        features["num_subdomains"] = len([s for s in subdomain.split(".") if s]) if subdomain else 0
        features["num_suspicious_keywords"] = self._count_suspicious_keywords(url)
        features["has_suspicious_tld"] = 1 if tld.lower() in SUSPICIOUS_TLDS else 0
        features["is_shortened"] = 1 if any(shortener in url.lower() for shortener in URL_SHORTENERS) else 0
        features["tld_length"] = len(tld)
        features["domain_length"] = len(domain)
        features["tld_has_digits"] = 1 if any(c.isdigit() for c in tld) else 0
        features["domain_has_digits"] = 1 if any(c.isdigit() for c in domain) else 0

        # ---- External lookups (network-based, with graceful fallback) ---------
        domain_full = f"{domain}.{tld}" if tld else domain
        domain_age = self._get_domain_age(domain_full)
        features["domain_age_days"] = domain_age if domain_age is not None else -1
        features["has_dns_record"] = 1 if self._has_dns(domain_full) else 0
        features["has_valid_ssl"] = 1 if self._check_ssl(domain_full) else 0
        features["has_whois"] = 1 if domain_age is not None else 0

        # ---- Path & query features -------------------------------------------
        parsed = urlparse(url)
        features["path_length"] = len(parsed.path)
        features["num_query_params"] = len(parse_qs(parsed.query))

        return features

    def extract_vector(self, url: str) -> list:
        """
        Extract features and return them as a list in FEATURE_NAMES order.
        This is the format expected by the ML model.
        """
        features = self.extract(url)
        return [features[name] for name in self.FEATURE_NAMES]

    # ---- Private helper methods ----------------------------------------------

    @staticmethod
    def _normalize_url(url: str) -> str:
        """Add https:// if no scheme is present."""
        url = url.strip()
        if not url.startswith(("http://", "https://")):
            url = "https://" + url
        return url

    @staticmethod
    def _contains_ip(url: str) -> bool:
        """Check if the URL contains a numeric IPv4 address."""
        ip_pattern = re.compile(
            r"((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}"
            r"(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)"
        )
        return bool(ip_pattern.search(url))

    @staticmethod
    def _count_suspicious_keywords(url: str) -> int:
        """Count suspicious keywords that appear in the URL."""
        url_lower = url.lower()
        return sum(1 for kw in SUSPICIOUS_KEYWORDS if kw in url_lower)

    def _get_domain_age(self, domain: str) -> int | None:
        """Get domain age in days via WHOIS. Returns None on failure."""
        try:
            w = whois.whois(domain)
            if w.creation_date:
                creation = w.creation_date[0] if isinstance(w.creation_date, list) else w.creation_date
                if isinstance(creation, str):
                    creation = datetime.fromisoformat(creation.replace("Z", "+00:00"))
                age = (datetime.now().astimezone() - creation).days
                return max(age, 0)
        except Exception:
            pass
        return None

    def _has_dns(self, domain: str) -> bool:
        """Check if the domain resolves via DNS."""
        try:
            dns.resolver.resolve(domain, "A", lifetime=self.timeout)
            return True
        except Exception:
            return False

    def _check_ssl(self, domain: str) -> bool:
        """Check if the domain serves a valid SSL certificate."""
        try:
            ctx = ssl.create_default_context()
            with socket.create_connection((domain, 443), timeout=self.timeout) as sock:
                with ctx.wrap_socket(sock, server_hostname=domain):
                    return True
        except Exception:
            return False