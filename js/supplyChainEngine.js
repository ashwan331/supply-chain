/**
 * Supply Chain Engine
 * Connects the frontend Supply Chain Studio
 * with the Flask backend inventory optimization API.
 */

const SupplyChainEngine = {

    API_BASE_URL: "http://127.0.0.1:5000",

    /**
     * Fetch real inventory optimization data
     * from the Flask backend.
     */
    async fetchOptimization() {

        try {

            const response = await fetch(
                `${this.API_BASE_URL}/api/inventory/optimization`
            );

            if (!response.ok) {
                throw new Error(
                    `Backend returned ${response.status}`
                );
            }

            const data = await response.json();

            return data;

        } catch (error) {

            console.error(
                "Inventory optimization API error:",
                error
            );

            return {
                message: "Unable to connect to backend",
                recommendation_count: 0,
                recommendations: []
            };
        }
    },


    /**
     * Fetch combined supply-chain analytics
     * from the Flask backend.
     */
    async fetchAnalytics() {

        try {

            const response = await fetch(
                `${this.API_BASE_URL}/api/supply-chain-analytics`
            );

            if (!response.ok) {
                throw new Error(
                    `Backend returned ${response.status}`
                );
            }

            return await response.json();

        } catch (error) {

            console.error(
                "Supply chain analytics API error:",
                error
            );

            return {
                sales: {},
                inventory: {},
                forecast: {}
            };
        }
    },


    /**
     * Fetch the latest forecasts.
     */
    async fetchForecasts() {

        try {

            const response = await fetch(
                `${this.API_BASE_URL}/api/forecasts`
            );

            if (!response.ok) {
                throw new Error(
                    `Backend returned ${response.status}`
                );
            }

            return await response.json();

        } catch (error) {

            console.error(
                "Forecast API error:",
                error
            );

            return [];
        }
    },


    /**
     * Build the Supply Chain Studio analysis
     * using real backend data.
     */
    async analyzeBackendData() {

        const [
            optimizationData,
            analyticsData,
            forecasts
        ] = await Promise.all([
            this.fetchOptimization(),
            this.fetchAnalytics(),
            this.fetchForecasts()
        ]);

        const recommendations =
            optimizationData.recommendations || [];

        const sales =
            analyticsData.sales || {};

        const inventory =
            analyticsData.inventory || {};

        const forecast =
            analyticsData.forecast || {};

        const items = recommendations.map(
            (item) => {

                const currentStock =
                    Number(item.current_stock) || 0;

                const predictedDemand =
                    Number(item.predicted_demand) || 0;

                const reorderLevel =
                    Number(item.reorder_level) || 0;

                const reorderQuantity =
                    Number(item.reorder_quantity) || 0;

                const stockAfterForecast =
                    Number(
                        item.stock_after_forecast
                    ) || 0;

                let status =
                    item.status || "Healthy";

                let statusClass =
                    "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";

                if (status === "Critical") {

                    statusClass =
                        "text-rose-400 bg-rose-500/10 border-rose-500/30";

                } else if (
                    status === "Reorder Soon"
                ) {

                    statusClass =
                        "text-amber-400 bg-amber-500/10 border-amber-500/30";
                }

                return {

                    itemId:
                        item.product_id,

                    name:
                        item.product_name,

                    category:
                        item.category,

                    stock:
                        currentStock,

                    dailyDemand:
                        predictedDemand,

                    predictedDemand:
                        predictedDemand,

                    stockAfterForecast:
                        stockAfterForecast,

                    reorderLevel:
                        reorderLevel,

                    reorderQuantity:
                        reorderQuantity,

                    recommendedOrderQuantity:
                        Number(
                            item.recommended_order_quantity
                        ) || 0,

                    forecastDate:
                        item.forecast_date,

                    modelName:
                        item.model_name,

                    safetyStock:
                        reorderLevel,

                    reorderPoint:
                        reorderLevel,

                    eoq:
                        reorderQuantity,

                    totalValue:
                        0,

                    status:
                        status,

                    statusClass:
                        statusClass
                };
            }
        );


        /*
         * ABC classification.
         *
         * The backend currently does not calculate
         * inventory monetary value, so classification
         * is based on current stock quantity.
         */
        const sortedItems =
            [...items].sort(
                (a, b) =>
                    b.stock - a.stock
            );

        const totalStock =
            sortedItems.reduce(
                (total, item) =>
                    total + item.stock,
                0
            );

        let cumulativeStock = 0;

        let countA = 0;
        let countB = 0;
        let countC = 0;

        let valueA = 0;
        let valueB = 0;
        let valueC = 0;


        sortedItems.forEach(
            (item) => {

                cumulativeStock +=
                    item.stock;

                const ratio =
                    totalStock > 0
                        ? cumulativeStock /
                          totalStock
                        : 0;

                if (ratio <= 0.80) {

                    item.abcClass = "A";

                    countA++;

                    valueA += item.stock;

                } else if (
                    ratio <= 0.95
                ) {

                    item.abcClass = "B";

                    countB++;

                    valueB += item.stock;

                } else {

                    item.abcClass = "C";

                    countC++;

                    valueC += item.stock;
                }
            }
        );


        /*
         * Create 30-day forecast data from
         * the actual ML forecast.
         *
         * The backend currently provides one
         * next-day forecast per product.
         */
        const forecastLabels =
            forecasts.map(
                item =>
                    item.forecast_date
            );

        const forecastValues =
            forecasts.map(
                item =>
                    Number(
                        item.predicted_demand
                    ) || 0
            );


        /*
         * Calculate basic forecast bounds
         * around the real ML prediction.
         */
        const upperBounds =
            forecastValues.map(
                value =>
                    Math.round(
                        value * 1.15
                    )
            );

        const lowerBounds =
            forecastValues.map(
                value =>
                    Math.max(
                        0,
                        Math.round(
                            value * 0.85
                        )
                    )
            );


        /*
         * Count products requiring action.
         */
        const criticalAlertsCount =
            items.filter(
                item =>
                    item.status === "Critical" ||
                    item.status === "Reorder Soon"
            ).length;


        /*
         * Return a structure compatible with
         * the existing Supply Chain dashboard.
         */
        return {

            items:

                items,

            totalItems:

                items.length,

            totalStockUnits:

                Number(
                    inventory.total_stock_units
                ) || 0,

            totalInventoryValue:

                0,

            criticalAlertsCount:

                criticalAlertsCount,

            totalOrders:

                Number(
                    sales.total_orders
                ) || 0,

            totalUnitsSold:

                Number(
                    sales.total_units_sold
                ) || 0,

            totalRevenue:

                Number(
                    sales.total_revenue
                ) || 0,

            averageOrderValue:

                Number(
                    sales.average_order_value
                ) || 0,

            bestSellingProduct:

                sales.best_selling_product ||
                "N/A",

            totalPredictedDemand:

                Number(
                    forecast.total_predicted_demand
                ) || 0,

            averagePredictedDemand:

                Number(
                    forecast.average_predicted_demand
                ) || 0,

            forecastCount:

                Number(
                    forecast.forecast_count
                ) || 0,

            abcSummary: {

                classA: {

                    count:
                        countA,

                    value:
                        valueA,

                    pct:
                        totalStock > 0
                            ? (
                                valueA /
                                totalStock
                            ) * 100
                            : 0
                },

                classB: {

                    count:
                        countB,

                    value:
                        valueB,

                    pct:
                        totalStock > 0
                            ? (
                                valueB /
                                totalStock
                            ) * 100
                            : 0
                },

                classC: {

                    count:
                        countC,

                    value:
                        valueC,

                    pct:
                        totalStock > 0
                            ? (
                                valueC /
                                totalStock
                            ) * 100
                            : 0
                }
            },

            forecast: {

                labels:
                    forecastLabels,

                forecastValues:
                    forecastValues,

                upperBounds:
                    upperBounds,

                lowerBounds:
                    lowerBounds
            }
        };
    },


    /**
     * Legacy local-data analysis method.
     *
     * Kept so the rest of the existing frontend
     * does not break if another view calls it.
     */
    analyze(data) {

        if (
            !Array.isArray(data) ||
            data.length === 0
        ) {
            return this.emptyAnalysis();
        }


        const items = data.map(
            (r, idx) => {

                const itemId =
                    r.Item_ID ||
                    r.SKU ||
                    r.Product_ID ||
                    `SKU-${1000 + idx}`;

                const name =
                    r.Product_Name ||
                    r.Product ||
                    r.Item ||
                    `Product ${idx + 1}`;

                const stock =
                    Number(
                        r.Stock_Level ||
                        r.Stock ||
                        r.Quantity ||
                        r.Units_Sold
                    ) || 0;

                const dailyDemand =
                    Number(
                        r.Daily_Demand ||
                        r.Demand ||
                        r.Quantity_Sold
                    ) || 0;

                const leadTime =
                    Number(
                        r.Lead_Time_Days ||
                        r.Lead_Time
                    ) || 7;

                const unitCost =
                    Number(
                        r.Unit_Cost ||
                        r.Price ||
                        r.Unit_Price
                    ) || 25;

                const demandStdDev =
                    dailyDemand * 0.25;

                const safetyStock =
                    Math.ceil(
                        1.65 *
                        demandStdDev *
                        Math.sqrt(
                            leadTime
                        )
                    );

                const reorderPoint =
                    Math.ceil(
                        (
                            dailyDemand *
                            leadTime
                        ) +
                        safetyStock
                    );

                const annualDemand =
                    dailyDemand * 365;

                const orderCost =
                    50;

                const holdingCost =
                    unitCost * 0.20;

                const eoq =
                    holdingCost > 0
                        ? Math.ceil(
                            Math.sqrt(
                                (
                                    2 *
                                    annualDemand *
                                    orderCost
                                ) /
                                holdingCost
                            )
                        )
                        : 100;

                let status =
                    "Optimal";

                let statusClass =
                    "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";


                if (
                    stock <= safetyStock
                ) {

                    status =
                        "CRITICAL STOCKOUT RISK";

                    statusClass =
                        "text-rose-400 bg-rose-500/10 border-rose-500/30";

                } else if (
                    stock <= reorderPoint
                ) {

                    status =
                        "REORDER NEEDED";

                    statusClass =
                        "text-amber-400 bg-amber-500/10 border-amber-500/30";

                } else if (
                    stock >
                    reorderPoint * 3
                ) {

                    status =
                        "OVERSTOCKED";

                    statusClass =
                        "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
                }


                return {

                    itemId,
                    name,
                    stock,
                    dailyDemand,
                    leadTime,
                    unitCost,
                    safetyStock,
                    reorderPoint,
                    eoq,
                    totalValue:
                        stock * unitCost,
                    status,
                    statusClass
                };
            }
        );


        items.sort(
            (a, b) =>
                b.totalValue -
                a.totalValue
        );


        const totalInventoryValue =
            items.reduce(
                (total, item) =>
                    total +
                    item.totalValue,
                0
            );


        let cumulativeValue = 0;

        let countA = 0;
        let countB = 0;
        let countC = 0;

        let valueA = 0;
        let valueB = 0;
        let valueC = 0;


        items.forEach(
            (item) => {

                cumulativeValue +=
                    item.totalValue;

                const ratio =
                    totalInventoryValue > 0
                        ? cumulativeValue /
                          totalInventoryValue
                        : 0;


                if (ratio <= 0.80) {

                    item.abcClass = "A";

                    countA++;

                    valueA +=
                        item.totalValue;

                } else if (
                    ratio <= 0.95
                ) {

                    item.abcClass = "B";

                    countB++;

                    valueB +=
                        item.totalValue;

                } else {

                    item.abcClass = "C";

                    countC++;

                    valueC +=
                        item.totalValue;
                }
            }
        );


        const forecast =
            this.generateDemandForecast(
                items
            );


        const totalItems =
            items.length;

        const totalStockUnits =
            items.reduce(
                (total, item) =>
                    total +
                    item.stock,
                0
            );

        const criticalAlertsCount =
            items.filter(
                item =>
                    item.status.includes(
                        "RISK"
                    ) ||
                    item.status.includes(
                        "REORDER"
                    )
            ).length;


        return {

            items,

            totalItems,

            totalStockUnits,

            totalInventoryValue,

            criticalAlertsCount,

            abcSummary: {

                classA: {
                    count: countA,
                    value: valueA,
                    pct:
                        totalInventoryValue > 0
                            ? (
                                valueA /
                                totalInventoryValue
                            ) * 100
                            : 0
                },

                classB: {
                    count: countB,
                    value: valueB,
                    pct:
                        totalInventoryValue > 0
                            ? (
                                valueB /
                                totalInventoryValue
                            ) * 100
                            : 0
                },

                classC: {
                    count: countC,
                    value: valueC,
                    pct:
                        totalInventoryValue > 0
                            ? (
                                valueC /
                                totalInventoryValue
                            ) * 100
                            : 0
                }
            },

            forecast
        };
    },


    /**
     * Generate local forecast for legacy
     * frontend datasets.
     */
    generateDemandForecast(items) {

        const totalDailyDemand =
            items.reduce(
                (total, item) =>
                    total +
                    (
                        Number(
                            item.dailyDemand
                        ) || 0
                    ),
                0
            );


        const labels = [];

        const forecastValues = [];

        const upperBounds = [];

        const lowerBounds = [];


        const today =
            new Date();


        const baseDemand =
            totalDailyDemand || 100;


        for (
            let day = 1;
            day <= 30;
            day++
        ) {

            const nextDate =
                new Date(today);

            nextDate.setDate(
                today.getDate() + day
            );


            labels.push(
                nextDate
                    .toISOString()
                    .split("T")[0]
            );


            const pointVal =
                Math.round(
                    baseDemand
                );


            forecastValues.push(
                pointVal
            );


            upperBounds.push(
                Math.round(
                    pointVal * 1.15
                )
            );


            lowerBounds.push(
                Math.max(
                    0,
                    Math.round(
                        pointVal * 0.85
                    )
                )
            );
        }


        return {

            labels,

            forecastValues,

            upperBounds,

            lowerBounds
        };
    },


    /**
     * Empty analysis fallback.
     */
    emptyAnalysis() {

        return {

            items: [],

            totalItems: 0,

            totalStockUnits: 0,

            totalInventoryValue: 0,

            criticalAlertsCount: 0,

            totalOrders: 0,

            totalUnitsSold: 0,

            totalRevenue: 0,

            averageOrderValue: 0,

            bestSellingProduct: "N/A",

            totalPredictedDemand: 0,

            averagePredictedDemand: 0,

            forecastCount: 0,

            abcSummary: {

                classA: {
                    count: 0,
                    value: 0,
                    pct: 0
                },

                classB: {
                    count: 0,
                    value: 0,
                    pct: 0
                },

                classC: {
                    count: 0,
                    value: 0,
                    pct: 0
                }
            },

            forecast: {

                labels: [],

                forecastValues: [],

                upperBounds: [],

                lowerBounds: []
            }
        };
    }
};