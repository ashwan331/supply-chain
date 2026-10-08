from services.database import get_db_connection
from services.forecasting import forecast_demand


def main():

    print("Connecting to MySQL...")

    connection = get_db_connection()

    cursor = connection.cursor(
        dictionary=True
    )


    # ------------------------------------------------------------
    # 1. Get sales history
    # ------------------------------------------------------------

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


    print(
        f"Retrieved {len(sales_data)} sales records."
    )


    # ------------------------------------------------------------
    # 2. Generate forecasts using Python
    # ------------------------------------------------------------

    forecasts = forecast_demand(
        sales_data,
        window=3
    )


    print(
        f"Generated {len(forecasts)} forecasts."
    )


    # ------------------------------------------------------------
    # 3. Remove old forecast results
    # ------------------------------------------------------------

    cursor.execute(
        "DELETE FROM forecasts"
    )


    print(
        "Old forecast records cleared."
    )


    # ------------------------------------------------------------
    # 4. Insert new Python-generated forecasts
    # ------------------------------------------------------------

    insert_query = """
        INSERT INTO forecasts
        (
            product_id,
            forecast_date,
            predicted_demand,
            model_name
        )
        VALUES
        (
            %s,
            %s,
            %s,
            %s
        )
    """


    for forecast in forecasts:

        values = (
            forecast["product_id"],
            forecast["forecast_date"],
            forecast["predicted_demand"],
            forecast["model_name"]
        )


        cursor.execute(
            insert_query,
            values
        )


    # ------------------------------------------------------------
    # 5. Save changes
    # ------------------------------------------------------------

    connection.commit()


    cursor.close()

    connection.close()


    print(
        "Forecasts successfully saved to MySQL."
    )


    print(
        "\nGenerated Forecasts:"
    )


    for forecast in forecasts:

        print(
            f"{forecast['product_name']} "
            f"→ "
            f"{forecast['predicted_demand']} units "
            f"on "
            f"{forecast['forecast_date']}"
        )


    print(
        "\nForecast generation completed successfully."
    )


if __name__ == "__main__":
    main()