/**
 * Insights Engine
 *
 * Universal automated insight and executive briefing generator.
 *
 * Designed to work with arbitrary structured datasets.
 * It uses the DataProfiler and RecommendationEngine outputs
 * instead of assuming a specific business domain.
 */

const InsightsEngine = {

    // ============================================================
    // MAIN INSIGHT GENERATOR
    // ============================================================

    generate(
        data,
        profile
    ) {

        if (
            !Array.isArray(data) ||
            data.length === 0 ||
            !profile
        ) {

            return {

                executiveBriefing:
                    "No dataset loaded to analyze.",

                insights: []

            };

        }


        const columnProfiles =
            profile.columnProfiles || {};


        const columns =
            Object.values(
                columnProfiles
            );


        const numericCols =
            columns.filter(
                column =>
                    column.dataType ===
                    "numeric"
            );


        const categoricalCols =
            columns.filter(
                column =>
                    column.dataType ===
                    "categorical"
            );


        const dateCols =
            columns.filter(
                column =>
                    column.dataType ===
                    "date"
            );


        const textCols =
            columns.filter(
                column =>
                    column.dataType ===
                    "text"
            );


        const identifierCols =
            this.findIdentifierColumns(
                data,
                columns
            );


        const measureCols =
            numericCols.filter(
                column =>
                    !identifierCols.some(
                        id =>
                            id.name ===
                            column.name
                    )
            );


        const usableMeasures =
            measureCols.length > 0
                ? measureCols
                : numericCols;


        const insights = [];


        // ========================================================
        // 1. EXECUTIVE BRIEFING
        // ========================================================

        const executiveBriefing =
            this.generateExecutiveBriefing(
                data,
                profile,
                usableMeasures,
                categoricalCols,
                dateCols,
                identifierCols
            );


        // ========================================================
        // 2. CATEGORY CONCENTRATION
        // ========================================================

        this.addCategoryInsight(
            insights,
            data,
            categoricalCols,
            profile
        );


        // ========================================================
        // 3. NUMERIC DISTRIBUTION
        // ========================================================

        this.addDistributionInsight(
            insights,
            data,
            usableMeasures
        );


        // ========================================================
        // 4. STRONGEST CORRELATION
        // ========================================================

        this.addCorrelationInsight(
            insights,
            data,
            usableMeasures
        );


        // ========================================================
        // 5. DATA QUALITY
        // ========================================================

        this.addQualityInsight(
            insights,
            profile
        );


        // ========================================================
        // 6. TIME COVERAGE
        // ========================================================

        this.addTimeInsight(
            insights,
            dateCols
        );


        // ========================================================
        // 7. NUMERIC EXTREMES
        // ========================================================

        this.addExtremeValueInsight(
            insights,
            data,
            usableMeasures
        );


        // ========================================================
        // 8. DATASET STRUCTURE
        // ========================================================

        this.addStructureInsight(
            insights,
            profile,
            numericCols,
            categoricalCols,
            dateCols,
            textCols,
            identifierCols
        );


        // ========================================================
        // 9. DYNAMIC DOMAIN RECOMMENDATION
        // ========================================================

        this.addDomainRecommendation(
            insights,
            profile.domain,
            usableMeasures,
            categoricalCols,
            dateCols
        );


        // ========================================================
        // FALLBACK
        // ========================================================

        if (
            insights.length === 0
        ) {

            insights.push({

                id:
                    "insight_general_summary",

                type:
                    "summary",

                level:
                    "info",

                icon:
                    "sparkles",

                title:
                    "Dataset Successfully Analyzed",

                text:
                    `The platform analyzed ${Number(
                        profile.totalRows ||
                        data.length
                    ).toLocaleString()} records and ${Number(
                        profile.totalColumns ||
                        columns.length
                    ).toLocaleString()} columns. Explore the Dashboard, Profiler, Data Quality, and Data Explorer tabs for more detail.`

            });

        }


        return {

            executiveBriefing,

            insights

        };

    },


    // ============================================================
    // EXECUTIVE BRIEFING
    // ============================================================

    generateExecutiveBriefing(
        data,
        profile,
        numericCols,
        categoricalCols,
        dateCols,
        identifierCols
    ) {

        const rows =
            Number(
                profile.totalRows ||
                data.length
            );


        const columns =
            Number(
                profile.totalColumns ||
                Object.keys(
                    profile.columnProfiles || {}
                ).length
            );


        const domain =
            profile.domain ||
            "General Data Analytics";


        const quality =
            Number(
                profile.qualityScore
            ) || 0;


        const missing =
            Number(
                profile.missingPercent
            ) || 0;


        const duplicates =
            Number(
                profile.duplicateRowsCount
            ) || 0;


        const numericCount =
            numericCols.length;


        const categoricalCount =
            categoricalCols.length;


        const dateCount =
            dateCols.length;


        const identifierCount =
            identifierCols.length;


        let briefing =
            `This ${domain.toLowerCase()} dataset contains ${rows.toLocaleString()} records across ${columns.toLocaleString()} columns.`;


        if (
            numericCount > 0
        ) {

            briefing +=
                ` The dataset contains ${numericCount} measurable numeric field${numericCount === 1 ? "" : "s"} suitable for statistical analysis.`;

        }


        if (
            categoricalCount > 0
        ) {

            briefing +=
                ` ${categoricalCount} categorical dimension${categoricalCount === 1 ? " is" : "s are"} available for segmentation.`;

        }


        if (
            dateCount > 0
        ) {

            briefing +=
                ` Time-based analysis is available through ${dateCount} date field${dateCount === 1 ? "" : "s"}.`;

        }


        if (
            identifierCount > 0
        ) {

            briefing +=
                ` ${identifierCount} identifier-like field${identifierCount === 1 ? " was" : "s were"} excluded from primary business-measure selection.`;

        }


        briefing +=
            ` Overall data quality is ${quality.toFixed(0)}%.`;


        if (
            missing >
            5
        ) {

            briefing +=
                ` Missing data is a notable consideration because ${missing.toFixed(1)}% of cells are missing.`;

        } else if (
            missing >
            0
        ) {

            briefing +=
                ` A small amount of missing data (${missing.toFixed(1)}%) was detected.`;

        } else {

            briefing +=
                " No missing cells were detected.";

        }


        if (
            duplicates >
            0
        ) {

            briefing +=
                ` ${duplicates.toLocaleString()} duplicate row${duplicates === 1 ? "" : "s"} were identified for review.`;

        }


        return briefing;

    },


    // ============================================================
    // CATEGORY INSIGHT
    // ============================================================

    addCategoryInsight(
        insights,
        data,
        categoricalCols,
        profile
    ) {

        if (
            !Array.isArray(
                categoricalCols
            ) ||
            categoricalCols.length === 0
        ) {

            return;

        }


        const categoryColumn =
            this.findBestCategory(
                categoricalCols
            );


        if (!categoryColumn) {

            return;

        }


        const stats =
            categoryColumn.categoricalStats;


        if (
            !stats ||
            !Array.isArray(
                stats.topCategories
            ) ||
            stats.topCategories.length ===
                0
        ) {

            return;

        }


        const top =
            stats.topCategories[0];


        const percentage =
            Number(
                top.percentage
            ) || 0;


        let level =
            "info";


        let type =
            "distribution";


        if (
            percentage >=
            70
        ) {

            level =
                "warning";


            type =
                "concentration";

        } else if (
            percentage >=
            50
        ) {

            level =
                "primary";

        } else {

            level =
                "success";

        }


        insights.push({

            id:
                "insight_category_concentration",

            type,

            level,

            icon:
                "layers",

            title:
                `Leading ${this.formatLabel(
                    categoryColumn.name
                )}: ${String(
                    top.category
                )}`,

            text:
                `The category "${String(
                    top.category
                )}" represents ${percentage.toFixed(
                    1
                )}% of all records (${Number(
                    top.count
                ).toLocaleString()} records). This indicates ${
                    percentage >= 70
                        ? "a highly concentrated distribution that may deserve further investigation"
                        : percentage >= 50
                            ? "a meaningful concentration within this dimension"
                            : "the largest segment within this categorical dimension"
                }.`

        });

    },


    // ============================================================
    // NUMERIC DISTRIBUTION
    // ============================================================

    addDistributionInsight(
        insights,
        data,
        numericCols
    ) {

        if (
            !Array.isArray(
                numericCols
            ) ||
            numericCols.length === 0
        ) {

            return;

        }


        const measure =
            this.findBestMeasure(
                numericCols
            );


        if (
            !measure ||
            !measure.numericStats
        ) {

            return;

        }


        const stats =
            measure.numericStats;


        const mean =
            Number(
                stats.mean
            ) || 0;


        const median =
            Number(
                stats.median
            ) || 0;


        const min =
            Number(
                stats.min
            ) || 0;


        const max =
            Number(
                stats.max
            ) || 0;


        const stdDev =
            Number(
                stats.stdDev
            ) || 0;


        const variabilityRatio =
            Math.abs(
                mean
            ) > 0
                ? Math.abs(
                    stdDev /
                    mean
                )
                : 0;


        let interpretation =
            "Values show a measurable distribution around the average.";


        if (
            variabilityRatio >=
            1
        ) {

            interpretation =
                "The field shows very high relative variability, suggesting substantial differences between records.";

        } else if (
            variabilityRatio >=
            0.5
        ) {

            interpretation =
                "The field shows moderate-to-high variability across records.";

        } else if (
            variabilityRatio <
            0.2
        ) {

            interpretation =
                "The field is relatively stable across records.";

        }


        insights.push({

            id:
                "insight_numeric_distribution",

            type:
                "statistical",

            level:
                "info",

            icon:
                "bar-chart-3",

            title:
                `${this.formatLabel(
                    measure.name
                )} Distribution`,

            text:
                `${this.formatLabel(
                    measure.name
                )} has an average of ${this.formatValue(
                    mean,
                    measure.name
                )}, a median of ${this.formatValue(
                    median,
                    measure.name
                )}, and a range from ${this.formatValue(
                    min,
                    measure.name
                )} to ${this.formatValue(
                    max,
                    measure.name
                )}. Standard deviation is ${this.formatCompactNumber(
                    stdDev
                )}. ${interpretation}`

        });

    },


    // ============================================================
    // CORRELATION INSIGHT
    // ============================================================

    addCorrelationInsight(
        insights,
        data,
        numericCols
    ) {

        if (
            !Array.isArray(
                numericCols
            ) ||
            numericCols.length < 2
        ) {

            return;

        }


        let pair = null;


        if (
            typeof RecommendationEngine
                .findBestCorrelationPair ===
            "function"
        ) {

            pair =
                RecommendationEngine.findBestCorrelationPair(
                    data,
                    numericCols
                );

        }


        if (
            !pair
        ) {

            pair =
                this.findStrongestCorrelationPair(
                    data,
                    numericCols
                );

        }


        if (
            !pair
        ) {

            return;

        }


        const correlation =
            this.computePearsonCorrelation(
                data,
                pair.x.name,
                pair.y.name
            );


        const absoluteCorrelation =
            Math.abs(
                correlation
            );


        if (
            absoluteCorrelation <
            0.25
        ) {

            insights.push({

                id:
                    "insight_correlation",

                type:
                    "relationship",

                level:
                    "info",

                icon:
                    "git-merge",

                title:
                    "Weak Relationship Between Measures",

                text:
                    `The strongest measured linear relationship is between ${this.formatLabel(
                        pair.x.name
                    )} and ${this.formatLabel(
                        pair.y.name
                    )}, with Pearson correlation r = ${correlation.toFixed(
                        2
                    )}. The relationship is relatively weak, so these variables do not move together strongly in a linear pattern.`

            });


            return;

        }


        let level =
            "info";


        let description =
            "moderate";


        if (
            absoluteCorrelation >=
            0.75
        ) {

            level =
                "primary";

            description =
                "strong";

        } else if (
            absoluteCorrelation >=
            0.5
        ) {

            level =
                "success";

            description =
                "moderately strong";

        }


        const direction =
            correlation >=
            0
                ? "positive"
                : "inverse";


        insights.push({

            id:
                "insight_correlation",

            type:
                "relationship",

            level,

            icon:
                "git-branch",

            title:
                `${description.charAt(
                    0
                ).toUpperCase()}${description.slice(
                    1
                )} ${direction} relationship detected`,

            text:
                `${this.formatLabel(
                    pair.x.name
                )} and ${this.formatLabel(
                    pair.y.name
                )} have a Pearson correlation coefficient of r = ${correlation.toFixed(
                    2
                )}, indicating a ${description} ${direction} linear relationship.`

        });

    },


    // ============================================================
    // DATA QUALITY
    // ============================================================

    addQualityInsight(
        insights,
        profile
    ) {

        const outliers =
            Number(
                profile.totalOutliersCount
            ) || 0;


        const missing =
            Number(
                profile.missingPercent
            ) || 0;


        const duplicates =
            Number(
                profile.duplicateRowsCount
            ) || 0;


        const quality =
            Number(
                profile.qualityScore
            ) || 0;


        if (
            outliers === 0 &&
            missing === 0 &&
            duplicates === 0
        ) {

            insights.push({

                id:
                    "insight_quality_positive",

                type:
                    "quality",

                level:
                    "success",

                icon:
                    "shield-check",

                title:
                    "Strong Data Quality",

                text:
                    `The dataset currently shows no detected statistical outliers, missing cells, or duplicate rows. The overall quality score is ${quality.toFixed(
                        0
                    )}%, indicating a clean analytical base.`

            });


            return;

        }


        const issues = [];


        if (
            missing >
            0
        ) {

            issues.push(
                `${missing.toFixed(
                    1
                )}% missing cells`
            );

        }


        if (
            outliers >
            0
        ) {

            issues.push(
                `${outliers.toLocaleString()} statistical outliers`
            );

        }


        if (
            duplicates >
            0
        ) {

            issues.push(
                `${duplicates.toLocaleString()} duplicate rows`
            );

        }


        let level =
            "info";


        if (
            missing >
                10 ||
            duplicates >
                0 ||
            outliers >
                20
        ) {

            level =
                "warning";

        }


        insights.push({

            id:
                "insight_quality_warning",

            type:
                "quality",

            level,

            icon:
                "alert-triangle",

            title:
                "Data Quality Review Recommended",

            text:
                `The dataset contains ${issues.join(
                    ", "
                )}. Review these issues in Data Quality Studio before making high-impact analytical decisions.`

        });

    },


    // ============================================================
    // TIME INSIGHT
    // ============================================================

    addTimeInsight(
        insights,
        dateCols
    ) {

        if (
            !Array.isArray(
                dateCols
            ) ||
            dateCols.length ===
                0
        ) {

            return;

        }


        const dateColumn =
            dateCols[0];


        const stats =
            dateColumn.dateStats;


        if (!stats) {

            return;

        }


        const start =
            stats.minDate ||
            "N/A";


        const end =
            stats.maxDate ||
            "N/A";


        const days =
            Number(
                stats.timeSpanDays
            ) || 0;


        const months =
            Number(
                stats.timeSpanMonths
            ) || 0;


        insights.push({

            id:
                "insight_time_span",

            type:
                "trend",

            level:
                "info",

            icon:
                "calendar-range",

            title:
                "Temporal Coverage Available",

            text:
                `The dataset contains time-based information from ${start} to ${end}, covering approximately ${days.toLocaleString()} days (${months.toFixed(
                    1
                )} months). This makes trend and time-series analysis possible.`

        });

    },


    // ============================================================
    // EXTREME VALUES
    // ============================================================

    addExtremeValueInsight(
        insights,
        data,
        numericCols
    ) {

        if (
            !Array.isArray(
                numericCols
            ) ||
            numericCols.length === 0
        ) {

            return;

        }


        const measure =
            this.findBestMeasure(
                numericCols
            );


        if (!measure) {

            return;

        }


        const values =
            data
                .map(
                    row =>
                        Number(
                            row[
                                measure.name
                            ]
                        )
                )
                .filter(
                    value =>
                        Number.isFinite(
                            value
                        )
                );


        if (
            values.length <
            3
        ) {

            return;

        }


        const highest =
            Math.max(
                ...values
            );


        const lowest =
            Math.min(
                ...values
            );


        const highestIndex =
            values.indexOf(
                highest
            );


        const lowestIndex =
            values.indexOf(
                lowest
            );


        if (
            highest ===
                lowest
        ) {

            return;

        }


        insights.push({

            id:
                "insight_extreme_values",

            type:
                "statistical",

            level:
                "info",

            icon:
                "arrow-up-down",

            title:
                `Range of ${this.formatLabel(
                    measure.name
                )}`,

            text:
                `Observed ${this.formatLabel(
                    measure.name
                )} values range from ${this.formatValue(
                    lowest,
                    measure.name
                )} to ${this.formatValue(
                    highest,
                    measure.name
                )} across ${values.length.toLocaleString()} valid observations. The highest and lowest values occur at different records, indicating meaningful variation in the measure.`

        });

    },


    // ============================================================
    // STRUCTURE INSIGHT
    // ============================================================

    addStructureInsight(
        insights,
        profile,
        numericCols,
        categoricalCols,
        dateCols,
        textCols,
        identifierCols
    ) {

        const parts = [];


        if (
            numericCols.length >
            0
        ) {

            parts.push(
                `${numericCols.length} numeric`
            );

        }


        if (
            categoricalCols.length >
            0
        ) {

            parts.push(
                `${categoricalCols.length} categorical`
            );

        }


        if (
            dateCols.length >
            0
        ) {

            parts.push(
                `${dateCols.length} date`
            );

        }


        if (
            textCols.length >
            0
        ) {

            parts.push(
                `${textCols.length} text`
            );

        }


        if (
            identifierCols.length >
            0
        ) {

            parts.push(
                `${identifierCols.length} identifier`
            );

        }


        if (
            parts.length ===
            0
        ) {

            return;

        }


        insights.push({

            id:
                "insight_dataset_structure",

            type:
                "structure",

            level:
                "info",

            icon:
                "scan-search",

            title:
                "Dataset Structure Detected",

            text:
                `Automatic profiling identified ${parts.join(
                    ", "
                )} field types. The analytics engine uses these detected roles to select appropriate KPIs, visualizations, tables, and statistical analyses.`

        });

    },


    // ============================================================
    // DOMAIN RECOMMENDATION
    // ============================================================

    addDomainRecommendation(
        insights,
        domain,
        numericCols,
        categoricalCols,
        dateCols
    ) {

        const normalized =
            String(
                domain || ""
            ).toLowerCase();


        let title =
            "Recommended Analytical Approach";


        let text =
            "Use the generated KPIs, charts, profiler results, and statistical insights to investigate the most important patterns in this dataset.";


        let icon =
            "sparkles";


        if (
            normalized.includes(
                "sales"
            )
        ) {

            title =
                "Sales Analytics Opportunity";


            text =
                "Compare major categories or segments, monitor important numerical measures, and use time-based analysis when dates are available to identify changes in performance.";


            icon =
                "shopping-bag";

        } else if (
            normalized.includes(
                "hr"
            ) ||
            normalized.includes(
                "employee"
            )
        ) {

            title =
                "Workforce Analytics Opportunity";


            text =
                "Compare employee groups and numerical workforce measures to understand distributions, differences between groups, and potential relationships between employee attributes.";


            icon =
                "users";

        } else if (
            normalized.includes(
                "health"
            )
        ) {

            title =
                "Healthcare Analytics Opportunity";


            text =
                "Review patient or treatment-related numerical measures, compare meaningful categories, and investigate relationships between measurable health attributes.";


            icon =
                "heart-pulse";

        } else if (
            normalized.includes(
                "finance"
            )
        ) {

            title =
                "Financial Analytics Opportunity";


            text =
                "Focus on the strongest monetary measures, category-level distributions, time trends, and relationships between financial variables.";


            icon =
                "landmark";

        } else if (
            normalized.includes(
                "marketing"
            )
        ) {

            title =
                "Marketing Analytics Opportunity";


            text =
                "Compare campaign or customer dimensions, examine measurable performance indicators, and use correlations and time trends to identify meaningful patterns.";


            icon =
                "megaphone";

        } else if (
            normalized.includes(
                "supply"
            ) ||
            normalized.includes(
                "inventory"
            )
        ) {

            title =
                "Supply Chain Analytics Opportunity";


            text =
                "Use the dedicated Supply Chain Studio when inventory, demand, reorder, supplier, or product fields are available alongside the generic analytics tools.";


            icon =
                "boxes";

        }


        insights.push({

            id:
                "insight_domain_recommendation",

            type:
                "action",

            level:
                "success",

            icon,

            title,

            text

        });

    },


    // ============================================================
    // IDENTIFIER DETECTION
    // ============================================================

    findIdentifierColumns(
        data,
        columns
    ) {

        if (
            !Array.isArray(
                columns
            )
        ) {

            return [];

        }


        const rowCount =
            data.length;


        return columns.filter(
            column => {

                const name =
                    String(
                        column.name || ""
                    )
                        .toLowerCase()
                        .replace(
                            /[\s_-]+/g,
                            ""
                        );


                const uniqueCount =
                    Number(
                        column.uniqueCount
                    ) || 0;


                const uniqueRatio =
                    rowCount > 0
                        ? uniqueCount /
                          rowCount
                        : 0;


                const looksLikeId =
                    name === "id" ||
                    name.endsWith("id") ||
                    name.includes(
                        "identifier"
                    ) ||
                    name === "index";


                const nearlyUnique =
                    uniqueRatio >=
                        0.95 &&
                    uniqueCount >=
                        5;


                return (
                    looksLikeId ||
                    nearlyUnique
                );

            }
        );

    },


    // ============================================================
    // BEST CATEGORY
    // ============================================================

    findBestCategory(
        categoricalCols
    ) {

        if (
            !Array.isArray(
                categoricalCols
            ) ||
            categoricalCols.length ===
                0
        ) {

            return null;

        }


        const candidates =
            categoricalCols.filter(
                column => {

                    const count =
                        Number(
                            column.uniqueCount
                        ) || 0;


                    return (
                        count >=
                            2 &&
                        count <=
                            50
                    );

                }
            );


        const pool =
            candidates.length > 0
                ? candidates
                : categoricalCols;


        return [...pool].sort(
            (a, b) =>
                this.categoryScore(
                    b
                ) -
                this.categoryScore(
                    a
                )
        )[0] || null;

    },


    categoryScore(
        column
    ) {

        const name =
            String(
                column.name || ""
            ).toLowerCase();


        const uniqueCount =
            Number(
                column.uniqueCount
            ) || 0;


        let score = 0;


        if (
            uniqueCount >=
                2 &&
            uniqueCount <=
                10
        ) {

            score +=
                30;

        } else if (
            uniqueCount <=
            25
        ) {

            score +=
                20;

        } else if (
            uniqueCount <=
            50
        ) {

            score +=
                10;

        }


        const keywords = [

            "category",

            "type",

            "class",

            "group",

            "region",

            "department",

            "segment",

            "status",

            "species",

            "gender",

            "city",

            "country",

            "brand",

            "product"

        ];


        keywords.forEach(
            keyword => {

                if (
                    name.includes(
                        keyword
                    )
                ) {

                    score +=
                        10;

                }

            }
        );


        return score;

    },


    // ============================================================
    // BEST MEASURE
    // ============================================================

    findBestMeasure(
        numericCols
    ) {

        if (
            !Array.isArray(
                numericCols
            ) ||
            numericCols.length ===
                0
        ) {

            return null;

        }


        return [...numericCols].sort(
            (a, b) => {

                const aName =
                    String(
                        a.name || ""
                    ).toLowerCase();


                const bName =
                    String(
                        b.name || ""
                    ).toLowerCase();


                return (
                    this.measureScore(
                        bName
                    ) -
                    this.measureScore(
                        aName
                    )
                );

            }
        )[0];

    },


    measureScore(
        name
    ) {

        const keywords = [

            "revenue",

            "sales",

            "amount",

            "value",

            "profit",

            "income",

            "cost",

            "price",

            "quantity",

            "score",

            "rating",

            "demand",

            "salary",

            "height",

            "weight",

            "length",

            "width",

            "measurement",

            "age"

        ];


        let score =
            0;


        keywords.forEach(
            keyword => {

                if (
                    name.includes(
                        keyword
                    )
                ) {

                    score +=
                        10;

                }

            }
        );


        if (
            name ===
            "id" ||
            name.endsWith(
                "id"
            )
        ) {

            score -=
                50;

        }


        return score;

    },


    // ============================================================
    // STRONGEST CORRELATION FALLBACK
    // ============================================================

    findStrongestCorrelationPair(
        data,
        numericCols
    ) {

        let bestPair =
            null;


        let bestStrength =
            -1;


        for (
            let i = 0;
            i < numericCols.length;
            i++
        ) {

            for (
                let j = i + 1;
                j < numericCols.length;
                j++
            ) {

                const correlation =
                    this.computePearsonCorrelation(
                        data,
                        numericCols[i].name,
                        numericCols[j].name
                    );


                const strength =
                    Math.abs(
                        correlation
                    );


                if (
                    strength >
                    bestStrength
                ) {

                    bestStrength =
                        strength;


                    bestPair = {

                        x:
                            numericCols[i],

                        y:
                            numericCols[j]

                    };

                }

            }

        }


        return bestPair;

    },


    // ============================================================
    // PEARSON CORRELATION
    // ============================================================

    computePearsonCorrelation(
        data,
        columnX,
        columnY
    ) {

        const pairs =
            data
                .map(
                    row => ({

                        x:
                            Number(
                                row[
                                    columnX
                                ]
                            ),

                        y:
                            Number(
                                row[
                                    columnY
                                ]
                            )

                    })
                )
                .filter(
                    pair =>
                        Number.isFinite(
                            pair.x
                        ) &&
                        Number.isFinite(
                            pair.y
                        )
                );


        const n =
            pairs.length;


        if (
            n <
            3
        ) {

            return 0;

        }


        const sumX =
            pairs.reduce(
                (total, pair) =>
                    total +
                    pair.x,
                0
            );


        const sumY =
            pairs.reduce(
                (total, pair) =>
                    total +
                    pair.y,
                0
            );


        const sumX2 =
            pairs.reduce(
                (total, pair) =>
                    total +
                    (
                        pair.x *
                        pair.x
                    ),
                0
            );


        const sumY2 =
            pairs.reduce(
                (total, pair) =>
                    total +
                    (
                        pair.y *
                        pair.y
                    ),
                0
            );


        const sumXY =
            pairs.reduce(
                (total, pair) =>
                    total +
                    (
                        pair.x *
                        pair.y
                    ),
                0
            );


        const numerator =
            (
                n *
                sumXY
            ) -
            (
                sumX *
                sumY
            );


        const denominator =
            Math.sqrt(
                (
                    (
                        n *
                        sumX2
                    ) -
                    (
                        sumX *
                        sumX
                    )
                ) *
                (
                    (
                        n *
                        sumY2
                    ) -
                    (
                        sumY *
                        sumY
                    )
                )
            );


        return denominator ===
            0
            ? 0
            : numerator /
              denominator;

    },


    // ============================================================
    // VALUE FORMATTING
    // ============================================================

    formatValue(
        value,
        columnName = ""
    ) {

        if (
            !Number.isFinite(
                Number(
                    value
                )
            )
        ) {

            return "N/A";

        }


        const numericValue =
            Number(
                value
            );


        const name =
            String(
                columnName
            ).toLowerCase();


        const currencyKeywords = [

            "revenue",

            "sales",

            "price",

            "cost",

            "salary",

            "income",

            "profit",

            "spend",

            "amount",

            "value"

        ];


        const isCurrency =
            currencyKeywords.some(
                keyword =>
                    name.includes(
                        keyword
                    )
            );


        if (
            isCurrency
        ) {

            if (
                Math.abs(
                    numericValue
                ) >=
                1000000
            ) {

                return `$${(
                    numericValue /
                    1000000
                ).toFixed(
                    2
                )}M`;

            }


            if (
                Math.abs(
                    numericValue
                ) >=
                1000
            ) {

                return `$${(
                    numericValue /
                    1000
                ).toFixed(
                    1
                )}K`;

            }


            return `$${numericValue.toFixed(
                2
            )}`;

        }


        return this.formatCompactNumber(
            numericValue
        );

    },


    formatCompactNumber(
        value
    ) {

        const numericValue =
            Number(
                value
            );


        if (
            !Number.isFinite(
                numericValue
            )
        ) {

            return "N/A";

        }


        if (
            Math.abs(
                numericValue
            ) >=
            1000000
        ) {

            return `${(
                numericValue /
                1000000
            ).toFixed(
                2
            )}M`;

        }


        if (
            Math.abs(
                numericValue
            ) >=
            1000
        ) {

            return `${(
                numericValue /
                1000
            ).toFixed(
                1
            )}K`;

        }


        return Number.isInteger(
            numericValue
        )
            ? numericValue.toLocaleString()
            : numericValue.toFixed(
                2
            );

    },


    // ============================================================
    // LABEL FORMATTING
    // ============================================================

    formatLabel(
        value
    ) {

        if (
            value ===
                null ||
            value ===
                undefined
        ) {

            return "";

        }


        return String(
            value
        )
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
            .toLowerCase()
            .replace(
                /\b\w/g,
                char =>
                    char.toUpperCase()
            );

    }

};