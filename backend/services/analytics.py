def calculate_sales_analytics(sales_data):
    """
    Calculate sales and revenue analytics.
    """

    if not sales_data:
        return {
            "total_orders": 0,
            "total_units_sold": 0,
            "total_revenue": 0,
            "average_order_value": 0,
            "best_selling_product": None
        }

    total_orders = len(sales_data)

    total_units_sold = sum(
        float(row["quantity_sold"])
        for row in sales_data
    )

    total_revenue = sum(
        float(row["total_amount"])
        for row in sales_data
    )

    average_order_value = (
        total_revenue / total_orders
        if total_orders > 0
        else 0
    )

    product_sales = {}

    for row in sales_data:

        product_name = row["product_name"]

        quantity = float(
            row["quantity_sold"]
        )

        product_sales[product_name] = (
            product_sales.get(
                product_name,
                0
            ) + quantity
        )

    best_selling_product = max(
        product_sales,
        key=product_sales.get
    )

    return {
        "total_orders": total_orders,
        "total_units_sold": round(
            total_units_sold,
            2
        ),
        "total_revenue": round(
            total_revenue,
            2
        ),
        "average_order_value": round(
            average_order_value,
            2
        ),
        "best_selling_product":
            best_selling_product
    }


def calculate_inventory_analytics(
    inventory_data
):
    """
    Calculate inventory-related analytics.
    """

    if not inventory_data:
        return {
            "total_inventory_items": 0,
            "total_stock_units": 0,
            "low_stock_products": 0,
            "critical_stock_products": 0,
            "lowest_stock_product": None
        }

    total_inventory_items = len(
        inventory_data
    )

    total_stock_units = sum(
        float(row["current_stock"])
        for row in inventory_data
    )

    low_stock_products = 0
    critical_stock_products = 0

    lowest_stock_product = min(
        inventory_data,
        key=lambda row: float(
            row["current_stock"]
        )
    )

    for row in inventory_data:

        current_stock = float(
            row["current_stock"]
        )

        reorder_level = float(
            row["reorder_level"]
        )

        if current_stock <= reorder_level:
            low_stock_products += 1

        if current_stock <= (
            reorder_level * 0.5
        ):
            critical_stock_products += 1

    return {
        "total_inventory_items":
            total_inventory_items,

        "total_stock_units":
            round(
                total_stock_units,
                2
            ),

        "low_stock_products":
            low_stock_products,

        "critical_stock_products":
            critical_stock_products,

        "lowest_stock_product": {
            "product_name":
                lowest_stock_product[
                    "product_name"
                ],

            "current_stock":
                float(
                    lowest_stock_product[
                        "current_stock"
                    ]
                )
        }
    }


def calculate_forecast_analytics(
    forecasts
):
    """
    Calculate forecast-related analytics.
    """

    if not forecasts:
        return {
            "forecast_count": 0,
            "total_predicted_demand": 0,
            "average_predicted_demand": 0
        }

    predicted_values = [
        float(
            row["predicted_demand"]
        )
        for row in forecasts
    ]

    total_predicted_demand = sum(
        predicted_values
    )

    average_predicted_demand = (
        total_predicted_demand
        / len(predicted_values)
    )

    return {
        "forecast_count": len(
            forecasts
        ),

        "total_predicted_demand":
            round(
                total_predicted_demand,
                2
            ),

        "average_predicted_demand":
            round(
                average_predicted_demand,
                2
            )
    }


def calculate_supply_chain_analytics(
    sales_data,
    inventory_data,
    forecasts
):
    """
    Combine sales, inventory and forecast
    analytics into one result.
    """

    sales_analytics = (
        calculate_sales_analytics(
            sales_data
        )
    )

    inventory_analytics = (
        calculate_inventory_analytics(
            inventory_data
        )
    )

    forecast_analytics = (
        calculate_forecast_analytics(
            forecasts
        )
    )

    return {
        "sales": sales_analytics,
        "inventory": inventory_analytics,
        "forecast": forecast_analytics
    }