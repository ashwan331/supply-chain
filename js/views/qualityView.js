/**
 * Quality View Controller - Renders Data Health Audit table & cleaning tools
 */
const QualityView = {
    render(profile) {
        if (!profile || !profile.columnProfiles) return;

        // 1. Render Health Metrics Cards
        const grid = document.getElementById('qualityMetricsGrid');
        if (grid) {
            const qualityColor = profile.qualityScore >= 80 ? 'text-emerald-400' : 'text-amber-400';
            grid.innerHTML = `
                <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
                    <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Data Quality Score</span>
                    <h3 class="font-heading font-extrabold text-3xl ${qualityColor} mt-1 font-mono">${profile.qualityScore}%</h3>
                    <p class="text-[11px] text-slate-500 mt-1">Evaluated across all attributes</p>
                </div>
                <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
                    <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Missing Data Cells</span>
                    <h3 class="font-heading font-extrabold text-3xl text-amber-400 mt-1 font-mono">${profile.totalMissingCells}</h3>
                    <p class="text-[11px] text-slate-500 mt-1">${profile.missingPercent}% total cell missingness</p>
                </div>
                <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
                    <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Duplicate Rows</span>
                    <h3 class="font-heading font-extrabold text-3xl text-purple-400 mt-1 font-mono">${profile.duplicateRowsCount}</h3>
                    <p class="text-[11px] text-slate-500 mt-1">${profile.duplicatePercent}% row duplication</p>
                </div>
                <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
                    <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Statistical Outliers</span>
                    <h3 class="font-heading font-extrabold text-3xl text-rose-400 mt-1 font-mono">${profile.totalOutliersCount}</h3>
                    <p class="text-[11px] text-slate-500 mt-1">Outside 1.5× IQR threshold</p>
                </div>
            `;
        }

        // 2. Render Health Audit Table
        const tbody = document.getElementById('qualityTableBody');
        if (!tbody) return;

        tbody.innerHTML = Object.values(profile.columnProfiles).map(col => {
            let statusBadge = '<span class="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Good</span>';
            let actionText = 'No Action Required';

            if (col.missingPercent > 10 || (col.numericStats && col.numericStats.outliersCount > 10)) {
                statusBadge = '<span class="bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Needs Review</span>';
                actionText = col.missingPercent > 10 ? 'Impute Missing / Impute Median' : 'Cap Outliers (Winsorize)';
            } else if (col.missingPercent > 0 || (col.numericStats && col.numericStats.outliersCount > 0)) {
                statusBadge = '<span class="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Review</span>';
                actionText = col.missingPercent > 0 ? 'Fill Missing Values' : 'Inspect Distribution';
            }

            return `
                <tr class="hover:bg-slate-800/40 transition">
                    <td class="py-3.5 px-4 font-bold text-white">${RecommendationEngine.formatLabel(col.name)}</td>
                    <td class="py-3.5 px-4"><span class="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] uppercase">${col.dataType}</span></td>
                    <td class="py-3.5 px-4 text-right ${col.missingCount > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}">${col.missingCount}</td>
                    <td class="py-3.5 px-4 text-right ${col.missingPercent > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}">${col.missingPercent}%</td>
                    <td class="py-3.5 px-4 text-right text-slate-300">${col.uniqueCount.toLocaleString()}</td>
                    <td class="py-3.5 px-4 text-right ${col.outliersCount > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}">${col.outliersCount || 0}</td>
                    <td class="py-3.5 px-4 text-center">${statusBadge}</td>
                    <td class="py-3.5 px-4 text-center text-slate-400 text-[11px]">${actionText}</td>
                </tr>
            `;
        }).join('');
    }
};
