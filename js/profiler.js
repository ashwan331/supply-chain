/**
 * Data Profiler Engine - Inspects dataset structure, computes column statistics,
 * detects column data types, identifies outliers/missing values, and scores data quality.
 */
const DataProfiler = {
    /**
     * Main profiling function
     * @param {Array<Object>} data 
     * @returns {Object} Comprehensive profile object
     */
    profile(data) {
        if (!Array.isArray(data) || data.length === 0) {
            return this.emptyProfile();
        }

        const totalRows = data.length;
        const columnNames = Object.keys(data[0]);
        const totalColumns = columnNames.length;

        // 1. Column-by-column profiling
        const columnProfiles = {};
        let totalMissingCells = 0;
        let totalOutliersCount = 0;
        let constantColumnsCount = 0;
        let highCardinalityColumnsCount = 0;

        columnNames.forEach(col => {
            const colProfile = this.profileColumn(data, col, totalRows);
            columnProfiles[col] = colProfile;

            totalMissingCells += colProfile.missingCount;
            totalOutliersCount += (colProfile.outliersCount || 0);

            if (colProfile.isConstant) constantColumnsCount++;
            if (colProfile.isHighCardinality) highCardinalityColumnsCount++;
        });

        // 2. Compute Duplicate Rows
        const duplicateRowsCount = this.countDuplicateRows(data);

        // 3. Compute Column Type Totals
        const typeCounts = {
            numeric: 0,
            categorical: 0,
            date: 0,
            boolean: 0,
            text: 0
        };

        Object.values(columnProfiles).forEach(cp => {
            typeCounts[cp.dataType] = (typeCounts[cp.dataType] || 0) + 1;
        });

        // 4. Data Quality Score Calculation (0 to 100%)
        const totalCells = totalRows * totalColumns;
        const missingPercent = totalCells > 0 ? (totalMissingCells / totalCells) * 100 : 0;
        const duplicatePercent = totalRows > 0 ? (duplicateRowsCount / totalRows) * 100 : 0;

        let qualityScore = 100;
        qualityScore -= (missingPercent * 1.5);
        qualityScore -= (duplicatePercent * 1.0);
        if (constantColumnsCount > 0) qualityScore -= (constantColumnsCount * 5);
        if (totalOutliersCount > 0) qualityScore -= Math.min(10, (totalOutliersCount / totalRows) * 5);

        qualityScore = Math.max(0, Math.min(100, Math.round(qualityScore)));

        // 5. Domain Signature Detection
        const domain = this.detectDomain(columnNames);

        return {
            totalRows,
            totalColumns,
            columnNames,
            columnProfiles,
            typeCounts,
            totalMissingCells,
            missingPercent: parseFloat(missingPercent.toFixed(2)),
            duplicateRowsCount,
            duplicatePercent: parseFloat(duplicatePercent.toFixed(2)),
            totalOutliersCount,
            constantColumnsCount,
            highCardinalityColumnsCount,
            qualityScore,
            domain
        };
    },

    /**
     * Profiles a single column across all rows
     */
    profileColumn(data, col, totalRows) {
        const values = data.map(r => r[col]);
        
        let missingCount = 0;
        const nonNullValues = [];

        values.forEach(v => {
            if (v === null || v === undefined || v === '' || (typeof v === 'number' && isNaN(v))) {
                missingCount++;
            } else {
                nonNullValues.push(v);
            }
        });

        const missingPercent = parseFloat(((missingCount / totalRows) * 100).toFixed(2));
        const nonNullCount = nonNullValues.length;
        
        // Count unique values
        const uniqueMap = new Map();
        nonNullValues.forEach(v => {
            const key = String(v);
            uniqueMap.set(key, (uniqueMap.get(key) || 0) + 1);
        });

        const uniqueCount = uniqueMap.size;
        const uniqueRatio = nonNullCount > 0 ? uniqueCount / nonNullCount : 0;
        const isConstant = uniqueCount === 1;
        const isHighCardinality = uniqueRatio > 0.8 && uniqueCount > 20;

        // Detect Data Type
        const dataType = this.detectColumnType(nonNullValues, col);

        const colProfile = {
            name: col,
            dataType,
            totalRows,
            missingCount,
            missingPercent,
            nonNullCount,
            uniqueCount,
            uniqueRatio: parseFloat(uniqueRatio.toFixed(3)),
            isConstant,
            isHighCardinality,
            sampleValues: nonNullValues.slice(0, 5)
        };

        // Numerical Analysis
        if (dataType === 'numeric') {
            const numValues = nonNullValues.map(v => Number(v)).filter(n => !isNaN(n)).sort((a, b) => a - b);
            if (numValues.length > 0) {
                const min = numValues[0];
                const max = numValues[numValues.length - 1];
                const sum = numValues.reduce((acc, v) => acc + v, 0);
                const mean = sum / numValues.length;

                // Median & Quartiles
                const median = this.getPercentile(numValues, 50);
                const q1 = this.getPercentile(numValues, 25);
                const q3 = this.getPercentile(numValues, 75);
                const iqr = q3 - q1;

                // Variance & Std Dev
                const variance = numValues.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / numValues.length;
                const stdDev = Math.sqrt(variance);

                // IQR Outlier Detection
                const lowerBound = q1 - (1.5 * iqr);
                const upperBound = q3 + (1.5 * iqr);
                const outliers = numValues.filter(v => v < lowerBound || v > upperBound);

                colProfile.numericStats = {
                    min: parseFloat(min.toFixed(2)),
                    max: parseFloat(max.toFixed(2)),
                    sum: parseFloat(sum.toFixed(2)),
                    mean: parseFloat(mean.toFixed(2)),
                    median: parseFloat(median.toFixed(2)),
                    stdDev: parseFloat(stdDev.toFixed(2)),
                    q1: parseFloat(q1.toFixed(2)),
                    q3: parseFloat(q3.toFixed(2)),
                    iqr: parseFloat(iqr.toFixed(2)),
                    outliersCount: outliers.length,
                    outlierLowerBound: parseFloat(lowerBound.toFixed(2)),
                    outlierUpperBound: parseFloat(upperBound.toFixed(2))
                };
                colProfile.outliersCount = outliers.length;
            }
        }

        // Categorical / Text Analysis
        if (dataType === 'categorical' || dataType === 'text' || dataType === 'boolean') {
            const sortedCategories = Array.from(uniqueMap.entries())
                .sort((a, b) => b[1] - a[1]);

            const topCategories = sortedCategories.slice(0, 8).map(([cat, count]) => ({
                category: cat,
                count,
                percentage: parseFloat(((count / nonNullCount) * 100).toFixed(1))
            }));

            const rareCategories = sortedCategories
                .filter(([_, count]) => (count / nonNullCount) < 0.02)
                .map(([cat]) => cat);

            colProfile.categoricalStats = {
                mode: sortedCategories.length > 0 ? sortedCategories[0][0] : null,
                topCategories,
                rareCategoriesCount: rareCategories.length
            };
        }

        // Date Analysis
        if (dataType === 'date') {
            const dates = nonNullValues
                .map(v => new Date(v))
                .filter(d => !isNaN(d.getTime()))
                .sort((a, b) => a - b);

            if (dates.length > 0) {
                const minDate = dates[0];
                const maxDate = dates[dates.length - 1];
                const timeSpanDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));

                colProfile.dateStats = {
                    minDate: minDate.toISOString().split('T')[0],
                    maxDate: maxDate.toISOString().split('T')[0],
                    timeSpanDays,
                    timeSpanMonths: parseFloat((timeSpanDays / 30.4).toFixed(1))
                };
            }
        }

        return colProfile;
    },

    /**
     * Automatic column data type inference
     */
    detectColumnType(sampleValues, colName) {
        if (sampleValues.length === 0) return 'text';

        const lowerName = colName.toLowerCase();

        // 1. Explicit name hints for date
        if (lowerName.includes('date') || lowerName.includes('time') || lowerName.includes('timestamp') || lowerName.includes('month') || lowerName.includes('year')) {
            const dateMatches = sampleValues.filter(v => {
                if (typeof v === 'number' && v > 1900 && v < 2100) return true;
                const d = new Date(v);
                return !isNaN(d.getTime()) && String(v).length >= 4;
            });
            if (dateMatches.length / sampleValues.length > 0.6) return 'date';
        }

        // 2. Check for Boolean
        const boolMatches = sampleValues.filter(v => {
            if (typeof v === 'boolean') return true;
            const str = String(v).toLowerCase();
            return str === 'true' || str === 'false' || str === 'yes' || str === 'no' || str === '1' || str === '0';
        });
        if (boolMatches.length / sampleValues.length > 0.9 && new Set(sampleValues.map(v => String(v).toLowerCase())).size <= 2) {
            return 'boolean';
        }

        // 3. Check for Numeric
        const numMatches = sampleValues.filter(v => typeof v === 'number' || (!isNaN(v) && v !== '' && v !== null));
        if (numMatches.length / sampleValues.length > 0.85) {
            return 'numeric';
        }

        // 4. Check for Date formatted strings (e.g. YYYY-MM-DD or MM/DD/YYYY)
        const dateStringMatches = sampleValues.filter(v => {
            if (typeof v !== 'string') return false;
            const d = new Date(v);
            return !isNaN(d.getTime()) && (v.includes('-') || v.includes('/')) && v.length >= 8;
        });
        if (dateStringMatches.length / sampleValues.length > 0.7) {
            return 'date';
        }

        // 5. Categorical vs Text (based on cardinality)
        const uniqueCount = new Set(sampleValues).size;
        if (uniqueCount <= 30 || (uniqueCount / sampleValues.length < 0.2)) {
            return 'categorical';
        }

        return 'text';
    },

    /**
     * Compute percentiles
     */
    getPercentile(sortedNums, percentile) {
        if (sortedNums.length === 0) return 0;
        const index = (percentile / 100) * (sortedNums.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;
        return sortedNums[lower] * (1 - weight) + sortedNums[upper] * weight;
    },

    /**
     * Count duplicate rows in dataset
     */
    countDuplicateRows(data) {
        const seen = new Set();
        let duplicates = 0;
        data.forEach(row => {
            const key = JSON.stringify(row);
            if (seen.has(key)) duplicates++;
            else seen.add(key);
        });
        return duplicates;
    },

    /**
     * Detect domain based on column headers
     */
    detectDomain(colNames) {
        const lowerCols = colNames.map(c => c.toLowerCase()).join(' ');

        if (lowerCols.includes('stock') || lowerCols.includes('lead_time') || lowerCols.includes('sku') || lowerCols.includes('reorder') || lowerCols.includes('inventory') || lowerCols.includes('supplier')) {
            return 'Supply Chain & Inventory';
        }
        if (lowerCols.includes('revenue') || lowerCols.includes('sales') || lowerCols.includes('discount') || lowerCols.includes('customer') || lowerCols.includes('order')) {
            return 'Sales Analytics';
        }
        if (lowerCols.includes('salary') || lowerCols.includes('employee') || lowerCols.includes('department') || lowerCols.includes('attrition') || lowerCols.includes('tenure')) {
            return 'HR & Employee Data';
        }
        if (lowerCols.includes('patient') || lowerCols.includes('diagnosis') || lowerCols.includes('treatment') || lowerCols.includes('hospital') || lowerCols.includes('stay')) {
            return 'Healthcare Analytics';
        }

        return 'General Data Analytics';
    },

    /**
     * Fallback empty profile
     */
    emptyProfile() {
        return {
            totalRows: 0,
            totalColumns: 0,
            columnNames: [],
            columnProfiles: {},
            typeCounts: { numeric: 0, categorical: 0, date: 0, boolean: 0, text: 0 },
            totalMissingCells: 0,
            missingPercent: 0,
            duplicateRowsCount: 0,
            duplicatePercent: 0,
            totalOutliersCount: 0,
            constantColumnsCount: 0,
            highCardinalityColumnsCount: 0,
            qualityScore: 100,
            domain: 'Unknown'
        };
    }
};
