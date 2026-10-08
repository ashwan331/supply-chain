/**
 * Profiler View Controller - Renders Data Profiler column inspection cards & distributions
 */
const ProfilerView = {
    render(profile, searchTerm = '') {
        if (!profile || !profile.columnProfiles) return;

        // 1. Render Summary Grid
        const summaryGrid = document.getElementById('profilerSummaryGrid');
        if (summaryGrid) {
            summaryGrid.innerHTML = `
                <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
                    <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Attributes</span>
                    <span class="font-mono font-extrabold text-xl text-white mt-1 block">${profile.totalColumns} Columns</span>
                </div>
                <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
                    <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Dataset Rows</span>
                    <span class="font-mono font-extrabold text-xl text-indigo-400 mt-1 block">${profile.totalRows.toLocaleString()} Rows</span>
                </div>
                <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
                    <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Numerical Measures</span>
                    <span class="font-mono font-extrabold text-xl text-emerald-400 mt-1 block">${profile.typeCounts.numeric || 0}</span>
                </div>
                <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
                    <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Categorical Dimensions</span>
                    <span class="font-mono font-extrabold text-xl text-purple-400 mt-1 block">${profile.typeCounts.categorical || 0}</span>
                </div>
            `;
        }

        // 2. Render Column Cards
        const grid = document.getElementById('columnsProfilerGrid');
        if (!grid) return;

        const filteredColumns = Object.values(profile.columnProfiles).filter(col => {
            if (!searchTerm) return true;
            return col.name.toLowerCase().includes(searchTerm.toLowerCase()) || col.dataType.toLowerCase().includes(searchTerm.toLowerCase());
        });

        if (filteredColumns.length === 0) {
            grid.innerHTML = `<div class="col-span-full text-center py-12 text-slate-400">No columns matching "${searchTerm}"</div>`;
            return;
        }

        const typeBadgeMap = {
            numeric: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            categorical: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
            date: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
            boolean: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
            text: 'bg-slate-800 text-slate-300 border-slate-700'
        };

        grid.innerHTML = filteredColumns.map(col => {
            const badgeClass = typeBadgeMap[col.dataType] || typeBadgeMap.text;

            return `
                <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition">
                    <div>
                        <div class="flex items-start justify-between">
                            <div>
                                <h3 class="font-heading font-bold text-base text-white truncate max-w-[200px]" title="${col.name}">${RecommendationEngine.formatLabel(col.name)}</h3>
                                <span class="text-[10px] font-mono text-slate-500 block">${col.name}</span>
                            </div>
                            <span class="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${badgeClass}">
                                ${col.dataType}
                            </span>
                        </div>

                        <!-- General Column Metrics -->
                        <div class="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs font-mono">
                            <div>
                                <span class="text-[10px] font-sans text-slate-400 block">Missing Values</span>
                                <span class="${col.missingCount > 0 ? 'text-amber-400' : 'text-slate-300'} font-bold">${col.missingCount} (${col.missingPercent}%)</span>
                            </div>
                            <div>
                                <span class="text-[10px] font-sans text-slate-400 block">Unique Values</span>
                                <span class="text-slate-300 font-bold">${col.uniqueCount.toLocaleString()}</span>
                            </div>
                        </div>

                        <!-- Type Specific Statistics -->
                        ${this.renderTypeSpecificStats(col)}
                    </div>

                    <div class="mt-4 pt-3 border-t border-slate-800/80">
                        <span class="text-[10px] text-slate-500 block font-sans mb-1">Sample Values</span>
                        <div class="flex flex-wrap gap-1">
                            ${col.sampleValues.map(s => `<span class="bg-slate-950 border border-slate-800 text-[10px] text-slate-300 px-2 py-0.5 rounded font-mono truncate max-w-[120px]">${s}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        if (window.lucide) lucide.createIcons();
    },

    renderTypeSpecificStats(col) {
        if (col.dataType === 'numeric' && col.numericStats) {
            const ns = col.numericStats;
            return `
                <div class="mt-3 bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1.5 text-xs font-mono">
                    <div class="flex justify-between">
                        <span class="text-slate-400 font-sans">Mean:</span>
                        <span class="text-emerald-400 font-bold">${ns.mean}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-400 font-sans">Median:</span>
                        <span class="text-slate-200">${ns.median}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-400 font-sans">Min / Max:</span>
                        <span class="text-slate-200">${ns.min} / ${ns.max}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-400 font-sans">Outliers (IQR):</span>
                        <span class="${ns.outliersCount > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}">${ns.outliersCount}</span>
                    </div>
                </div>
            `;
        }

        if ((col.dataType === 'categorical' || col.dataType === 'text') && col.categoricalStats) {
            const cs = col.categoricalStats;
            return `
                <div class="mt-3 bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1 text-xs">
                    <span class="text-[10px] text-slate-400 block font-sans mb-1">Top Category Breakdown:</span>
                    ${cs.topCategories.slice(0, 3).map(tc => `
                        <div class="flex items-center justify-between font-mono text-[11px]">
                            <span class="text-slate-300 truncate max-w-[120px]">${tc.category}</span>
                            <span class="text-purple-400 font-bold">${tc.percentage}% (${tc.count})</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        if (col.dataType === 'date' && col.dateStats) {
            const ds = col.dateStats;
            return `
                <div class="mt-3 bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1 text-xs font-mono">
                    <div class="flex justify-between">
                        <span class="text-slate-400 font-sans">Min Date:</span>
                        <span class="text-cyan-400 font-bold">${ds.minDate}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-400 font-sans">Max Date:</span>
                        <span class="text-cyan-400 font-bold">${ds.maxDate}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-400 font-sans">Timeline Span:</span>
                        <span class="text-slate-300">${ds.timeSpanDays} Days</span>
                    </div>
                </div>
            `;
        }

        return '';
    }
};
