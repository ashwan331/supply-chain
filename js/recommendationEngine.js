/**
 * Recommendation Engine
 * Analyzes dataset profiling metrics and automatically generates
 * tailored dashboard plans (KPIs, Charts, Tables) and analytical recommendations.
 */

const RecommendationEngine = {

    /**
     * Formats raw column or variable names into clean, human-readable labels.
     * @param {string} value 
     * @returns {string}
     */
    formatLabel(value) {
        if (value === null || value === undefined) return "";
        if (typeof value !== "string") return String(value);

        return value
            .replace(/[_-]+/g, " ")
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/\s+/g, " ")
            .trim()
            .replace(/\b\w/g, char => char.toUpperCase());
    },

    /**
     * Finds the strongest correlation pair among numeric columns.
     * @param {Array<Object>} data 
     * @param {Array<string>} numericCols 
     * @returns {Object|null} { col1, col2, r }
     */
    findBestCorrelationPair(data, numericCols) {
        if (!Array.isArray(data) || !Array.isArray(numericCols) || numericCols.length < 2) {
            return null;
        }

        let bestPair = null;
        let maxAbsR = -1;

        for (let i = 0; i < numericCols.length; i++) {
            for (let j = i + 1; j < numericCols.length; j++) {
                const col1 = numericCols[i];
                const col2 = numericCols[j];

                const pairs = [];
                for (let r = 0; r < data.length; r++) {
                    const v1 = Number(data[r][col1]);
                    const v2 = Number(data[r][col2]);
                    if (!isNaN(v1) && !isNaN(v2) && v1 !== null && v2 !== null) {
                        pairs.push([v1, v2]);
                    }
                }

                if (pairs.length < 3) continue;

                const n = pairs.length;
                const sum1 = pairs.reduce((a, p) => a + p[0], 0);
                const sum2 = pairs.reduce((a, p) => a + p[1], 0);
                const mean1 = sum1 / n;
                const mean2 = sum2 / n;

                let num = 0;
                let den1 = 0;
                let den2 = 0;

                for (let k = 0; k < n; k++) {
                    const d1 = pairs[k][0] - mean1;
                    const d2 = pairs[k][1] - mean2;
                    num += d1 * d2;
                    den1 += d1 * d1;
                    den2 += d2 * d2;
                }

                const den = Math.sqrt(den1 * den2);
                if (den === 0) continue;

                const r = num / den;
                const absR = Math.abs(r);

                if (absR > maxAbsR) {
                    maxAbsR = absR;
                    bestPair = {
                        col1,
                        col2,
                        r: parseFloat(r.toFixed(3))
                    };
                }
            }
        }

        return bestPair;
    },

    /**
     * Generates a dynamic dashboard plan containing KPIs, Charts, and Tables tailored to data structure.
     * @param {Array<Object>} data 
     * @param {Object} profile 
     * @returns {Object} { domain, kpis, charts, tables }
     */
    generateDashboardPlan(data, profile) {
        if (!Array.isArray(data) || data.length === 0) {
            return {
                domain: "Data Analytics",
                kpis: [],
                charts: [],
                tables: []
            };
        }

        const safeProfile = profile || {};
        const colProfiles = safeProfile.columnProfiles || {};
        const colNames = safeProfile.columnNames || Object.keys(data[0]);
        const domain = safeProfile.domain || this.detectDomain(colNames);

        // Classify columns
        const numericCols = [];
        const categoricalCols = [];
        const dateCols = [];

        colNames.forEach(col => {
            const p = colProfiles[col];
            const type = p ? p.dataType : this.inferType(data, col);
            if (type === "numeric") numericCols.push(col);
            else if (type === "date") dateCols.push(col);
            else categoricalCols.push(col);
        });

        const kpis = this.generateKPIs(data, safeProfile, numericCols, categoricalCols);
        const charts = this.generateCharts(data, safeProfile, numericCols, categoricalCols, dateCols);
        const tables = this.generateTables(data, colNames);

        return {
            domain,
            kpis,
            charts,
            tables
        };
    },

    /**
     * Detects domain label based on column names.
     */
    detectDomain(colNames) {
        const joined = colNames.join(" ").toLowerCase();
        if (joined.includes("sepal") || joined.includes("petal") || joined.includes("species") || joined.includes("iris")) {
            return "Botanical & Biological Data";
        }
        if (joined.includes("stock") || joined.includes("supplier") || joined.includes("inventory") || joined.includes("lead_time") || joined.includes("order")) {
            return "Supply Chain & Logistics";
        }
        if (joined.includes("sale") || joined.includes("revenue") || joined.includes("customer") || joined.includes("profit")) {
            return "Sales & Commercial Analytics";
        }
        if (joined.includes("employee") || joined.includes("salary") || joined.includes("department") || joined.includes("hire")) {
            return "HR & Talent Analytics";
        }
        if (joined.includes("price") || joined.includes("cost") || joined.includes("budget") || joined.includes("expense")) {
            return "Financial Analytics";
        }
        return "Automated Data Analytics";
    },

    /**
     * Simple fallback type inference if profile is unavailable.
     */
    inferType(data, col) {
        let numCount = 0;
        let total = 0;
        for (let i = 0; i < Math.min(50, data.length); i++) {
            const val = data[i][col];
            if (val !== null && val !== undefined && val !== "") {
                total++;
                if (!isNaN(Number(val))) numCount++;
            }
        }
        return total > 0 && (numCount / total) > 0.8 ? "numeric" : "categorical";
    },

    /**
     * Generates KPI Cards
     */
    generateKPIs(data, profile, numericCols, categoricalCols) {
        const kpis = [];
        const colors = ["indigo", "emerald", "cyan", "purple", "amber", "rose"];
        const icons = ["activity", "database", "bar-chart-2", "trending-up", "layers", "shield-check", "target", "pie-chart"];

        // 1. Total Volume / Records KPI
        kpis.push({
            title: "Total Records",
            value: data.length.toLocaleString(),
            change: `${(profile.columnNames || Object.keys(data[0])).length} Columns Analyzed`,
            subtitle: "Total records processed",
            icon: "database",
            color: "indigo"
        });

        // 2. Data Health KPI
        if (profile.qualityScore !== undefined) {
            kpis.push({
                title: "Data Quality Score",
                value: `${profile.qualityScore}%`,
                change: `${profile.missingPercent || 0}% missing cells`,
                subtitle: "Integrity & completeness index",
                icon: "shield-check",
                color: profile.qualityScore >= 80 ? "emerald" : "amber"
            });
        }

        // 3. Key Numeric Metrics KPIs
        numericCols.slice(0, 4).forEach((col, idx) => {
            const colProf = profile.columnProfiles ? profile.columnProfiles[col] : null;
            let sum = 0;
            let count = 0;
            let min = Infinity;
            let max = -Infinity;

            data.forEach(row => {
                const val = Number(row[col]);
                if (!isNaN(val) && val !== null) {
                    sum += val;
                    count++;
                    if (val < min) min = val;
                    if (val > max) max = val;
                }
            });

            if (count > 0) {
                const avg = sum / count;
                const isCurrency = /price|revenue|sales|cost|amount|budget|salary/i.test(col);
                const formatVal = (v) => isCurrency
                    ? `$${v >= 1000 ? v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : v.toFixed(2)}`
                    : (v >= 1000 ? v.toLocaleString(undefined, { maximumFractionDigits: 1 }) : v.toFixed(2));

                const colStats = colProf && colProf.numericStats ? colProf.numericStats : null;
                const displayVal = colStats ? formatVal(colStats.mean) : formatVal(avg);

                kpis.push({
                    title: `Avg ${this.formatLabel(col)}`,
                    value: displayVal,
                    change: `Range: ${formatVal(min)} - ${formatVal(max)}`,
                    subtitle: `Mean calculated across ${count} items`,
                    icon: icons[(idx + 2) % icons.length],
                    color: colors[(idx + 1) % colors.length]
                });
            }
        });

        // 4. Categorical Key KPI
        if (categoricalCols.length > 0 && kpis.length < 6) {
            const topCatCol = categoricalCols[0];
            const counts = {};
            data.forEach(r => {
                const val = String(r[topCatCol] || "N/A");
                counts[val] = (counts[val] || 0) + 1;
            });
            const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
            if (sorted.length > 0) {
                const [topName, topCount] = sorted[0];
                const pct = ((topCount / data.length) * 100).toFixed(1);
                kpis.push({
                    title: `Dominant ${this.formatLabel(topCatCol)}`,
                    value: topName,
                    change: `${pct}% of total records (${topCount})`,
                    subtitle: `Unique categories: ${sorted.length}`,
                    icon: "target",
                    color: "purple"
                });
            }
        }

        return kpis;
    },

    /**
     * Generates Charts
     */
    generateCharts(data, profile, numericCols, categoricalCols, dateCols) {
        const charts = [];
        let chartIndex = 1;

        // 1. Top Categorical Distribution Bar / Donut Chart
        if (categoricalCols.length > 0) {
            const catCol = categoricalCols[0];
            const counts = {};
            data.forEach(r => {
                const val = String(r[catCol] ?? "Unknown");
                counts[val] = (counts[val] || 0) + 1;
            });

            const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
            const labels = sorted.map(s => s[0]);
            const values = sorted.map(s => s[1]);

            if (labels.length > 0) {
                charts.push({
                    id: `chart_${chartIndex++}`,
                    title: `Distribution by ${this.formatLabel(catCol)}`,
                    subtitle: `Frequency breakdown of top ${labels.length} categories`,
                    type: sorted.length <= 5 ? "donut" : "bar",
                    insight: `Primary category '${labels[0]}' represents ${((values[0] / data.length) * 100).toFixed(1)}% of all entries.`,
                    data: {
                        labels,
                        values
                    }
                });
            }
        }

        // 2. Secondary Categorical vs Numeric Aggregation Bar Chart
        if (categoricalCols.length > 0 && numericCols.length > 0) {
            const catCol = categoricalCols[0];
            const numCol = numericCols[0];

            const agg = {};
            const countMap = {};

            data.forEach(r => {
                const k = String(r[catCol] ?? "Other");
                const v = Number(r[numCol]);
                if (!isNaN(v)) {
                    agg[k] = (agg[k] || 0) + v;
                    countMap[k] = (countMap[k] || 0) + 1;
                }
            });

            const sorted = Object.entries(agg)
                .map(([k, sum]) => ({ k, avg: sum / countMap[k], count: countMap[k] }))
                .sort((a, b) => b.avg - a.avg)
                .slice(0, 8);

            if (sorted.length > 0) {
                charts.push({
                    id: `chart_${chartIndex++}`,
                    title: `Average ${this.formatLabel(numCol)} by ${this.formatLabel(catCol)}`,
                    subtitle: `Comparative average values per category`,
                    type: "bar",
                    insight: `'${sorted[0].k}' has the highest average ${this.formatLabel(numCol)} (${sorted[0].avg.toFixed(2)}).`,
                    data: {
                        labels: sorted.map(s => s.k),
                        values: sorted.map(s => parseFloat(s.avg.toFixed(2)))
                    }
                });
            }
        }

        // 3. Correlation Scatter Plot
        if (numericCols.length >= 2) {
            const corrPair = this.findBestCorrelationPair(data, numericCols);
            if (corrPair) {
                const { col1, col2, r } = corrPair;
                const scatterPoints = data
                    .slice(0, 150)
                    .map(row => {
                        const x = Number(row[col1]);
                        const y = Number(row[col2]);
                        return (!isNaN(x) && !isNaN(y)) ? { x, y } : null;
                    })
                    .filter(Boolean);

                if (scatterPoints.length > 0) {
                    const direction = r > 0 ? "positive" : "negative";
                    const strength = Math.abs(r) > 0.7 ? "strong" : (Math.abs(r) > 0.4 ? "moderate" : "weak");

                    charts.push({
                        id: `chart_${chartIndex++}`,
                        title: `${this.formatLabel(col1)} vs ${this.formatLabel(col2)}`,
                        subtitle: `Scatter relationship analysis (r = ${r})`,
                        type: "scatter",
                        insight: `Displays a ${strength} ${direction} correlation (Pearson r = ${r}) between ${col1} and ${col2}.`,
                        data: {
                            labels: scatterPoints.map((_, i) => `Point ${i + 1}`),
                            values: scatterPoints,
                            datasets: [{
                                label: `${this.formatLabel(col1)} vs ${this.formatLabel(col2)}`,
                                data: scatterPoints
                            }],
                            xLabel: this.formatLabel(col1),
                            yLabel: this.formatLabel(col2)
                        }
                    });
                }
            }
        }

        // 4. Sequential or Time Series Line Chart
        if (dateCols.length > 0 && numericCols.length > 0) {
            const dateCol = dateCols[0];
            const numCol = numericCols[0];

            const timeData = data
                .map(r => ({ date: String(r[dateCol]), val: Number(r[numCol]) }))
                .filter(d => d.date && !isNaN(d.val))
                .slice(0, 30);

            if (timeData.length > 0) {
                charts.push({
                    id: `chart_${chartIndex++}`,
                    title: `${this.formatLabel(numCol)} Over Time`,
                    subtitle: `Chronological trend by ${this.formatLabel(dateCol)}`,
                    type: "line",
                    insight: `Monitors historical variance and progression across timeline events.`,
                    data: {
                        labels: timeData.map(t => t.date),
                        values: timeData.map(t => t.val)
                    }
                });
            }
        } else if (numericCols.length >= 3 && charts.length < 4) {
            // Line chart across records for third numeric metric
            const numCol = numericCols[2] || numericCols[0];
            const sample = data.slice(0, 25).map((r, i) => ({
                label: `Item ${i + 1}`,
                val: Number(r[numCol])
            })).filter(d => !isNaN(d.val));

            if (sample.length > 0) {
                charts.push({
                    id: `chart_${chartIndex++}`,
                    title: `${this.formatLabel(numCol)} Progression`,
                    subtitle: `Sequential values across dataset records`,
                    type: "line",
                    insight: `Highlights data volatility and variance across sample records.`,
                    data: {
                        labels: sample.map(s => s.label),
                        values: sample.map(s => s.val)
                    }
                });
            }
        }

        return charts;
    },

    /**
     * Generates Table Summaries
     */
    generateTables(data, colNames) {
        return [
            {
                title: "Dataset Records Sample",
                subtitle: "First 10 records of active dataset",
                records: data.slice(0, 10)
            }
        ];
    }
};

if (typeof window !== "undefined") {
    window.RecommendationEngine = RecommendationEngine;
}