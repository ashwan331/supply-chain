/**
 * Upload View Controller - Renders Upload Center, demo datasets list, dataset cards, and preview modal
 */
const UploadView = {
    renderDemoDatasets(container, onSelect) {
        if (!container) return;
        container.innerHTML = Object.values(SAMPLE_DATASETS).map(dataset => `
            <div class="demo-dataset-card bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-3 cursor-pointer transition-all duration-200 group" data-id="${dataset.id}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2.5">
                        <div class="w-8 h-8 rounded-lg bg-indigo-500/10 group-hover:bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <i data-lucide="file-spreadsheet" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <h4 class="text-xs font-bold text-white group-hover:text-indigo-300 transition">${dataset.name}</h4>
                            <p class="text-[10px] text-slate-400">${dataset.domain} • ${dataset.data.length} records</p>
                        </div>
                    </div>
                    <span class="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">${dataset.type}</span>
                </div>
            </div>
        `).join('');

        // Attach click listeners
        container.querySelectorAll('.demo-dataset-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                onSelect(SAMPLE_DATASETS[id]);
            });
        });

        if (window.lucide) lucide.createIcons();
    },

    renderDatasetsGrid(container, datasets, activeId, onSelectActive, onDelete) {
        if (!container) return;
        
        container.innerHTML = datasets.map(ds => {
            const isActive = ds.id === activeId;
            const qualityScore = ds.profile ? ds.profile.qualityScore : 100;
            const qualityColor = qualityScore >= 80 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30';

            return `
                <div class="bg-slate-900/90 border ${isActive ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-800'} rounded-2xl p-5 shadow-xl transition-all duration-200 flex flex-col justify-between">
                    <div>
                        <div class="flex items-start justify-between">
                            <div class="flex items-center space-x-2.5">
                                <div class="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                    <i data-lucide="database" class="w-5 h-5"></i>
                                </div>
                                <div>
                                    <h4 class="font-heading font-bold text-sm text-white truncate max-w-[170px]" title="${ds.name}">${ds.name}</h4>
                                    <span class="text-[10px] text-slate-400">${ds.type} • ${DataParser.formatBytes(ds.sizeBytes || 10240)}</span>
                                </div>
                            </div>

                            ${isActive ? `
                                <span class="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Active
                                </span>
                            ` : ''}
                        </div>

                        <!-- Summary Statistics Grid -->
                        <div class="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
                            <div>
                                <span class="text-[10px] text-slate-400 block">Rows</span>
                                <span class="font-mono font-bold text-slate-200">${ds.profile ? ds.profile.totalRows.toLocaleString() : '0'}</span>
                            </div>
                            <div>
                                <span class="text-[10px] text-slate-400 block">Columns</span>
                                <span class="font-mono font-bold text-slate-200">${ds.profile ? ds.profile.totalColumns : '0'}</span>
                            </div>
                            <div>
                                <span class="text-[10px] text-slate-400 block">Missing Values</span>
                                <span class="font-mono font-bold text-slate-200">${ds.profile ? ds.profile.missingPercent + '%' : '0%'}</span>
                            </div>
                            <div>
                                <span class="text-[10px] text-slate-400 block">Data Health</span>
                                <span class="font-mono font-bold ${qualityColor} px-1.5 py-0.2 rounded border text-[10px] inline-block">${qualityScore}%</span>
                            </div>
                        </div>
                    </div>

                    <div class="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <button class="select-ds-btn text-xs font-semibold px-3 py-1.5 rounded-xl transition ${isActive ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'} flex-grow text-center" data-id="${ds.id}">
                            ${isActive ? 'Selected' : 'Analyze Dataset'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.select-ds-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                onSelectActive(btn.dataset.id);
            });
        });

        if (window.lucide) lucide.createIcons();
    },

    renderActiveOverview(container, dataset) {
        if (!container || !dataset || !dataset.profile) return;
        const p = dataset.profile;

        container.innerHTML = `
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                    <span class="text-xs font-bold text-indigo-400 uppercase tracking-widest block">Active Dataset Profiling Overview</span>
                    <h3 class="font-heading font-extrabold text-2xl text-white mt-0.5">${dataset.name}</h3>
                    <p class="text-xs text-slate-400 mt-1">Domain Classification: <strong class="text-indigo-300">${p.domain}</strong></p>
                </div>

                <div class="flex items-center gap-3">
                    <div class="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-center">
                        <span class="text-[10px] text-slate-400 uppercase block">Data Health</span>
                        <span class="font-mono font-extrabold text-lg text-emerald-400">${p.qualityScore}%</span>
                    </div>
                </div>
            </div>

            <!-- Stats Bar -->
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 text-xs font-mono">
                <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                    <span class="text-[10px] text-slate-400 block font-sans">Total Rows</span>
                    <span class="font-bold text-white text-base">${p.totalRows.toLocaleString()}</span>
                </div>
                <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                    <span class="text-[10px] text-slate-400 block font-sans">Total Columns</span>
                    <span class="font-bold text-white text-base">${p.totalColumns}</span>
                </div>
                <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                    <span class="text-[10px] text-slate-400 block font-sans">Numeric Columns</span>
                    <span class="font-bold text-indigo-400 text-base">${p.typeCounts.numeric || 0}</span>
                </div>
                <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                    <span class="text-[10px] text-slate-400 block font-sans">Categorical Cols</span>
                    <span class="font-bold text-purple-400 text-base">${p.typeCounts.categorical || 0}</span>
                </div>
                <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                    <span class="text-[10px] text-slate-400 block font-sans">Date Columns</span>
                    <span class="font-bold text-cyan-400 text-base">${p.typeCounts.date || 0}</span>
                </div>
                <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                    <span class="text-[10px] text-slate-400 block font-sans">Duplicate Rows</span>
                    <span class="font-bold text-amber-400 text-base">${p.duplicateRowsCount}</span>
                </div>
            </div>
        `;
    }
};
