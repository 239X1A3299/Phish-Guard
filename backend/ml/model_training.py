"""
Model Training Pipeline - Trains and compares multiple ML algorithms
(Random Forest, Decision Tree, XGBoost, Logistic Regression, SVM),
evaluates them, and saves the best model.

Run: python -m backend.ml.model_training
"""
import json
import logging
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
)
from sklearn.preprocessing import StandardScaler
import xgboost as xgb

from backend.config import MODEL_DIR, MODEL_PATH, MODEL_METRICS_PATH, DATASET_PATH

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def load_dataset(path: Path) -> pd.DataFrame:
    """
    Load the URL dataset from CSV.
    Expected columns: all URL features + 'label' (0=legitimate, 1=phishing).
    """
    if not path.exists():
        raise FileNotFoundError(
            f"Dataset not found at {path}. Run dataset generation first: python backend/dataset/generate_dataset.py"
        )

    df = pd.read_csv(path)
    logger.info("Dataset loaded: %d rows, %d columns", df.shape[0], df.shape[1])
    return df


def train_models(df: pd.DataFrame) -> dict:
    """
    Train all 5 models and return their evaluation metrics.
    """
    # Separate features and labels
    X = df.drop(columns=["label"]).values
    y = df["label"].values

    logger.info("Feature shape: %s, Label distribution: %s", X.shape, np.bincount(y))

    # Split into train/test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Scale features for models that need it (SVM, Logistic Regression)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Define the models to compare
    models = {
        "Random Forest": RandomForestClassifier(
            n_estimators=200, max_depth=None, random_state=42, n_jobs=-1
        ),
        "Decision Tree": DecisionTreeClassifier(random_state=42, max_depth=None),
        "XGBoost": xgb.XGBClassifier(
            n_estimators=200, learning_rate=0.1, random_state=42, eval_metric="logloss"
        ),
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "SVM": SVC(kernel="rbf", probability=True, random_state=42),
    }

    results = {}

    for name, model in models.items():
        logger.info("Training %s ...", name)

        # Train on scaled data for SVM and Logistic Regression
        if isinstance(model, (SVC, LogisticRegression)):
            model.fit(X_train_scaled, y_train)
            y_pred = model.predict(X_test_scaled)
        else:
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)

        # Calculate metrics
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        cm = confusion_matrix(y_test, y_pred).tolist()
        cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring="accuracy").mean()

        results[name] = {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "confusion_matrix": cm,
            "cross_val_accuracy": round(cv_scores, 4),
        }

        logger.info(
            "%s → Accuracy: %.4f | Precision: %.4f | Recall: %.4f | F1: %.4f",
            name, acc, prec, rec, f1,
        )

    return results


def save_best_model(df: pd.DataFrame, results: dict) -> str:
    """
    Select the best model based on F1 score, retrain on all data,
    and save it to disk.
    """
    # Find best model by F1 score
    best_name = max(results, key=lambda k: results[k]["f1_score"])
    logger.info("Best model: %s (F1: %.4f)", best_name, results[best_name]["f1_score"])

    X = df.drop(columns=["label"]).values
    y = df["label"].values

    # Create and train the best model on all data
    if best_name == "Random Forest":
        best_model = RandomForestClassifier(n_estimators=200, max_depth=None, random_state=42, n_jobs=-1)
    elif best_name == "Decision Tree":
        best_model = DecisionTreeClassifier(random_state=42, max_depth=None)
    elif best_name == "XGBoost":
        best_model = xgb.XGBClassifier(
            n_estimators=200, learning_rate=0.1, random_state=42, eval_metric="logloss"
        )
    elif best_name == "Logistic Regression":
        best_model = LogisticRegression(max_iter=1000, random_state=42)
    else:  # SVM
        best_model = SVC(kernel="rbf", probability=True, random_state=42)

    best_model.fit(X, y)

    # Ensure model directory exists
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    # Save the model
    joblib.dump(best_model, MODEL_PATH)
    logger.info("Best model saved to %s", MODEL_PATH)

    # Save metrics including the best model name
    metrics = {
        "best_model": best_name,
        "all_models": results,
    }
    with open(MODEL_METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)
    logger.info("Metrics saved to %s", MODEL_METRICS_PATH)

    return best_name


def main():
    """Run the full training pipeline."""
    logger.info("=" * 60)
    logger.info("PHISHING DETECTION MODEL TRAINING")
    logger.info("=" * 60)

    # Load dataset
    df = load_dataset(DATASET_PATH)

    # Train and evaluate all models
    results = train_models(df)

    # Save the best model
    best_name = save_best_model(df, results)

    # Print summary
    print("\n" + "=" * 60)
    print("MODEL COMPARISON SUMMARY")
    print("=" * 60)
    print(f"\n{'Model':<22} {'Accuracy':<10} {'Precision':<10} {'Recall':<10} {'F1 Score':<10}")
    print("-" * 62)
    for name, m in results.items():
        marker = " ★" if name == best_name else ""
        print(
            f"{name:<22} {m['accuracy']:<10.4f} {m['precision']:<10.4f} "
            f"{m['recall']:<10.4f} {m['f1_score']:<10.4f}{marker}"
        )
    print("-" * 62)
    print(f"\n🏆 Best model: {best_name}")
    print(f"Saved to: {MODEL_PATH}")


if __name__ == "__main__":
    main()