from flask import Flask, request
from flask_cors import CORS
import os
import json

from google import genai
from google.genai import types

from services.database import get_db_connection
from services.forecasting import forecast_demand
from services.ml_forecasting import ml_forecast_demand
from services.inventory_optimization import optimize_inventory
from services.analytics import calculate_supply_chain_analytics


app = Flask(__name__)

CORS(app)


# ============================================================
# BASIC ROUTES
# ============================================================

@app.route("/")
def home():
    return "Supply Chain Backend is running!"


@app.route("/test-db")
def test_db():

    connection = None

    try:

        connection = get_db_connection()

        if connection.is_connected():

            return "MySQL connection successful!"

        return "MySQL connection failed!"

    except Exception as e:

        return f"MySQL connection failed: {e}"

    finally:

        if connection:
            connection.close()


# ============================================================
# PRODUCTS
# ============================================================

@app.route("/api/products")
def get_products():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )

        cursor.execute(
            "SELECT * FROM products"
        )

        products = cursor.fetchall()

        return products

    except Exception as e:

        return {
            "error": str(e)
        }, 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ============================================================
# SALES
# ============================================================

@app.route("/api/sales")
def get_sales():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )

        query = """
            SELECT
                s.sale_id,
                s.product_id,
                p.product_name,
                s.sale_date,
                s.quantity_sold,
                s.unit_price,
                s.total_amount
            FROM sales s
            JOIN products p
                ON s.product_id = p.product_id
            ORDER BY s.sale_date;
        """

        cursor.execute(query)

        sales = cursor.fetchall()

        return sales

    except Exception as e:

        return {
            "error": str(e)
        }, 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ============================================================
# INVENTORY
# ============================================================

@app.route("/api/inventory")
def get_inventory():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )

        query = """
            SELECT
                i.inventory_id,
                i.product_id,
                p.product_name,
                p.category,
                i.current_stock,
                i.reorder_level,
                i.reorder_quantity,
                i.last_updated
            FROM inventory i
            JOIN products p
                ON i.product_id = p.product_id
            ORDER BY i.current_stock ASC;
        """

        cursor.execute(query)

        inventory = cursor.fetchall()

        return inventory

    except Exception as e:

        return {
            "error": str(e)
        }, 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ============================================================
# SUPPLIERS
# ============================================================

@app.route("/api/suppliers")
def get_suppliers():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )

        cursor.execute(
            "SELECT * FROM suppliers"
        )

        suppliers = cursor.fetchall()

        return suppliers

    except Exception as e:

        return {
            "error": str(e)
        }, 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ============================================================
# FORECASTS
# ============================================================

@app.route("/api/forecasts")
def get_forecasts():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )

        query = """
            SELECT
                f.forecast_id,
                f.product_id,
                p.product_name,
                f.forecast_date,
                f.predicted_demand,
                f.model_name,
                f.created_at
            FROM forecasts f
            JOIN products p
                ON f.product_id = p.product_id
            ORDER BY f.forecast_date;
        """

        cursor.execute(query)

        forecasts = cursor.fetchall()

        return forecasts

    except Exception as e:

        return {
            "error": str(e)
        }, 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ============================================================
# BASIC SALES ANALYTICS
# ============================================================

@app.route("/api/analytics")
def get_analytics():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )

        query = """
            SELECT
                COUNT(*) AS total_orders,
                SUM(quantity_sold) AS total_units_sold,
                SUM(total_amount) AS total_revenue,
                AVG(total_amount) AS average_order_value
            FROM sales;
        """

        cursor.execute(query)

        analytics = cursor.fetchone()

        return analytics

    except Exception as e:

        return {
            "error": str(e)
        }, 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ============================================================
# MOVING AVERAGE FORECAST
# ============================================================

@app.route(
    "/api/forecasts/generate",
    methods=["POST"]
)
def generate_forecasts():

    connection = None
    cursor = None

    try:

        print(
            "Starting forecast generation..."
        )

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

        print(
            f"Retrieved {len(sales_data)} sales records."
        )

        forecasts = forecast_demand(
            sales_data,
            window=3
        )

        print(
            f"Generated {len(forecasts)} forecasts."
        )

        cursor.execute(
            "DELETE FROM forecasts"
        )

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

        connection.commit()

        return {
            "message":
                "Forecasts generated successfully",
            "forecast_count":
                len(forecasts),
            "forecasts":
                forecasts
        }

    except Exception as e:

        if connection:
            connection.rollback()

        return {
            "error": str(e)
        }, 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ============================================================
