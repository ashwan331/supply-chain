/**
 * Dashboard View Controller
 *
 * Renders:
 * - Dynamic KPIs
 * - Recommended Chart.js visualizations
 * - Table-first analytical widgets
 *
 * Designed to work with any structured dataset whose
 * analysis plan is produced by RecommendationEngine.
 */

const DashboardView = {

    chartInstances: {},


    // ============================================================
    // MAIN DASHBOARD RENDER
    // ============================================================

    render(
        plan,
        executiveBriefingText
    ) {

        if (!plan) {

            this.renderEmptyDashboard();

            return;

        }


        const safePlan = {

            domain:
                plan.domain ||
                "Data",

            kpis:
                Array.isArray(
                    plan.kpis
                )
                    ? plan.kpis
                    : [],

            charts:
                Array.isArray(
                    plan.charts
                )
                    ? plan.charts
                    : [],

            tables:
                Array.isArray(
                    plan.tables
                )
                    ? plan.tables
                    : []

        };


        // ========================================================
        // TITLES
        // ========================================================

        const titleEl =
            document.getElementById(
                "dashboardTitle"
            );


        const subtitleEl =
            document.getElementById(
                "dashboardSubtitle"
            );


        const domainTag =
            document.getElementById(
                "dashboardDomainTag"
            );


        const briefingEl =
            document.getElementById(
                "executiveBriefingText"
            );


        if (titleEl) {

            titleEl.textContent =
                `${safePlan.domain} Dashboard`;

        }


        if (subtitleEl) {

            subtitleEl.textContent =
                `Auto-generated visualizations and analytics tailored for ${safePlan.domain}`;

        }


        if (domainTag) {

            domainTag.textContent =
                safePlan.domain;

        }


        if (briefingEl) {

            briefingEl.textContent =
                executiveBriefingText ||
                "No executive briefing is available for this dataset yet.";

        }


        // ========================================================
        // KPI CARDS
        // ========================================================

        this.renderKPIs(
            safePlan.kpis
        );


        // ========================================================
        // CHARTS
        // ========================================================

        this.renderCharts(
            safePlan.charts
        );


        // ========================================================
        // TABLES
        // ========================================================

        this.renderTables(
            safePlan.tables
        );


        // ========================================================
        // ICONS
        // ========================================================

        if (window.lucide) {

            lucide.createIcons();

        }

    },


    // ============================================================
    // KPI RENDERING
    // ============================================================

    renderKPIs(kpis) {

        const grid =
            document.getElementById(
                "dynamicKpiGrid"
            );


        if (!grid) {

            return;

        }


        if (
            !Array.isArray(kpis) ||
            kpis.length === 0
        ) {

            grid.innerHTML = `

                <div class="col-span-full bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center">

                    <i
                        data-lucide="bar-chart-3"
                        class="w-8 h-8 text-slate-600 mx-auto mb-3"
                    ></i>

                    <h3 class="font-heading font-bold text-white">
                        No automatic KPIs available
                    </h3>

                    <p class="text-xs text-slate-500 mt-1">
                        The uploaded dataset does not currently contain enough measurable fields to generate KPI cards.
                    </p>

                </div>

            `;


            if (window.lucide) {

                lucide.createIcons();

            }


            return;

        }


        const colorMap = {

            indigo: {

                border:
                    "border-indigo-500/30",

                bg:
                    "bg-indigo-500/10",

                text:
                    "text-indigo-400"

            },

            emerald: {

                border:
                    "border-emerald-500/30",

                bg:
                    "bg-emerald-500/10",

                text:
                    "text-emerald-400"

            },

            cyan: {

                border:
                    "border-cyan-500/30",

                bg:
                    "bg-cyan-500/10",

                text:
                    "text-cyan-400"

            },

            purple: {

                border:
                    "border-purple-500/30",

                bg:
                    "bg-purple-500/10",

                text:
                    "text-purple-400"

            },

            amber: {

                border:
                    "border-amber-500/30",

                bg:
                    "bg-amber-500/10",

                text:
                    "text-amber-400"

            },

            rose: {

                border:
                    "border-rose-500/30",

                bg:
                    "bg-rose-500/10",

                text:
                    "text-rose-400"

            }

        };


        grid.innerHTML = kpis
            .map(
                (kpi, index) => {

                    const color =
                        colorMap[
                            kpi?.color
                        ] ||
                        colorMap.indigo;


                    const title =
                        kpi?.title ||
                        `Metric ${index + 1}`;


                    const value =
                        kpi?.value ??
                        "N/A";


                    const change =
                        kpi?.change ||
                        "Dataset metric";


                    const subtitle =
                        kpi?.subtitle ||
                        "Calculated from uploaded data";


                    const icon =
                        kpi?.icon ||
                        "activity";


                    return `

                        <div class="kpi-card bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">

                            <div class="flex items-center justify-between mb-2">

                                <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">

                                    ${this.escapeHtml(
                                        title
                                    )}

                                </span>


                                <div class="p-2 rounded-xl ${color.bg} ${color.border} border ${color.text}">

                                    <i
                                        data-lucide="${this.escapeHtml(
                                            icon
                                        )}"
                                        class="w-4 h-4"
                                    ></i>

                                </div>

                            </div>


                            <div>

                                <h3 class="font-heading font-extrabold text-2xl text-white tracking-tight font-mono">

                                    ${this.escapeHtml(
                                        String(value)
                                    )}

                                </h3>


                                <div class="flex items-center justify-between gap-3 mt-2 pt-2 border-t border-slate-800/80 text-[11px]">

                                    <span class="${color.text} font-medium">

                                        ${this.escapeHtml(
                                            String(change)
                                        )}

                                    </span>


                                    <span class="text-slate-500 truncate">

                                        ${this.escapeHtml(
                                            String(subtitle)
                                        )}

                                    </span>

                                </div>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");


        if (window.lucide) {

            lucide.createIcons();

        }

    },


    // ============================================================
    // CHART RENDERING
    // ============================================================

    renderCharts(charts) {

        const grid =
            document.getElementById(
                "recommendedChartsGrid"
            );


        if (!grid) {

            return;

        }


        // Destroy old charts

        Object
            .values(
                this.chartInstances
            )
            .forEach(
                chart => {

                    try {

                        chart.destroy();

                    } catch (error) {

                        console.warn(
                            "Could not destroy chart:",
                            error
                        );

                    }

                }
            );


        this.chartInstances = {};


        if (
            !Array.isArray(charts) ||
            charts.length === 0
        ) {

            grid.innerHTML = `

                <div class="col-span-full bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center">

                    <i
                        data-lucide="chart-no-axes-combined"
                        class="w-8 h-8 text-slate-600 mx-auto mb-3"
                    ></i>

                    <h3 class="font-heading font-bold text-white">
                        No automatic charts available
                    </h3>

                    <p class="text-xs text-slate-500 mt-1">
                        The uploaded dataset does not currently contain a suitable combination of fields for chart generation.
                    </p>

                </div>

            `;


            if (window.lucide) {

                lucide.createIcons();

            }


            return;

        }


        grid.innerHTML =
            charts
                .map(
                    (chart, index) => {

                        const title =
                            chart?.title ||
                            `Visualization ${index + 1}`;


                        const subtitle =
                            chart?.subtitle ||
                            "Automatically generated from dataset structure";


                        const type =
                            chart?.type ||
                            "chart";


                        const insight =
                            chart?.insight ||
                            "";


                        const chartId =
                            chart?.id ||
                            `chart_${index}`;


                        return `

                            <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">

                                <div class="flex items-start justify-between mb-4 gap-3">

                                    <div class="min-w-0">

                                        <h3 class="font-heading font-bold text-base text-white">

                                            ${this.escapeHtml(
                                                title
                                            )}

                                        </h3>


                                        <p class="text-xs text-slate-400 mt-0.5">

                                            ${this.escapeHtml(
                                                subtitle
                                            )}

                                        </p>

                                    </div>


                                    <span class="bg-slate-800 text-slate-300 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-slate-700 uppercase shrink-0">

                                        ${this.escapeHtml(
                                            type
                                        )}

                                    </span>

                                </div>


                                <div class="h-64 relative w-full">

                                    <canvas
                                        id="canvas_${this.escapeHtml(
                                            chartId
                                        )}"
                                    ></canvas>

                                </div>


                                ${
                                    insight
                                        ? `
                                            <div class="mt-4 pt-3 border-t border-slate-800/80 text-xs text-indigo-300 flex items-start gap-2">

                                                <i
                                                    data-lucide="sparkles"
                                                    class="w-3.5 h-3.5 shrink-0 text-indigo-400 mt-0.5"
                                                ></i>

                                                <span>
                                                    ${this.escapeHtml(
                                                        insight
                                                    )}
                                                </span>

                                            </div>
                                        `
                                        : ""
                                }

                            </div>

                        `;

                    }
                )
                .join("");


        if (window.lucide) {

            lucide.createIcons();

        }


        charts.forEach(
            (chart, index) => {

                this.createChart(
                    chart,
                    index
                );

            }
        );

    },


    // ============================================================
    // CREATE INDIVIDUAL CHART
    // ============================================================

    createChart(
        chart,
        index
    ) {

        if (!chart) {

            return;

        }


        const chartId =
            chart.id ||
            `chart_${index}`;


        const canvas =
            document.getElementById(
                `canvas_${chartId}`
            );


        if (!canvas) {

            return;

        }


        if (
            typeof Chart ===
            "undefined"
        ) {

            console.error(
                "Chart.js is not loaded."
            );

            return;

        }


        const ctx =
            canvas.getContext(
                "2d"
            );


        if (!ctx) {

            return;

        }


        const type =
            String(
                chart.type ||
                ""
            ).toLowerCase();


        const chartData =
            chart.data ||
            {};


        try {

            if (
                type ===
                "line"
            ) {

                this.createLineChart(
                    chart,
                    ctx,
                    chartData
                );


            } else if (
                type ===
                "bar"
            ) {

                this.createBarChart(
                    chart,
                    ctx,
                    chartData
                );


            } else if (
                type ===
                    "donut" ||
                type ===
                    "doughnut"
            ) {

                this.createDonutChart(
                    chart,
                    ctx,
                    chartData
                );


            } else if (
                type ===
                "pie"
            ) {

                this.createPieChart(
                    chart,
                    ctx,
                    chartData
                );


            } else if (
                type ===
                "scatter"
            ) {

                this.createScatterChart(
                    chart,
                    ctx,
                    chartData
                );


            } else {

                console.warn(
                    `Unsupported chart type: ${chart.type}`
                );

            }

        } catch (error) {

            console.error(
                `Could not render chart ${chartId}:`,
                error
            );

        }

    },


    // ============================================================
    // LINE CHART
    // ============================================================

    createLineChart(
        chart,
        ctx,
        data
    ) {

        const labels =
            Array.isArray(
                data.labels
            )
                ? data.labels
                : [];


        const values =
            Array.isArray(
                data.values
            )
                ? data.values
                : [];


        if (
            labels.length === 0 &&
            values.length === 0
        ) {

            return;

        }


        const chartId =
            chart.id;


        this.chartInstances[
            chartId
        ] =

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
                                    chart.title ||
                                    "Value",

                                data:
                                    values,

                                borderColor:
                                    chart.color ||
                                    "#6366f1",

                                backgroundColor:
                                    "rgba(99, 102, 241, 0.10)",

                                borderWidth:
                                    2.5,

                                fill:
                                    true,

                                tension:
                                    0.3,

                                pointRadius:
                                    3,

                                pointHoverRadius:
                                    6

                            }

                        ]

                    },

                    options:
                        this.getChartOptions()

                }
            );

    },


    // ============================================================
    // BAR CHART
    // ============================================================

    createBarChart(
        chart,
        ctx,
        data
    ) {

        const labels =
            Array.isArray(
                data.labels
            )
                ? data.labels
                : [];


        const values =
            Array.isArray(
                data.values
            )
                ? data.values
                : [];


        if (
            labels.length === 0 &&
            values.length === 0
        ) {

            return;

        }


        this.chartInstances[
            chart.id
        ] =

            new Chart(
                ctx,
                {

                    type:
                        "bar",

                    data: {

                        labels:

                            labels,

                        datasets: [

                            {

                                label:
                                    chart.title ||
                                    "Value",

                                data:
                                    values,

                                backgroundColor: [

                                    "#6366f1",

                                    "#10b981",

                                    "#06b6d4",

                                    "#8b5cf6",

                                    "#f59e0b",

                                    "#f43f5e",

                                    "#ec4899",

                                    "#3b82f6"

                                ],

                                borderRadius:
                                    6

                            }

                        ]

                    },

                    options:
                        this.getChartOptions()

                }
            );

    },


    // ============================================================
    // DONUT CHART
    // ============================================================

    createDonutChart(
        chart,
        ctx,
        data
    ) {

        const labels =
            Array.isArray(
                data.labels
            )
                ? data.labels
                : [];


        const values =
            Array.isArray(
                data.values
            )
                ? data.values
                : [];


        if (
            labels.length === 0
        ) {

            return;

        }


        this.chartInstances[
            chart.id
        ] =

            new Chart(
                ctx,
                {

                    type:
                        "doughnut",

                    data: {

                        labels:

                            labels,

                        datasets: [

                            {

                                data:
                                    values,

                                backgroundColor: [

                                    "#6366f1",

                                    "#10b981",

                                    "#06b6d4",

                                    "#8b5cf6",

                                    "#f59e0b",

                                    "#f43f5e"

                                ],

                                borderWidth:
                                    2,

                                borderColor:
                                    "#0f172a"

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

                            }

                        }

                    }

                }
            );

    },


    // ============================================================
    // PIE CHART
    // ============================================================

    createPieChart(
        chart,
        ctx,
        data
    ) {

        const labels =
            Array.isArray(
                data.labels
            )
                ? data.labels
                : [];


        const values =
            Array.isArray(
                data.values
            )
                ? data.values
                : [];


        if (
            labels.length === 0
        ) {

            return;

        }


        this.chartInstances[
            chart.id
        ] =

            new Chart(
                ctx,
                {

                    type:
                        "pie",

                    data: {

                        labels:

                            labels,

                        datasets: [

                            {

                                data:
                                    values,

                                backgroundColor: [

                                    "#6366f1",

                                    "#10b981",

                                    "#06b6d4",

                                    "#8b5cf6",

                                    "#f59e0b",

                                    "#f43f5e"

                                ],

                                borderWidth:
                                    2,

                                borderColor:
                                    "#0f172a"

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

                            }

                        }

                    }

                }
            );

    },


    // ============================================================
    // SCATTER CHART
    // ============================================================

    createScatterChart(
        chart,
        ctx,
        data
    ) {

        const points =
            Array.isArray(
                data.scatterPoints
            )
                ? data.scatterPoints
                : [];


        if (
            points.length === 0
        ) {

            return;

        }


        const xName =
            data.colX ||
            "X";


        const yName =
            data.colY ||
            "Y";


        this.chartInstances[
            chart.id
        ] =

            new Chart(
                ctx,
                {

                    type:
                        "scatter",

                    data: {

                        datasets: [

                            {

                                label:
                                    `${xName} vs ${yName}`,

                                data:
                                    points,

                                backgroundColor:
                                    "rgba(139, 92, 246, 0.7)",

                                pointRadius:
                                    5,

                                pointHoverRadius:
                                    8

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

                                display:
                                    true,

                                labels: {

                                    color:
                                        "#94a3b8",

                                    font: {

                                        family:
                                            "Inter",

                                        size:
                                            10

                                    }

                                }

                            }

                        },

                        scales: {

                            x: {

                                title: {

                                    display:
                                        true,

                                    text:
                                        xName,

                                    color:
                                        "#94a3b8"

                                },

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

                                title: {

                                    display:
                                        true,

                                    text:
                                        yName,

                                    color:
                                        "#94a3b8"

                                },

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
    // TABLE-FIRST WIDGETS
    // ============================================================

    renderTables(tables) {

        const section =
            document.getElementById(
                "recommendedTablesSection"
            );


        if (!section) {

            return;

        }


        if (
            !Array.isArray(tables) ||
            tables.length === 0
        ) {

            section.innerHTML = "";

            return;

        }


        const renderedTables =
            tables
                .map(
                    (table, index) => {

                        if (
                            !table ||
                            !Array.isArray(
                                table.records
                            ) ||
                            table.records.length ===
                                0
                        ) {

                            return "";

                        }


                        const headers =
                            Object.keys(
                                table.records[0]
                            ).slice(
                                0,
                                8
                            );


                        if (
                            headers.length === 0
                        ) {

                            return "";

                        }


                        return `

                            <div class="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">

                                <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">

                                    <div>

                                        <h3 class="font-heading font-bold text-base text-white flex items-center gap-2">

                                            <i
                                                data-lucide="table"
                                                class="w-4 h-4 text-indigo-400"
                                            ></i>

                                            ${this.escapeHtml(
                                                table.title ||
                                                `Analytical Table ${index + 1}`
                                            )}

                                        </h3>


                                        <p class="text-xs text-slate-400">

                                            ${this.escapeHtml(
                                                table.subtitle ||
                                                "Dataset records"
                                            )}

                                        </p>

                                    </div>

                                </div>


                                <div class="overflow-x-auto">

                                    <table class="w-full text-left border-collapse text-xs font-mono">

                                        <thead>

                                            <tr class="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">

                                                ${headers
                                                    .map(
                                                        header => `

                                                            <th class="py-3 px-4">

                                                                ${this.escapeHtml(
                                                                    this.formatLabel(
                                                                        header
                                                                    )
                                                                )}

                                                            </th>

                                                        `
                                                    )
                                                    .join(
                                                        ""
                                                    )}

                                            </tr>

                                        </thead>


                                        <tbody class="divide-y divide-slate-800/60 text-slate-300">

                                            ${table.records
                                                .map(
                                                    row => `

                                                        <tr class="hover:bg-slate-800/40 transition">

                                                            ${headers
                                                                .map(
                                                                    header => {

                                                                        const value =
                                                                            row[
                                                                                header
                                                                            ];


                                                                        return `

                                                                            <td class="py-3 px-4 truncate max-w-[220px]">

                                                                                ${this.escapeHtml(
                                                                                    value ===
                                                                                        null ||
                                                                                    value ===
                                                                                        undefined ||
                                                                                    value ===
                                                                                        ""
                                                                                        ? "N/A"
                                                                                        : String(
                                                                                            value
                                                                                        )
                                                                                )}

                                                                            </td>

                                                                        `;

                                                                    }
                                                                )
                                                                .join(
                                                                    ""
                                                                )}

                                                        </tr>

                                                    `
                                                )
                                                .join(
                                                    ""
                                                )}

                                        </tbody>

                                    </table>

                                </div>

                            </div>

                        `;

                    }
                )
                .join("");


        section.innerHTML =
            renderedTables;


        if (window.lucide) {

            lucide.createIcons();

        }

    },


    // ============================================================
    // CHART OPTIONS
    // ============================================================

    getChartOptions() {

        return {

            responsive:
                true,

            maintainAspectRatio:
                false,

            plugins: {

                legend: {

                    display:
                        false

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

                            family:
                                "Inter",

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

                            family:
                                "Inter",

                            size:
                                10

                        }

                    }

                }

            }

        };

    },


    // ============================================================
    // EMPTY DASHBOARD
    // ============================================================

    renderEmptyDashboard() {

        const titleEl =
            document.getElementById(
                "dashboardTitle"
            );


        const subtitleEl =
            document.getElementById(
                "dashboardSubtitle"
            );


        const briefingEl =
            document.getElementById(
                "executiveBriefingText"
            );


        const kpiGrid =
            document.getElementById(
                "dynamicKpiGrid"
            );


        const chartGrid =
            document.getElementById(
                "recommendedChartsGrid"
            );


        const tableSection =
            document.getElementById(
                "recommendedTablesSection"
            );


        if (titleEl) {

            titleEl.textContent =
                "Analytics Dashboard";

        }


        if (subtitleEl) {

            subtitleEl.textContent =
                "Upload a dataset to generate dynamic analytics.";

        }


        if (briefingEl) {

            briefingEl.textContent =
                "Upload or select a dataset to begin automatic analysis.";

        }


        if (kpiGrid) {

            kpiGrid.innerHTML = "";

        }


        if (chartGrid) {

            chartGrid.innerHTML = "";

        }


        if (tableSection) {

            tableSection.innerHTML = "";

        }

    },


    // ============================================================
    // LABEL FORMATTER
    // ============================================================

    formatLabel(
        value
    ) {

        if (
            typeof value !==
            "string"
        ) {

            return String(
                value
            );

        }


        return value
            .replace(
                /[_-]+/g,
                " "
            )
            .replace(
                /([a-z])([A-Z])/g,
                "$1 $2"
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim()
            .replace(
                /\b\w/g,
                char =>
                    char.toUpperCase()
            );

    },


    // ============================================================
    // HTML ESCAPING
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