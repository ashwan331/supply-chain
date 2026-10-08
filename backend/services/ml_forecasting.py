import pandas as pd
from sklearn.ensemble import RandomForestRegressor


def ml_forecast_demand(sales_data):
    """
    Generate demand forecasts using Random Forest Regression.

    Expected input columns:
    product_id
    product_name
    sale_date
    quantity_sold
    """

    if not sales_data:
        return []

    df = pd.DataFrame(sales_data)

    required_columns = [
        "product_id",
        "product_name",
        "sale_date",
        "quantity_sold"
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {missing_columns}"
        )

    # Convert data types
    df["sale_date"] = pd.to_datetime(df["sale_date"])

    df["quantity_sold"] = pd.to_numeric(
        df["quantity_sold"],
        errors="coerce"
    )

    # Remove invalid records
    df = df.dropna(
        subset=[
            "product_id",
            "sale_date",
            "quantity_sold"
        ]
    )

    df = df.sort_values(
        ["product_id", "sale_date"]
    )

    forecasts = []

    # Train a separate model for each product
    for product_id, product_df in df.groupby("product_id"):

        product_df = product_df.sort_values("sale_date").copy()

        # Need enough observations for training
        if len(product_df) < 3:
            continue

        # Feature engineering
        product_df["day_of_week"] = (
            product_df["sale_date"].dt.dayofweek
        )

        product_df["day_of_month"] = (
            product_df["sale_date"].dt.day
        )

        product_df["previous_demand"] = (
            product_df["quantity_sold"].shift(1)
        )

        product_df["rolling_average"] = (
            product_df["quantity_sold"]
            .rolling(window=2)
            .mean()
        )

        # Remove rows created with missing lag/rolling values
        training_df = product_df.dropna(
            subset=[
                "previous_demand",
                "rolling_average"
            ]
        )

        if len(training_df) < 2:
            continue

        # ML features
        features = [
            "day_of_week",
            "day_of_month",
            "previous_demand",
            "rolling_average"
        ]

        X = training_df[features]
        y = training_df["quantity_sold"]

        # Random Forest model
        model = RandomForestRegressor(
            n_estimators=100,
            random_state=42
        )

        model.fit(X, y)

        # Create next-day prediction features
        last_date = product_df["sale_date"].max()
        forecast_date = last_date + pd.Timedelta(days=1)

        last_demand = product_df["quantity_sold"].iloc[-1]

        recent_average = (
            product_df["quantity_sold"]
            .tail(2)
            .mean()
        )

        future_features = pd.DataFrame([
            {
                "day_of_week": forecast_date.dayofweek,
                "day_of_month": forecast_date.day,
                "previous_demand": last_demand,
                "rolling_average": recent_average
            }
        ])

        predicted_demand = model.predict(
            future_features
        )[0]

        product_name = product_df[
            "product_name"
        ].iloc[-1]

        forecasts.append({
            "product_id": int(product_id),
            "product_name": product_name,
            "forecast_date": forecast_date.strftime("%Y-%m-%d"),
            "predicted_demand": round(
                float(max(0, predicted_demand)),
                2
            ),
            "model_name": "Random Forest Regression"
        })

    return forecasts