import pandas as pd


def forecast_demand(sales_data, window=3):
    """
    Generate demand forecasts using a moving average.

    Parameters:
        sales_data: List of sales dictionaries.
        window: Number of recent observations used
                to calculate the average demand.

    Returns:
        List of forecast dictionaries.
    """

    if not sales_data:
        return []


    # Convert sales records into a DataFrame
    df = pd.DataFrame(sales_data)


    # Make sure required columns exist
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


    # Convert dates and quantities
    df["sale_date"] = pd.to_datetime(
        df["sale_date"]
    )

    df["quantity_sold"] = pd.to_numeric(
        df["quantity_sold"],
        errors="coerce"
    )


    # Remove invalid sales records
    df = df.dropna(
        subset=[
            "product_id",
            "sale_date",
            "quantity_sold"
        ]
    )


    # Sort sales chronologically
    df = df.sort_values(
        [
            "product_id",
            "sale_date"
        ]
    )


    forecasts = []


    # Generate forecast for each product
    for product_id, product_df in df.groupby(
        "product_id"
    ):

        product_df = product_df.sort_values(
            "sale_date"
        )


        # Select the most recent observations
        recent_sales = product_df[
            "quantity_sold"
        ].tail(window)


        if recent_sales.empty:
            continue


        # Moving average
        predicted_demand = (
            recent_sales.mean()
        )


        product_name = product_df[
            "product_name"
        ].iloc[-1]


        last_sale_date = product_df[
            "sale_date"
        ].max()


        # Forecast the next day
        forecast_date = (
            last_sale_date +
            pd.Timedelta(days=1)
        )


        forecasts.append({

            "product_id":
                int(product_id),

            "product_name":
                product_name,

            "forecast_date":
                forecast_date.strftime(
                    "%Y-%m-%d"
                ),

            "predicted_demand":
                round(
                    float(predicted_demand),
                    2
                ),

            "model_name":
                f"Moving Average ({window})"

        })


    return forecasts