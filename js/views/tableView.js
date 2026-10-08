/**
 * Table View Controller - Interactive Data Explorer table with sorting, search, pagination, and export
 */
const TableView = {
    state: {
        currentPage: 1,
        pageSize: 25,
        searchTerm: '',
        sortCol: null,
        sortAsc: true
    },

    render(data, profile) {
        if (!data || data.length === 0 || !profile) return;

        const columns = profile.columnNames;

        // 1. Render Table Head
        const thead = document.getElementById('explorerTableHead');
        if (thead) {
            thead.innerHTML = `
                <tr>
                    <th class="py-3 px-4 w-12 text-center text-slate-500">#</th>
                    ${columns.map(col => {
                        const isSorted = this.state.sortCol === col;
                        const icon = isSorted ? (this.state.sortAsc ? '▲' : '▼') : '';
                        return `
                            <th class="py-3 px-4 cursor-pointer hover:bg-slate-900 transition" data-col="${col}">
                                <div class="flex items-center justify-between space-x-1">
                                    <span>${RecommendationEngine.formatLabel(col)}</span>
                                    <span class="text-indigo-400 font-mono text-[10px]">${icon}</span>
                                </div>
                            </th>
                        `;
                    }).join('')}
                </tr>
            `;

            thead.querySelectorAll('th[data-col]').forEach(th => {
                th.addEventListener('click', () => {
                    const col = th.dataset.col;
                    if (this.state.sortCol === col) {
                        this.state.sortAsc = !this.state.sortAsc;
                    } else {
                        this.state.sortCol = col;
                        this.state.sortAsc = true;
                    }
                    this.render(data, profile);
                });
            });
        }

        // 2. Filter & Sort Records
        let filtered = [...data];

        if (this.state.searchTerm) {
            const term = this.state.searchTerm.toLowerCase();
            filtered = filtered.filter(row => {
                return Object.values(row).some(val => val !== null && String(val).toLowerCase().includes(term));
            });
        }

        if (this.state.sortCol) {
            const col = this.state.sortCol;
            const asc = this.state.sortAsc;
            filtered.sort((a, b) => {
                let valA = a[col];
                let valB = b[col];
                if (valA === null || valA === undefined) return 1;
                if (valB === null || valB === undefined) return -1;
                if (typeof valA === 'number' && typeof valB === 'number') {
                    return asc ? valA - valB : valB - valA;
                }
                return asc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
            });
        }

        // 3. Paginate Records
        const totalRecords = filtered.length;
        const totalPages = Math.ceil(totalRecords / this.state.pageSize) || 1;
        if (this.state.currentPage > totalPages) this.state.currentPage = totalPages;

        const startIndex = (this.state.currentPage - 1) * this.state.pageSize;
        const endIndex = Math.min(startIndex + this.state.pageSize, totalRecords);
        const pageRecords = filtered.slice(startIndex, endIndex);

        // 4. Render Table Body
        const tbody = document.getElementById('explorerTableBody');
        if (tbody) {
            tbody.innerHTML = pageRecords.map((row, idx) => `
                <tr class="hover:bg-slate-800/40 transition">
                    <td class="py-2.5 px-4 text-center text-slate-500 font-mono text-[11px]">${startIndex + idx + 1}</td>
                    ${columns.map(col => {
                        const val = row[col];
                        const isNull = val === null || val === undefined || val === '';
                        return `
                            <td class="py-2.5 px-4 truncate max-w-[200px] ${isNull ? 'text-amber-400/80 italic font-sans text-[11px]' : ''}">
                                ${isNull ? 'null' : val}
                            </td>
                        `;
                    }).join('')}
                </tr>
            `).join('');
        }

        // 5. Update Pagination Info & Controls
        const infoEl = document.getElementById('tablePaginationInfo');
        if (infoEl) {
            infoEl.textContent = `Showing ${totalRecords === 0 ? 0 : startIndex + 1} to ${endIndex} of ${totalRecords.toLocaleString()} entries`;
        }

        const buttonsEl = document.getElementById('tablePaginationButtons');
        if (buttonsEl) {
            buttonsEl.innerHTML = `
                <button id="prevPageBtn" class="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed" ${this.state.currentPage === 1 ? 'disabled' : ''}>
                    Previous
                </button>
                <span class="text-xs text-slate-400 font-mono px-2">Page ${this.state.currentPage} of ${totalPages}</span>
                <button id="nextPageBtn" class="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed" ${this.state.currentPage === totalPages || totalRecords === 0 ? 'disabled' : ''}>
                    Next
                </button>
            `;

            const prevBtn = document.getElementById('prevPageBtn');
            const nextBtn = document.getElementById('nextPageBtn');
            if (prevBtn) prevBtn.onclick = () => { this.state.currentPage--; this.render(data, profile); };
            if (nextBtn) nextBtn.onclick = () => { this.state.currentPage++; this.render(data, profile); };
        }
    }
};