# RANDOM FOREST ML FORECAST
# ============================================================

@app.route(
    "/api/forecasts/generate-ml",
    methods=["POST"]
)
def generate_ml_forecasts():

    connection = None
    cursor = None

    try:

        print(
            "Starting ML forecast generation..."
        )

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

        print(
            f"Retrieved {len(sales_data)} sales records."
        )

        forecasts = ml_forecast_demand(
            sales_data
        )

        print(
            f"Generated {len(forecasts)} ML forecasts."
        )

        cursor.execute(
            "DELETE FROM forecasts"
        )

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

        connection.commit()

        print(
            "ML forecasts saved to MySQL."
        )

        return {
            "message":
                "ML forecasts generated successfully",
            "forecast_count":
                len(forecasts),
            "model":
                "Random Forest Regression",
            "forecasts":
                forecasts
        }

    except Exception as e:

        if connection:
            connection.rollback()

        return {
            "error": str(e)
        }, 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ============================================================
# INVENTORY OPTIMIZATION
# ============================================================

@app.route(
    "/api/inventory/optimization"
)
def inventory_optimization():

    connection = None
    cursor = None

    try:

        print(
            "Generating inventory optimization..."
        )

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )

        inventory_query = """
            SELECT
                i.inventory_id,
                i.product_id,
                p.product_name,
                p.category,
                i.current_stock,
                i.reorder_level,
                i.reorder_quantity,
                i.last_updated
            FROM inventory i
            JOIN products p
                ON i.product_id = p.product_id
            ORDER BY i.product_id;
        """

        cursor.execute(
            inventory_query
        )

        inventory_data = cursor.fetchall()

        forecast_query = """
            SELECT
                f.forecast_id,
                f.product_id,
                p.product_name,
                f.forecast_date,
                f.predicted_demand,
                f.model_name,
                f.created_at
            FROM forecasts f
            JOIN products p
                ON f.product_id = p.product_id
            ORDER BY f.forecast_date;
        """

        cursor.execute(
            forecast_query
        )

        forecasts = cursor.fetchall()

        recommendations = optimize_inventory(
            inventory_data,
            forecasts
        )

        return {
            "message":
                "Inventory optimization generated successfully",
            "recommendation_count":
                len(recommendations),
            "recommendations":
                recommendations
        }

    except Exception as e:

        return {
            "error": str(e)
        }, 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ============================================================
# SUPPLY CHAIN ANALYTICS
# ============================================================

@app.route(
    "/api/supply-chain-analytics"
)
def supply_chain_analytics():

    connection = None
    cursor = None

    try:

        print(
            "Generating supply chain analytics..."
        )

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )

        sales_query = """
            SELECT
                s.sale_id,
                s.product_id,
                p.product_name,
                s.sale_date,
                s.quantity_sold,
                s.unit_price,
                s.total_amount
            FROM sales s
            JOIN products p
                ON s.product_id = p.product_id
            ORDER BY s.sale_date;
        """

        cursor.execute(
            sales_query
        )

        sales_data = cursor.fetchall()

        inventory_query = """
            SELECT
                i.inventory_id,
                i.product_id,
                p.product_name,
                p.category,
                i.current_stock,
                i.reorder_level,
                i.reorder_quantity,
                i.last_updated
            FROM inventory i
            JOIN products p
                ON i.product_id = p.product_id
            ORDER BY i.product_id;
        """

        cursor.execute(
            inventory_query
        )

        inventory_data = cursor.fetchall()

        forecast_query = """
            SELECT
                f.forecast_id,
                f.product_id,
                p.product_name,
                f.forecast_date,
                f.predicted_demand,
                f.model_name,
                f.created_at
            FROM forecasts f
            JOIN products p
                ON f.product_id = p.product_id
            ORDER BY f.forecast_date;
        """

        cursor.execute(
            forecast_query
        )

        forecasts = cursor.fetchall()

        analytics = calculate_supply_chain_analytics(
            sales_data,
            inventory_data,
            forecasts
        )

        return analytics

    except Exception as e:

        return {
            "error": str(e)
        }, 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()





# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    app.run(
        debug=True
    )