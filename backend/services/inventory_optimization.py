def calculate_inventory_optimization(
    current_stock,
    predicted_demand,
    reorder_level,
    reorder_quantity
):
    """
    Calculate inventory status and reorder recommendation.
    """

    current_stock = float(current_stock)
    predicted_demand = float(predicted_demand)
    reorder_level = float(reorder_level)
    reorder_quantity = float(reorder_quantity)

    stock_after_forecast = current_stock - predicted_demand

    if current_stock <= reorder_level:
        status = "Critical"
        reorder_required = True

    elif stock_after_forecast <= reorder_level:
        status = "Reorder Soon"
        reorder_required = True

    else:
        status = "Healthy"
        reorder_required = False

    if reorder_required:
        recommended_order_quantity = reorder_quantity
    else:
        recommended_order_quantity = 0

    return {
        "current_stock": round(current_stock, 2),
        "predicted_demand": round(predicted_demand, 2),
        "stock_after_forecast": round(
            stock_after_forecast,
            2
        ),
        "reorder_level": round(
            reorder_level,
            2
        ),
        "reorder_quantity": round(
            reorder_quantity,
            2
        ),
        "status": status,
        "reorder_required": reorder_required,
        "recommended_order_quantity": round(
            recommended_order_quantity,
            2
        )
    }


def optimize_inventory(inventory_data, forecasts):
    """
    Combine inventory data with ML forecasts
    and generate optimization recommendations.
    """

    forecast_map = {}

    for forecast in forecasts:
        product_id = int(
            forecast["product_id"]
        )

        forecast_map[product_id] = forecast

    recommendations = []

    for item in inventory_data:

        product_id = int(
            item["product_id"]
        )

        forecast = forecast_map.get(product_id)

        if not forecast:
            continue

        result = calculate_inventory_optimization(
            current_stock=item["current_stock"],
            predicted_demand=forecast[
                "predicted_demand"
            ],
            reorder_level=item["reorder_level"],
            reorder_quantity=item["reorder_quantity"]
        )

        result.update({
            "product_id": product_id,
            "product_name": item["product_name"],
            "category": item["category"],
            "forecast_date": forecast[
                "forecast_date"
            ],
            "model_name": forecast[
                "model_name"
            ]
        })

        recommendations.append(result)

    return recommendations