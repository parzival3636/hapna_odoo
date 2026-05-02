"""
Generate synthetic training data and train the no-show RandomForest model.
Run this ONCE before the hackathon: python train_model.py
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
from pathlib import Path


def generate_synthetic_data(n=1000):
    """Generate realistic booking data with no-show patterns."""
    np.random.seed(42)
    data = []

    for _ in range(n):
        lead_time = np.random.exponential(72)  # avg 3 days
        day_of_week = np.random.randint(0, 7)
        time_bucket = np.random.choice([0, 1, 2], p=[0.4, 0.35, 0.25])
        customer_count = np.random.poisson(3)
        customer_cancel_rate = np.random.beta(2, 8)
        customer_no_show_rate = np.random.beta(1.5, 10)
        service_cancel_rate = np.random.beta(2, 10)
        channel = np.random.choice([0, 1, 2], p=[0.7, 0.2, 0.1])
        paid = np.random.choice([0, 1], p=[0.4, 0.6])

        # No-show probability based on realistic patterns
        prob = 0.15  # base rate
        if lead_time > 168:  # > 1 week
            prob += 0.15
        if lead_time < 24:  # same day
            prob -= 0.10
        if paid:
            prob -= 0.12
        if customer_cancel_rate > 0.3:
            prob += 0.20
        if customer_no_show_rate > 0.2:
            prob += 0.25
        if customer_count > 5:
            prob -= 0.08  # repeat customers show up
        if time_bucket == 2:  # evening
            prob += 0.08
        if channel == 2:  # voice
            prob += 0.05

        prob = np.clip(prob, 0.02, 0.95)
        outcome = 1 if np.random.random() < prob else 0

        data.append([
            lead_time, day_of_week, time_bucket, customer_count,
            customer_cancel_rate, customer_no_show_rate, service_cancel_rate,
            channel, paid, outcome,
        ])

    columns = [
        'lead_time_hours', 'day_of_week', 'time_of_day_bucket',
        'customer_booking_count', 'customer_cancellation_rate',
        'customer_no_show_rate', 'service_cancellation_rate',
        'booking_channel', 'payment_status', 'outcome',
    ]
    return pd.DataFrame(data, columns=columns)


def train():
    df = generate_synthetic_data(1000)
    X = df.drop('outcome', axis=1)
    y = df['outcome']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(
        n_estimators=100,
        class_weight='balanced',
        random_state=42,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    print("\n=== Classification Report ===")
    print(classification_report(y_test, y_pred, target_names=['Show', 'No-Show']))

    # Feature importance
    print("\n=== Feature Importance ===")
    for name, imp in sorted(zip(X.columns, model.feature_importances_), key=lambda x: -x[1]):
        print(f"  {name}: {imp:.3f}")

    # Save model
    model_path = Path(__file__).parent / 'no_show_model.pkl'
    joblib.dump(model, model_path)
    print(f"\nModel saved to {model_path}")


if __name__ == '__main__':
    train()
