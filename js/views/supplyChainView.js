/**
 * Supply Chain View Controller
 *
 * Renders:
 * - Inventory KPIs
 * - ML demand forecast
 * - ABC inventory analysis
 * - Item-level inventory optimization
 * - Automated supply-chain recommendations
 */

const SupplyChainView = {

    chartInstances: {},


    // ============================================================
    // MAIN RENDER
    // ============================================================

    render(analysis) {

        if (!analysis) {
            return;
        }


        // ========================================================
        // 1. KPI CARDS
        // ========================================================

        const kpiGrid =
            document.getElementById(
                "supplyChainKpiGrid"
            );


        if (kpiGrid) {

            const totalItems =
                Number(
                    analysis.totalItems
                ) || 0;

            const totalStockUnits =
                Number(
                    analysis.totalStockUnits
                ) || 0;

            const predictedDemand =
                Number(
                    analysis.totalPredictedDemand
                ) || 0;

            const criticalAlerts =
                Number(
                    analysis.criticalAlertsCount
                ) || 0;

            const forecastCount =
                Number(
                    analysis.forecastCount
                ) || 0;


            kpiGrid.innerHTML = `

                <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">

                    <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Total SKUs Profiled
                    </span>

                    <h3 class="font-heading font-extrabold text-2xl text-white mt-1 font-mono">
                        ${totalItems.toLocaleString()}
                    </h3>

                    <p class="text-[11px] text-slate-500 mt-1">
                        Products in inventory
                    </p>

                </div>


                <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">

                    <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Total Stock Units
                    </span>

                    <h3 class="font-heading font-extrabold text-2xl text-indigo-400 mt-1 font-mono">
                        ${totalStockUnits.toLocaleString()}
                    </h3>

                    <p class="text-[11px] text-slate-500 mt-1">
                        Current units on hand
                    </p>

                </div>


                <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">

                    <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Predicted Demand
                    </span>

                    <h3 class="font-heading font-extrabold text-2xl text-emerald-400 mt-1 font-mono">
                        ${predictedDemand.toLocaleString(
                            undefined,
                            {
                                maximumFractionDigits: 2
                            }
                        )}
                    </h3>

                    <p class="text-[11px] text-slate-500 mt-1">
                        ${forecastCount} ML forecasts generated
                    </p>

                </div>


                <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">

                    <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Reorder / Stockout Alerts
                    </span>

                    <h3 class="font-heading font-extrabold text-2xl ${
                        criticalAlerts > 0
                            ? "text-rose-400"
                            : "text-slate-400"
                    } mt-1 font-mono">

                        ${criticalAlerts}

                    </h3>

                    <p class="text-[11px] text-slate-500 mt-1">
                        Items requiring inventory action
                    </p>

                </div>

            `;
        }


        // ========================================================
        // 2. ML DEMAND FORECAST
        // ========================================================

        this.renderForecastChart(
            analysis.forecast
        );


        // ========================================================
        // 3. ABC ANALYSIS
        // ========================================================

        this.renderAbcChart(
            analysis.abcSummary
        );


        // ========================================================
        // 4. INVENTORY TABLE
        // ========================================================

        this.renderInventoryTable(
            analysis.items
        );


        // ========================================================
        // 5. AI / AUTOMATED RECOMMENDATIONS
        // ========================================================

        this.renderRecommendations(
            analysis
        );


        // Re-create icons

        if (window.lucide) {

            lucide.createIcons();

        }
    },


    // ============================================================
    // INVENTORY TABLE
    // ============================================================

    renderInventoryTable(items) {

        const tbody =
            document.getElementById(
                "supplyChainTableBody"
            );


        if (!tbody) {
            return;
        }


        const inventoryItems =
            Array.isArray(items)
                ? items
                : [];


        if (
            inventoryItems.length === 0
        ) {

            tbody.innerHTML = `

                <tr>

                    <td
                        colspan="8"
                        class="py-8 text-center text-slate-500"
                    >

                        No inventory optimization
                        data available.

                    </td>

                </tr>

            `;

            return;
        }


        tbody.innerHTML =
            inventoryItems
                .map(
                    item =>
                        this.renderItemRow(
                            item
                        )
                )
                .join("");
    },


    // ============================================================
    // SINGLE INVENTORY ROW
    // ============================================================

    renderItemRow(item) {

        const stock =
            Number(
                item.stock
            ) || 0;


        const predictedDemand =
            Number(
                item.predictedDemand ??
                item.dailyDemand
            ) || 0;


        const reorderLevel =
            Number(
                item.reorderLevel
            ) || 0;


        const recommendedOrder =
            Number(
                item.recommendedOrderQuantity
            ) || 0;


        const abcClass =
            item.abcClass ||
            "-";


        const status =
            item.status ||
            "Unknown";


        let statusClass =
            item.statusClass;


        if (!statusClass) {

            if (
                status ===
                "Critical"
            ) {

                statusClass =
                    "text-rose-400 bg-rose-500/10 border-rose-500/30";

            } else if (
                status ===
                "Reorder Soon"
            ) {

                statusClass =
                    "text-amber-400 bg-amber-500/10 border-amber-500/30";

            } else {

                statusClass =
                    "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
            }
        }


        return `

            <tr class="hover:bg-slate-800/40 transition">

                <td class="py-3 px-4">

                    <div class="font-bold text-white">

                        ${this.escapeHtml(
                            item.name ||
                            "Unknown Product"
                        )}

                    </div>

                    <div class="text-[10px] text-slate-500 font-mono">

                        ${this.escapeHtml(
                            String(
                                item.itemId ||
                                "-"
                            )
                        )}

                        • Class ${abcClass}

                    </div>

                </td>


                <td class="py-3 px-4 text-right font-bold text-slate-200">

                    ${stock.toLocaleString()}

                </td>


                <td class="py-3 px-4 text-right text-slate-300">

                    ${predictedDemand.toLocaleString(
                        undefined,
                        {
                            maximumFractionDigits: 2
                        }
                    )}

                </td>


                <td class="py-3 px-4 text-right text-indigo-400 font-bold">

                    ${reorderLevel.toLocaleString(
                        undefined,
                        {
                            maximumFractionDigits: 2
                        }
                    )}

                </td>


                <td class="py-3 px-4 text-right text-indigo-400 font-bold">

                    ${reorderLevel.toLocaleString(
                        undefined,
                        {
                            maximumFractionDigits: 2
                        }
                    )}

                </td>


                <td class="py-3 px-4 text-right text-amber-400 font-bold">

                    ${reorderLevel.toLocaleString(
                        undefined,
                        {
                            maximumFractionDigits: 2
                        }
                    )}

                </td>


                <td class="py-3 px-4 text-right text-emerald-400 font-bold">

                    ${recommendedOrder.toLocaleString(
                        undefined,
                        {
                            maximumFractionDigits: 2
                        }
                    )}

                </td>


                <td class="py-3 px-4 text-center">

                    <span
                        class="border px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusClass}"
                    >

                        ${this.escapeHtml(
                            status
                        )}

                    </span>

                </td>

            </tr>

        `;
    },


    // ============================================================
    // AUTOMATED SUPPLY CHAIN RECOMMENDATIONS
    // ============================================================

    renderRecommendations(analysis) {

        const existing =
            document.getElementById(
                "supplyChainRecommendations"
            );


        if (existing) {

            existing.remove();

        }


        const items =
            Array.isArray(
                analysis.items
            )
                ? analysis.items
                : [];


        if (items.length === 0) {
            return;
        }


        const criticalItems =
            items.filter(
                item =>
                    item.status ===
                    "Critical"
            );


        const reorderItems =
            items.filter(
                item =>
                    item.status ===
                    "Reorder Soon"
            );


        const healthyItems =
            items.filter(
                item =>
                    item.status ===
                    "Healthy"
            );


        const highestDemandItem =
            [...items].sort(
                (a, b) =>
                    (
                        Number(
                            b.predictedDemand ??
                            b.dailyDemand
                        ) || 0
                    ) -
                    (
                        Number(
                            a.predictedDemand ??
                            a.dailyDemand
                        ) || 0
                    )
            )[0];


        const lowestStockItem =
            [...items].sort(
                (a, b) =>
                    (
                        Number(
                            a.stock
                        ) || 0
                    ) -
                    (
                        Number(
                            b.stock
                        ) || 0
                    )
            )[0];


        const recommendations = [];


        // -----------------------------------------
        // Critical inventory
        // -----------------------------------------

        if (
            criticalItems.length > 0
        ) {

            const names =
                criticalItems
                    .slice(0, 3)
                    .map(
                        item =>
                            item.name
                    )
                    .join(", ");


            recommendations.push({

                icon:
                    "alert-triangle",

                title:
                    "Immediate inventory attention required",

                text:
                    `${criticalItems.length} product(s) are classified as Critical. Prioritize replenishment for ${names}.`,

                type:
                    "critical",

                badge:
                    "HIGH PRIORITY"

            });

        }


        // -----------------------------------------
        // Reorder recommendations
        // -----------------------------------------

        if (
            reorderItems.length > 0
        ) {

            const names =
                reorderItems
                    .slice(0, 3)
                    .map(
                        item =>
                            item.name
                    )
                    .join(", ");


            recommendations.push({

                icon:
                    "shopping-cart",

                title:
                    "Reorder products approaching threshold",

                text:
                    `${reorderItems.length} product(s) are below or near their reorder threshold. Review replenishment for ${names}.`,

                type:
                    "warning",

                badge:
                    "REORDER"

            });

        }


        // -----------------------------------------
        // High demand product
        // -----------------------------------------

        if (
            highestDemandItem
        ) {

            const demand =
                Number(
                    highestDemandItem.predictedDemand ??
                    highestDemandItem.dailyDemand
                ) || 0;


            recommendations.push({

                icon:
                    "trending-up",

                title:
                    "Highest predicted demand",

                text:
                    `${highestDemandItem.name} has the highest predicted demand at ${demand.toFixed(2)} units.`,

                type:
                    "growth",

                badge:
                    "DEMAND SIGNAL"

            });

        }


        // -----------------------------------------
        // Lowest stock product
        // -----------------------------------------

        if (
            lowestStockItem
        ) {

            const stock =
                Number(
                    lowestStockItem.stock
                ) || 0;


            recommendations.push({

                icon:
                    "package-search",

                title:
                    "Lowest current stock",

                text:
                    `${lowestStockItem.name} has the lowest stock level at ${stock.toLocaleString()} units. Monitor replenishment closely.`,

                type:
                    "info",

                badge:
                    "MONITOR"

            });

        }


        // -----------------------------------------
        // Healthy inventory
        // -----------------------------------------

        if (
            healthyItems.length ===
            items.length
        ) {

            recommendations.push({

                icon:
                    "check-circle-2",

                title:
                    "Inventory position is healthy",

                text:
                    "All profiled products are currently above the backend reorder threshold based on the latest forecast.",

                type:
                    "healthy",

                badge:
                    "HEALTHY"

            });

        }


        // -----------------------------------------
        // Overall summary
        // -----------------------------------------

        const totalPredictedDemand =
            Number(
                analysis.totalPredictedDemand
            ) || 0;


        const totalStockUnits =
            Number(
                analysis.totalStockUnits
            ) || 0;


        if (
            totalStockUnits > 0
        ) {

            const coverageRatio =
                totalStockUnits /
                Math.max(
                    totalPredictedDemand,
                    1
                );


            let coverageMessage =
                "Inventory coverage should be monitored against future demand.";


            if (
                coverageRatio >=
                10
            ) {

                coverageMessage =
                    "Current stock provides a strong buffer relative to the latest predicted demand.";

            } else if (
                coverageRatio >=
                5
            ) {

                coverageMessage =
                    "Current stock provides a moderate buffer relative to predicted demand.";

            } else {

                coverageMessage =
                    "Current stock is relatively close to predicted demand and should be monitored closely.";

            }


            recommendations.push({

                icon:
                    "brain-circuit",

                title:
                    "Supply-chain outlook",

                text:
                    coverageMessage,

                type:
                    "ai",

                badge:
                    "ANALYTICAL INSIGHT"

            });

        }


        if (
            recommendations.length ===
            0
        ) {
            return;
        }


        const recommendationSection =
            document.createElement(
                "div"
            );


        recommendationSection.id =
            "supplyChainRecommendations";


        recommendationSection.className =
            "bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl";


        recommendationSection.innerHTML = `

            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

                <div>

                    <h3 class="font-heading font-bold text-lg text-white flex items-center gap-2">

                        <i
                            data-lucide="brain-circuit"
                            class="w-5 h-5 text-purple-400"
                        ></i>

                        AI Supply Chain Insights

                    </h3>

                    <p class="text-xs text-slate-400 mt-1">

                        Automated recommendations generated from
                        inventory, demand forecasts, and reorder signals.

                    </p>

                </div>


                <span class="inline-flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-bold px-3 py-1.5 rounded-full">

                    <i
                        data-lucide="sparkles"
                        class="w-3 h-3"
                    ></i>

                    INTELLIGENCE ACTIVE

                </span>

            </div>


            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                ${recommendations
                    .map(
                        recommendation =>
                            this.renderRecommendationCard(
                                recommendation
                            )
                    )
                    .join("")
                }

            </div>

        `;


        const tableSection =
            document
                .getElementById(
                    "supplyChainTableBody"
                );


        const tableCard =
            tableSection
                ? tableSection.closest(
                    ".bg-slate-900\\/90"
                )
                : null;


        const supplyChainSection =
            document.getElementById(
                "tab-supplychain"
            );


        if (
            tableCard &&
            tableCard.parentNode
        ) {

            tableCard.parentNode.insertBefore(
                recommendationSection,
                tableCard.nextSibling
            );

        } else if (
            supplyChainSection
        ) {

            supplyChainSection.appendChild(
                recommendationSection
            );

        }


        if (window.lucide) {

            lucide.createIcons();

        }

    },


    // ============================================================
    // RECOMMENDATION CARD
    // ============================================================

    renderRecommendationCard(
        recommendation
    ) {

        let iconColor =
            "text-indigo-400";

        let borderColor =
            "border-indigo-500/20";

        let background =
            "bg-indigo-500/5";

        let badgeColor =
            "text-indigo-300 bg-indigo-500/10 border-indigo-500/30";


        if (
            recommendation.type ===
            "critical"
        ) {

            iconColor =
                "text-rose-400";

            borderColor =
                "border-rose-500/20";

            background =
                "bg-rose-500/5";

            badgeColor =
                "text-rose-300 bg-rose-500/10 border-rose-500/30";

        } else if (
            recommendation.type ===
            "warning"
        ) {

            iconColor =
                "text-amber-400";

            borderColor =
                "border-amber-500/20";

            background =
                "bg-amber-500/5";

            badgeColor =
                "text-amber-300 bg-amber-500/10 border-amber-500/30";

        } else if (
            recommendation.type ===
            "growth"
        ) {

            iconColor =
                "text-emerald-400";

            borderColor =
                "border-emerald-500/20";

            background =
                "bg-emerald-500/5";

            badgeColor =
                "text-emerald-300 bg-emerald-500/10 border-emerald-500/30";

        } else if (
            recommendation.type ===
            "healthy"
        ) {

            iconColor =
                "text-emerald-400";

            borderColor =
                "border-emerald-500/20";

            background =
                "bg-emerald-500/5";

            badgeColor =
                "text-emerald-300 bg-emerald-500/10 border-emerald-500/30";

        } else if (
            recommendation.type ===
            "ai"
        ) {

            iconColor =
                "text-purple-400";

            borderColor =
                "border-purple-500/20";

            background =
                "bg-purple-500/5";

            badgeColor =
                "text-purple-300 bg-purple-500/10 border-purple-500/30";
        }


        return `

            <div class="${background} border ${borderColor} rounded-xl p-4">

                <div class="flex items-start gap-3">

                    <div class="w-9 h-9 rounded-lg bg-slate-950/60 border border-slate-700/50 flex items-center justify-center shrink-0">

                        <i
                            data-lucide="${this.escapeHtml(
                                recommendation.icon
                            )}"
                            class="w-4 h-4 ${iconColor}"
                        ></i>

                    </div>


                    <div class="min-w-0 flex-grow">

                        <div class="flex flex-wrap items-center gap-2">

                            <h4 class="font-heading font-bold text-sm text-white">

                                ${this.escapeHtml(
                                    recommendation.title
                                )}

                            </h4>


                            <span class="text-[9px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}">

                                ${this.escapeHtml(
                                    recommendation.badge
                                )}

                            </span>

                        </div>


                        <p class="text-xs text-slate-400 leading-relaxed mt-1.5">

                            ${this.escapeHtml(
                                recommendation.text
                            )}

                        </p>

                    </div>

                </div>

            </div>

        `;
    },


    // ============================================================
    // FORECAST CHART
    // ============================================================

    renderForecastChart(
        forecast
    ) {

        const canvas =
            document.getElementById(
                "demandForecastChart"
            );


        if (!canvas) {
            return;
        }


        if (
            this.chartInstances.forecast
        ) {

            this.chartInstances.forecast.destroy();

            this.chartInstances.forecast =
                null;

        }


        if (
            !forecast ||
            !Array.isArray(
                forecast.labels
            ) ||
            forecast.labels.length === 0
        ) {

            const ctx =
                canvas.getContext(
                    "2d"
                );


            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );


            return;
        }


        const labels =
            forecast.labels;


        const forecastValues =
            forecast.forecastValues ||
            [];


        const upperBounds =
            forecast.upperBounds ||
            [];


        const lowerBounds =
            forecast.lowerBounds ||
            [];


        const ctx =
            canvas.getContext(
                "2d"
            );


        this.chartInstances.forecast =
            new Chart(
                ctx,
                {

                    type:
                        "line",

                    data: {

                        labels:

                            labels,

                        datasets: [

                            {
                                label:
                                    "ML Predicted Demand",

                                data:
                                    forecastValues,

                                borderColor:
                                    "#10b981",

                                backgroundColor:
                                    "rgba(16, 185, 129, 0.08)",

                                borderWidth:
                                    2.5,

                                pointRadius:
                                    4,

                                pointHoverRadius:
                                    6,

                                fill:
                                    false,

                                tension:
                                    0.3
                            },


                            {
                                label:
                                    "Upper Range",

                                data:
                                    upperBounds,

                                borderColor:
                                    "rgba(99, 102, 241, 0.45)",

                                borderDash:
                                    [5, 5],

                                borderWidth:
                                    1.5,

                                pointRadius:
                                    0,

                                fill:
                                    false,

                                tension:
                                    0.3
                            },


                            {
                                label:
                                    "Lower Range",

                                data:
                                    lowerBounds,

                                borderColor:
                                    "rgba(99, 102, 241, 0.45)",

                                borderDash:
                                    [5, 5],

                                borderWidth:
                                    1.5,

                                pointRadius:
                                    0,

                                fill:
                                    false,

                                tension:
                                    0.3
                            }

                        ]
                    },


                    options: {

                        responsive:
                            true,

                        maintainAspectRatio:
                            false,


                        interaction: {

                            intersect:
                                false,

                            mode:
                                "index"

                        },


                        plugins: {

                            legend: {

                                position:
                                    "top",

                                labels: {

                                    color:
                                        "#94a3b8",

                                    font: {

                                        family:
                                            "Inter",

                                        size:
                                            10

                                    },

                                    usePointStyle:
                                        true
                                }

                            },


                            tooltip: {

                                callbacks: {

                                    label:
                                        function(
                                            context
                                        ) {

                                            return (
                                                context.dataset.label +
                                                ": " +
                                                Number(
                                                    context.parsed.y
                                                ).toLocaleString()
                                            );

                                        }

                                }

                            }

                        },


                        scales: {

                            x: {

                                grid: {

                                    color:
                                        "rgba(51, 65, 85, 0.4)"

                                },

                                ticks: {

                                    color:
                                        "#94a3b8",

                                    font: {

                                        size:
                                            10

                                    }

                                }

                            },


                            y: {

                                beginAtZero:
                                    true,

                                grid: {

                                    color:
                                        "rgba(51, 65, 85, 0.4)"

                                },

                                ticks: {

                                    color:
                                        "#94a3b8",

                                    font: {

                                        size:
                                            10

                                    }

                                }

                            }

                        }

                    }

                }
            );

    },


    // ============================================================
    // ABC CHART
    // ============================================================

    renderAbcChart(
        abc
    ) {

        const canvas =
            document.getElementById(
                "abcAnalysisChart"
            );


        if (!canvas) {
            return;
        }


        if (
            this.chartInstances.abc
        ) {

            this.chartInstances.abc.destroy();

            this.chartInstances.abc =
                null;

        }


        if (!abc) {
            return;
        }


        const classA =
            abc.classA || {
                count: 0,
                value: 0,
                pct: 0
            };


        const classB =
            abc.classB || {
                count: 0,
                value: 0,
                pct: 0
            };


        const classC =
            abc.classC || {
                count: 0,
                value: 0,
                pct: 0
            };


        const classAPct =
            Number(
                classA.pct
            ) || 0;


        const classBPct =
            Number(
                classB.pct
            ) || 0;


        const classCPct =
            Number(
                classC.pct
            ) || 0;


        const ctx =
            canvas.getContext(
                "2d"
            );


        this.chartInstances.abc =
            new Chart(
                ctx,
                {

                    type:
                        "doughnut",

                    data: {

                        labels: [

                            `Class A (${classA.count} items)`,

                            `Class B (${classB.count} items)`,

                            `Class C (${classC.count} items)`

                        ],

                        datasets: [

                            {

                                data: [

                                    Number(
                                        classAPct.toFixed(
                                            1
                                        )
                                    ),

                                    Number(
                                        classBPct.toFixed(
                                            1
                                        )
                                    ),

                                    Number(
                                        classCPct.toFixed(
                                            1
                                        )
                                    )

                                ],

                                backgroundColor: [

                                    "#6366f1",

                                    "#06b6d4",

                                    "#8b5cf6"

                                ],

                                borderColor:
                                    "#0f172a",

                                borderWidth:
                                    2

                            }

                        ]

                    },


                    options: {

                        responsive:
                            true,

                        maintainAspectRatio:
                            false,


                        plugins: {

                            legend: {

                                position:
                                    "right",

                                labels: {

                                    color:
                                        "#94a3b8",

                                    font: {

                                        family:
                                            "Inter",

                                        size:
                                            11

                                    },

                                    usePointStyle:
                                        true

                                }

                            },


                            tooltip: {

                                callbacks: {

                                    label:
                                        function(
                                            context
                                        ) {

                                            return (
                                                context.label +
                                                ": " +
                                                Number(
                                                    context.parsed
                                                ).toFixed(
                                                    1
                                                ) +
                                                "%"
                                            );

                                        }

                                }

                            }

                        }

                    }

                }
            );

    },


    // ============================================================
    // HTML ESCAPE
    // ============================================================

    escapeHtml(
        value
    ) {

        return String(
            value
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }

};