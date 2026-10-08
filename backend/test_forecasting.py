from services.database import get_db_connection
from services.forecasting import forecast_demand


def main():

    print("Connecting to MySQL...")

    connection = get_db_connection()

    cursor = connection.cursor(
        dictionary=True
    )


    query = """
        SELECT
            s.product_id,
            p.product_name,
            s.sale_date,
            s.quantity_sold
        FROM sales s
        JOIN products p
            ON s.product_id = p.product_id
        ORDER BY
            s.product_id,
            s.sale_date;
    """


    cursor.execute(query)

    sales_data = cursor.fetchall()


    cursor.close()
    connection.close()


    print(
        f"Retrieved {len(sales_data)} sales records."
    )


    print(
        "\nGenerating forecasts..."
    )


    forecasts = forecast_demand(
        sales_data,
        window=3
    )


    print(
        f"Generated {len(forecasts)} forecasts.\n"
    )


    for forecast in forecasts:

        print(
            f"Product: "
            f"{forecast['product_name']}"
        )

        print(
            f"Forecast Date: "
            f"{forecast['forecast_date']}"
        )

        print(
            f"Predicted Demand: "
            f"{forecast['predicted_demand']}"
        )

        print(
            f"Model: "
            f"{forecast['model_name']}"
        )

        print(
            "-" * 40
        )


if __name__ == "__main__":
    main()