from services.database import get_db_connection
from services.ml_forecasting import ml_forecast_demand


print("Connecting to MySQL...")

connection = get_db_connection()
cursor = connection.cursor(dictionary=True)

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

print(f"Retrieved {len(sales_data)} sales records.")
print()

print("Generating ML forecasts...")

forecasts = ml_forecast_demand(sales_data)

print(f"Generated {len(forecasts)} ML forecasts.")
print()

for forecast in forecasts:
    print(
        f"{forecast['product_name']} "
        f"→ {forecast['predicted_demand']} units "
        f"on {forecast['forecast_date']} "
        f"({forecast['model_name']})"
    )