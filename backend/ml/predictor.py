"""
Machine Learning Predictor - loads the trained model and predicts
whether a URL is Safe, Suspicious, or Phishing.
"""
import json
import logging
import joblib
import numpy as np
from backend.config import (
    MODEL_PATH,
    MODEL_METRICS_PATH,
    SAFE_THRESHOLD,
    SUSPICIOUS_THRESHOLD,
)
from backend.ml.feature_extractor import FeatureExtractor

logger = logging.getLogger(__name__)


class PhishingPredictor:
    """Wrapper around the trained sklearn model for URL classification."""

    def __init__(self):
        """Load the model and feature names on initialization."""
        self.model = None
        self.metrics = {}
        self.feature_names = FeatureExtractor.FEATURE_NAMES
        self.extractor = FeatureExtractor()
        self._load_model()

    def _load_model(self) -> None:
        """Load the saved model and metrics from disk."""
        try:
            if MODEL_PATH.exists():
                self.model = joblib.load(MODEL_PATH)
                logger.info("Model loaded successfully from %s", MODEL_PATH)
            else:
                logger.warning("Model not found at %s. Run train_model.py first.", MODEL_PATH)
        except Exception as e:
            logger.error("Failed to load model: %s", e)
            self.model = None

        try:
            if MODEL_METRICS_PATH.exists():
                with open(MODEL_METRICS_PATH, "r") as f:
                    self.metrics = json.load(f)
        except Exception as e:
            logger.error("Failed to load metrics: %s", e)

    @property
    def is_ready(self) -> bool:
        """Check if the model is loaded and available."""
        return self.model is not None

    def predict(self, url: str) -> dict:
        """
        Predict whether a URL is phishing, suspicious, or safe.

        Returns a dictionary with:
        - prediction: 'Safe' | 'Suspicious' | 'Phishing'
        - confidence: float (0 to 1)
        - risk_score: int (0 to 100)
        - detected_problems: list of strings
        - recommendations: list of strings
        - features: dict of extracted feature values
        """
        # Extract features from the URL
        features = self.extractor.extract(url)
        feature_vector = [features[name] for name in self.feature_names]

        # Default result if no model is loaded (rule-based fallback)
        if self.model is None:
            return self._rule_based_fallback(url, features)

        # Get probability from the model
        try:
            prob = self.model.predict_proba([feature_vector])[0]
            # Assume class 1 is phishing (positive class)
            phishing_prob = float(prob[1]) if len(prob) > 1 else float(prob[0])
        except Exception as e:
            logger.error("Prediction error: %s", e)
            return self._rule_based_fallback(url, features)

        risk_score = round(phishing_prob * 100)

        # Determine risk level using thresholds
        if risk_score <= SAFE_THRESHOLD * 100:
            prediction = "Safe"
        elif risk_score <= SUSPICIOUS_THRESHOLD * 100:
            prediction = "Suspicious"
        else:
            prediction = "Phishing"

        # Generate detected problems and recommendations
        detected_problems = self._detect_problems(url, features)
        recommendations = self._generate_recommendations(prediction, features)

        return {
            "prediction": prediction,
            "confidence": round(phishing_prob, 4),
            "risk_score": risk_score,
            "detected_problems": detected_problems,
            "recommendations": recommendations,
            "features": features,
        }

    def _rule_based_fallback(self, url: str, features: dict) -> dict:
        """Heuristic fallback used when no ML model is available."""
        risk_score = 0

        # Score based on heuristic rules
        if features["uses_https"] == 0:
            risk_score += 15
        if features["has_ip_address"] == 1:
            risk_score += 25
        if features["has_at_symbol"] == 1:
            risk_score += 15
        if features["num_suspicious_keywords"] > 0:
            risk_score += 10 * features["num_suspicious_keywords"]
        if features["has_suspicious_tld"] == 1:
            risk_score += 20
        if features["is_shortened"] == 1:
            risk_score += 15
        if features["num_subdomains"] > 3:
            risk_score += 10
        if features["domain_age_days"] >= 0 and features["domain_age_days"] < 180:
            risk_score += 15
        if features["has_dns_record"] == 0:
            risk_score += 10
        if features["has_valid_ssl"] == 0:
            risk_score += 15

        risk_score = min(risk_score, 100)

        if risk_score <= SAFE_THRESHOLD * 100:
            prediction = "Safe"
        elif risk_score <= SUSPICIOUS_THRESHOLD * 100:
            prediction = "Suspicious"
        else:
            prediction = "Phishing"

        detected_problems = self._detect_problems(url, features)
        recommendations = self._generate_recommendations(prediction, features)

        return {
            "prediction": prediction,
            "confidence": round(risk_score / 100, 4),
            "risk_score": risk_score,
            "detected_problems": detected_problems,
            "recommendations": recommendations,
            "features": features,
        }

    def _detect_problems(self, url: str, features: dict) -> list:
        """Identify security problems based on extracted features."""
        problems = []

        if features["uses_https"] == 0:
            problems.append("The website does not use HTTPS (secure connection)")
        if features["has_ip_address"] == 1:
            problems.append("The URL contains an IP address instead of a domain name")
        if features["has_at_symbol"] == 1:
            problems.append("The URL contains an '@' symbol, which can be used to deceive users")
        if features["has_hyphen"] == 1:
            problems.append("The domain contains a hyphen, common in fake domains")
        if features["num_subdomains"] > 3:
            problems.append(f"Unusually high number of subdomains ({features['num_subdomains']})")
        if features["num_suspicious_keywords"] > 0:
            problems.append(f"Contains {features['num_suspicious_keywords']} suspicious keyword(s)")
        if features["has_suspicious_tld"] == 1:
            problems.append("Uses a top-level domain commonly associated with phishing")
        if features["is_shortened"] == 1:
            problems.append("URL is shortened, hiding the true destination")
        if features["domain_age_days"] >= 0 and features["domain_age_days"] < 180:
            problems.append(f"Domain is very new ({features['domain_age_days']} days old)")
        if features["has_dns_record"] == 0:
            problems.append("No DNS record found for the domain")
        if features["has_valid_ssl"] == 0:
            problems.append("No valid SSL certificate found")
        if features["num_digits"] > 8:
            problems.append("URL contains an unusual number of digits")

        return problems

    def _generate_recommendations(self, prediction: str, features: dict) -> list:
        """Generate security recommendations based on the prediction."""
        recommendations = []

        if prediction == "Safe":
            recommendations.append("This URL appears to be safe. Always stay alert for future threats.")
            recommendations.append("Keep your browser and antivirus software updated.")
        elif prediction == "Suspicious":
            recommendations.append("Exercise caution before entering any personal information.")
            recommendations.append("Verify the website's legitimacy through official channels.")
            recommendations.append("Do not click on links from untrusted emails or messages.")
            recommendations.append("Enable two-factor authentication on your accounts.")
        else:  # Phishing
            recommendations.append("DO NOT enter any personal, financial, or login information.")
            recommendations.append("Close this website immediately.")
            recommendations.append("Report the phishing site to your email provider or IT department.")
            recommendations.append("Change passwords for any accounts that may be affected.")
            recommendations.append("Run a security scan on your device.")

        if features["uses_https"] == 0:
            recommendations.append("Always ensure websites use HTTPS before submitting data.")
        if features["has_ip_address"] == 1:
            recommendations.append("Legitimate websites rarely use IP addresses in their URLs.")

        return recommendations


# Singleton instance for application-wide use
predictor = PhishingPredictor()