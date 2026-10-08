/**
 * App Coordinator - Main Application Controller & Event Dispatcher
 */

const App = {

    state: {

        datasets: [],

        activeDatasetId:
            null,

        activeTab:
            "upload"

    },


    // ============================================================
    // INITIALIZE APP
    // ============================================================

    async init() {

        console.log(
            "Initializing OmniData AI Platform..."
        );


        this.setupNavigation();

        this.setupFileUpload();

        this.setupChatForm();

        this.setupExportHandlers();

        this.setupDataCleaning();

        this.setupSupplyChainControls();


        // ========================================================
        // LOAD LOCAL DEMO DATASETS
        // ========================================================

        Object.values(
            SAMPLE_DATASETS
        ).forEach(
            dataset => {

                const profile =
                    DataProfiler.profile(
                        dataset.data
                    );


                const plan =
                    RecommendationEngine.generateDashboardPlan(
                        dataset.data,
                        profile
                    );


                const insightsResult =
                    InsightsEngine.generate(
                        dataset.data,
                        profile
                    );


                const scAnalysis =
                    this.isSupplyChainDataset(
                        dataset.data
                    )
                        ? SupplyChainEngine.analyze(
                            dataset.data
                        )
                        : SupplyChainEngine.emptyAnalysis();


                this.state.datasets.push({

                    id:
                        dataset.id,

                    name:
                        dataset.name,

                    type:
                        dataset.type,

                    sizeBytes:
                        dataset.data.length *
                        120,

                    data:
                        dataset.data,

                    profile,

                    plan,

                    insights:
                        insightsResult.insights,

                    executiveBriefing:
                        insightsResult.executiveBriefing,

                    scAnalysis

                });

            }
        );


        // ========================================================
        // LOAD MYSQL DATASETS
        // ========================================================

        await this.loadBackendData();


        // ========================================================
        // DO NOT AUTO-SELECT A DATASET
        // ========================================================

        this.state.activeDatasetId =
            null;

        this.state.activeTab =
            "upload";


        this.renderUploadCenter();

        this.updateActiveDatasetIndicator();


        if (window.lucide) {

            lucide.createIcons();

        }


        console.log(
            "Application ready. Waiting for user dataset."
        );

    },


    // ============================================================
    // SUPPLY CHAIN DATA DETECTION
    // ============================================================

    isSupplyChainDataset(
        data
    ) {

        if (
            !Array.isArray(data) ||
            data.length === 0
        ) {

            return false;

        }


        const firstRow =
            data.find(
                row =>
                    row &&
                    typeof row ===
                        "object"
            );


        if (!firstRow) {

            return false;

        }


        const columns =
            Object.keys(
                firstRow
            )
                .map(
                    key =>
                        String(
                            key
                        )
                            .toLowerCase()
                            .replace(
                                /[\s_-]+/g,
                                ""
                            )
                );


        const signals = [

            "stock",

            "stocklevel",

            "currentstock",

            "inventory",

            "inventorylevel",

            "demand",

            "dailydemand",

            "forecast",

            "predicteddemand",

            "leadtime",

            "leadtimedays",

            "reorderlevel",

            "reorderpoint",

            "reorderquantity",

            "supplier",

            "supplierid",

            "productid",

            "productname",

            "sku",

            "itemid",

            "unitcost"

        ];


        const matches =
            signals.filter(
                signal =>
                    columns.some(
                        column =>
                            column.includes(
                                signal
                            )
                    )
            );


        return (
            matches.length >=
            3
        );

    },


    // ============================================================
    // BACKEND DATA LOADING
    // ============================================================

    async loadBackendData() {

        try {

            console.log(
                "Connecting to Flask backend..."
            );


            const productsResponse =
                await fetch(
                    "http://127.0.0.1:5000/api/products"
                );


            if (
                !productsResponse.ok
            ) {

                throw new Error(
                    `Products API returned status ${productsResponse.status}`
                );

            }


            const products =
                await productsResponse.json();


            this.createBackendDataset(
                "backend_products",
                "MySQL Products",
                "API / MySQL",
                products
            );


            const salesResponse =
                await fetch(
                    "http://127.0.0.1:5000/api/sales"
                );


            if (
                !salesResponse.ok
            ) {

                throw new Error(
                    `Sales API returned status ${salesResponse.status}`
                );

            }


            const sales =
                await salesResponse.json();


            this.createBackendDataset(
                "backend_sales",
                "MySQL Sales",
                "API / MySQL",
                sales
            );


            const inventoryResponse =
                await fetch(
                    "http://127.0.0.1:5000/api/inventory"
                );


            if (
                !inventoryResponse.ok
            ) {

                throw new Error(
                    `Inventory API returned status ${inventoryResponse.status}`
                );

            }


            const inventory =
                await inventoryResponse.json();


            this.createBackendDataset(
                "backend_inventory",
                "MySQL Inventory",
                "API / MySQL",
                inventory
            );


            const suppliersResponse =
                await fetch(
                    "http://127.0.0.1:5000/api/suppliers"
                );


            if (
                !suppliersResponse.ok
            ) {

                throw new Error(
                    `Suppliers API returned status ${suppliersResponse.status}`
                );

            }


            const suppliers =
                await suppliersResponse.json();


            this.createBackendDataset(
                "backend_suppliers",
                "MySQL Suppliers",
                "API / MySQL",
                suppliers
            );


            const forecastsResponse =
                await fetch(
                    "http://127.0.0.1:5000/api/forecasts"
                );


            if (
                !forecastsResponse.ok
            ) {

                throw new Error(
                    `Forecasts API returned status ${forecastsResponse.status}`
                );

            }


            const forecasts =
                await forecastsResponse.json();


            this.createBackendDataset(
                "backend_forecasts",
                "MySQL Forecasts",
                "API / MySQL",
                forecasts
            );


            console.log(
                "Backend datasets loaded successfully."
            );


        } catch (error) {

            console.error(
                "Could not connect to Flask backend:",
                error
            );

        }

    },


    // ============================================================
    // CREATE BACKEND DATASET
    // ============================================================

    createBackendDataset(
        id,
        name,
        type,
        data
    ) {

        if (
            !Array.isArray(data)
        ) {

            return;

        }


        const profile =
            DataProfiler.profile(
                data
            );


        const plan =
            RecommendationEngine.generateDashboardPlan(
                data,
                profile
            );


        const insightsResult =
            InsightsEngine.generate(
                data,
                profile
            );


        const scAnalysis =
            this.isSupplyChainDataset(
                data
            )
                ? SupplyChainEngine.analyze(
                    data
                )
                : SupplyChainEngine.emptyAnalysis();


        const dataset = {

            id,

            name,

            type,

            sizeBytes:
                JSON.stringify(
                    data
                ).length,

            data,

            profile,

            plan,

            insights:
                insightsResult.insights,

            executiveBriefing:
                insightsResult.executiveBriefing,

            scAnalysis

        };


        this.state.datasets =
            this.state.datasets.filter(
                existing =>
                    existing.id !==
                    id
            );


        this.state.datasets.push(
            dataset
        );

    },


    // ============================================================
    // NAVIGATION
    // ============================================================

    setupNavigation() {

        const tabs =
            document.querySelectorAll(
                ".nav-tab"
            );


        tabs.forEach(
            tab => {

                tab.addEventListener(
                    "click",
                    () => {

                        this.switchTab(
                            tab.dataset.tab
                        );

                    }
                );

            }
        );


        const uploadButton =
            document.getElementById(
                "uploadNewDatasetNavBtn"
            );


        if (uploadButton) {

            uploadButton.addEventListener(
                "click",
                () =>
                    this.switchTab(
                        "upload"
                    )
            );

        }


        const quickSwitch =
            document.getElementById(
                "quickSwitchBtn"
            );


        if (quickSwitch) {

            quickSwitch.addEventListener(
                "click",
                () =>
                    this.switchTab(
                        "upload"
                    )
            );

        }


        const demoButton =
            document.getElementById(
                "sampleDataBtn"
            );


        if (demoButton) {

            demoButton.addEventListener(
                "click",
                () => {

                    const demoDataset =
                        this.state.datasets.find(
                            dataset =>
                                dataset.id ===
                                "sales"
                        );


                    if (
                        demoDataset
                    ) {

                        this.setActiveDataset(
                            demoDataset.id
                        );


                        this.switchTab(
                            "dashboard"
                        );

                    }

                }
            );

        }


        const logo =
            document.getElementById(
                "brandLogo"
            );


        if (logo) {

            logo.addEventListener(
                "click",
                () =>
                    this.switchTab(
                        "upload"
                    )
            );

        }

    },


    // ============================================================
    // SWITCH TAB
    // ============================================================

    switchTab(
        tabName
    ) {

        const activeDataset =
            this.getActiveDataset();


        if (
            tabName ===
            "supplychain"
        ) {

            if (
                !activeDataset
            ) {

                alert(
                    "Please upload or select a dataset first."
                );


                return;

            }


            if (
                !this.isSupplyChainDataset(
                    activeDataset.data
                )
            ) {

                alert(
                    "This dataset does not appear to contain supply-chain or inventory fields."
                );


                return;

            }

        }


        this.state.activeTab =
            tabName;


        document
            .querySelectorAll(
                ".nav-tab"
            )
            .forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        button.dataset.tab ===
                            tabName
                    );

                }
            );


        document
            .querySelectorAll(
                ".tab-content"
            )
            .forEach(
                section => {

                    section.classList.toggle(
                        "hidden",
                        section.id !==
                            `tab-${tabName}`
                    );

                }
            );


        const dataset =
            this.getActiveDataset();


        if (dataset) {

            if (
                tabName ===
                "dashboard"
            ) {

                DashboardView.render(
                    dataset.plan,
                    dataset.executiveBriefing
                );


            } else if (
                tabName ===
                "profiler"
            ) {

                ProfilerView.render(
                    dataset.profile
                );


            } else if (
                tabName ===
                "quality"
            ) {

                QualityView.render(
                    dataset.profile
                );


            } else if (
                tabName ===
                "explorer"
            ) {

                TableView.render(
                    dataset.data,
                    dataset.profile
                );


            } else if (
                tabName ===
                "insights"
            ) {

                InsightsView.renderInsights(
                    dataset.insights
                );


            } else if (
                tabName ===
                "supplychain"
            ) {

                SupplyChainView.render(
                    dataset.scAnalysis
                );


                this.loadSupplyChainDashboard();

            }

        }


        if (window.lucide) {

            lucide.createIcons();

        }

    },


    // ============================================================
    // ACTIVE DATASET
    // ============================================================

    setActiveDataset(
        id
    ) {

        this.state.activeDatasetId =
            id;


        const dataset =
            this.getActiveDataset();


        this.updateActiveDatasetIndicator();


        if (!dataset) {

            return;

        }


        const qualityBadge =
            document.getElementById(
                "qualityBadgeNav"
            );


        if (
            qualityBadge &&
            dataset.profile
        ) {

            qualityBadge.classList.remove(
                "hidden"
            );


            qualityBadge.textContent =
                `${dataset.profile.qualityScore}% Health`;

        }


        this.switchTab(
            this.state.activeTab
        );

    },


    getActiveDataset() {

        return this.state.datasets.find(
            dataset =>
                dataset.id ===
                this.state.activeDatasetId
        );

    },


    updateActiveDatasetIndicator() {

        const nameElement =
            document.getElementById(
                "activeDatasetName"
            );


        if (!nameElement) {

            return;

        }


        const activeDataset =
            this.getActiveDataset();


        nameElement.textContent =
            activeDataset
                ? activeDataset.name
                : "No Dataset Loaded";

    },


    // ============================================================
    // SUPPLY CHAIN
    // ============================================================

    setupSupplyChainControls() {

        const button =
            document.getElementById(
                "recalcSupplyChainBtn"
            );


        if (!button) {

            return;

        }


        if (
            button.dataset.bound ===
            "true"
        ) {

            return;

        }


        button.dataset.bound =
            "true";


        button.addEventListener(
            "click",
            async () => {

                await this.recalculateSupplyChain();

            }
        );

    },


    async loadSupplyChainDashboard() {

        try {

            const activeDataset =
                this.getActiveDataset();


            if (
                !activeDataset ||
                !this.isSupplyChainDataset(
                    activeDataset.data
                )
            ) {

                return;

            }


            const analysis =
                await SupplyChainEngine.analyzeBackendData();


            activeDataset.scAnalysis =
                analysis;


            SupplyChainView.render(
                analysis
            );


            if (window.lucide) {

                lucide.createIcons();

            }

        } catch (error) {

            console.error(
                "Supply Chain dashboard error:",
                error
            );

        }

    },


    async recalculateSupplyChain() {

        const activeDataset =
            this.getActiveDataset();


        if (
            !activeDataset
        ) {

            alert(
                "Please select a supply-chain dataset first."
            );


            return;

        }


        const button =
            document.getElementById(
                "recalcSupplyChainBtn"
            );


        const originalHtml =
            button
                ? button.innerHTML
                : null;


        try {

            if (button) {

                button.disabled =
                    true;


                button.innerHTML = `
                    <i
                        data-lucide="loader-2"
                        class="w-4 h-4 animate-spin"
                    ></i>
                    Recalculating...
                `;


                if (window.lucide) {

                    lucide.createIcons();

                }

            }


            const response =
                await fetch(
                    "http://127.0.0.1:5000/api/forecasts/generate-ml",
                    {
                        method:
                            "POST"
                    }
                );


            const result =
                await response.json();


            if (
                !response.ok
            ) {

                throw new Error(
                    result.error ||
                    "ML forecast request failed."
                );

            }


            await this.loadSupplyChainDashboard();


            alert(
                `ML forecast recalculated successfully. ${
                    result.forecast_count ||
                    0
                } forecasts updated.`
            );

        } catch (error) {

            console.error(
                "Supply Chain recalculation error:",
                error
            );


            alert(
                `Supply Chain recalculation failed: ${error.message}`
            );

        } finally {

            if (button) {

                button.disabled =
                    false;


                button.innerHTML =
                    originalHtml ||
                    `
                        <i
                            data-lucide="calculator"
                            class="w-4 h-4"
                        ></i>
                        Recalculate Optimization
                    `;


                if (window.lucide) {

                    lucide.createIcons();

                }

            }

        }

    },


    // ============================================================
    // FILE UPLOAD
    // ============================================================

    setupFileUpload() {

        const dropZone =
            document.getElementById(
                "dropZone"
            );


        const fileInput =
            document.getElementById(
                "fileInput"
            );


        const browseButton =
            document.getElementById(
                "browseFilesBtn"
            );


        if (
            !dropZone ||
            !fileInput
        ) {

            return;

        }


        if (browseButton) {

            browseButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    fileInput.click();

                }
            );

        }


        dropZone.addEventListener(
            "click",
            () =>
                fileInput.click()
        );


        dropZone.addEventListener(
            "dragover",
            event => {

                event.preventDefault();

                dropZone.classList.add(
                    "border-indigo-500",
                    "bg-slate-900/80"
                );

            }
        );


        dropZone.addEventListener(
            "dragleave",
            () => {

                dropZone.classList.remove(
                    "border-indigo-500",
                    "bg-slate-900/80"
                );

            }
        );


        dropZone.addEventListener(
            "drop",
            async event => {

                event.preventDefault();


                dropZone.classList.remove(
                    "border-indigo-500",
                    "bg-slate-900/80"
                );


                const files =
                    event
                        .dataTransfer
                        .files;


                if (
                    files &&
                    files.length > 0
                ) {

                    await this.handleFiles(
                        files
                    );

                }

            }
        );


        fileInput.addEventListener(
            "change",
            async () => {

                if (
                    fileInput.files &&
                    fileInput.files.length > 0
                ) {

                    await this.handleFiles(
                        fileInput.files
                    );

                }

            }
        );

    },


    async handleFiles(
        fileList
    ) {

        for (
            let index = 0;
            index < fileList.length;
            index++
        ) {

            const file =
                fileList[index];


            try {

                const parsed =
                    await DataParser.parseFile(
                        file
                    );


                const profile =
                    DataProfiler.profile(
                        parsed.data
                    );


                const plan =
                    RecommendationEngine.generateDashboardPlan(
                        parsed.data,
                        profile
                    );


                const insightsResult =
                    InsightsEngine.generate(
                        parsed.data,
                        profile
                    );


                const scAnalysis =
                    this.isSupplyChainDataset(
                        parsed.data
                    )
                        ? SupplyChainEngine.analyze(
                            parsed.data
                        )
                        : SupplyChainEngine.emptyAnalysis();


                const newDataset = {

                    id:
                        `ds_${Date.now()}_${Math.random()
                            .toString(36)
                            .slice(
                                2,
                                7
                            )}`,

                    name:
                        parsed.name,

                    type:
                        parsed.type,

                    sizeBytes:
                        parsed.sizeBytes,

                    data:
                        parsed.data,

                    profile,

                    plan,

                    insights:
                        insightsResult.insights,

                    executiveBriefing:
                        insightsResult.executiveBriefing,

                    scAnalysis

                };


                this.state.datasets.push(
                    newDataset
                );


                this.setActiveDataset(
                    newDataset.id
                );


            } catch (error) {

                console.error(
                    "File processing error:",
                    error
                );


                alert(
                    `Error reading ${file.name}: ${error.message}`
                );

            }

        }


        this.renderUploadCenter();


        this.switchTab(
            "dashboard"
        );

    },


    // ============================================================
    // UPLOAD CENTER
    // ============================================================

    renderUploadCenter() {

        const demoList =
            document.getElementById(
                "demoDatasetList"
            );


        const grid =
            document.getElementById(
                "datasetsGrid"
            );


        const overview =
            document.getElementById(
                "activeDatasetOverviewCard"
            );


        const uploadedSection =
            document.getElementById(
                "uploadedDatasetsSection"
            );


        const countText =
            document.getElementById(
                "datasetsCountText"
            );


        if (demoList) {

            UploadView.renderDemoDatasets(
                demoList,
                dataset => {

                    this.setActiveDataset(
                        dataset.id
                    );


                    this.switchTab(
                        "dashboard"
                    );

                }
            );

        }


        if (
            uploadedSection
        ) {

            uploadedSection.classList.remove(
                "hidden"
            );

        }


        if (
            countText
        ) {

            countText.textContent =
                `${this.state.datasets.length} Datasets Available`;

        }


        if (
            grid
        ) {

            UploadView.renderDatasetsGrid(
                grid,
                this.state.datasets,
                this.state.activeDatasetId,
                id => {

                    this.setActiveDataset(
                        id
                    );

                }
            );

        }


        const activeDataset =
            this.getActiveDataset();


        if (
            activeDataset &&
            overview
        ) {

            UploadView.renderActiveOverview(
                overview,
                activeDataset
            );

        } else if (
            overview
        ) {

            overview.innerHTML = `

                <div class="text-center py-8">

                    <i
                        data-lucide="database"
                        class="w-8 h-8 text-slate-600 mx-auto mb-3"
                    ></i>

                    <h3 class="font-heading font-bold text-white">
                        No Dataset Selected
                    </h3>

                    <p class="text-xs text-slate-500 mt-1">
                        Upload your CSV, Excel, or JSON dataset to begin.
                    </p>

                </div>

            `;

        }


        this.updateActiveDatasetIndicator();


        if (window.lucide) {

            lucide.createIcons();

        }

    },


    // ============================================================
    // AI CHAT
    // ============================================================

    setupChatForm() {

        const form =
            document.getElementById(
                "aiChatForm"
            );


        const input =
            document.getElementById(
                "aiChatInput"
            );


        if (
            !form ||
            !input
        ) {

            return;

        }


        form.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const question =
                    input.value.trim();


                if (!question) {

                    return;

                }


                InsightsView.appendChatMessage(
                    "user",
                    question
                );


                input.value =
                    "";


                const activeDataset =
                    this.getActiveDataset();


                if (
                    !activeDataset
                ) {

                    InsightsView.appendChatMessage(
                        "bot",
                        "Please upload or select a dataset first."
                    );


                    return;

                }


                const result = this.answerLocalQuery(
                    question,
                    activeDataset
                );

                InsightsView.appendChatMessage(
                    "bot",
                    result.text,
                    result.metricHighlight
                );

            }
        );


        document
            .querySelectorAll(
                ".chat-prompt-btn"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const prompt =
                                button.textContent
                                    .replace(
                                        /"/g,
                                        ""
                                    )
                                    .trim();


                            input.value =
                                prompt;


                            form.dispatchEvent(
                                new Event(
                                    "submit"
                                )
                            );

                        }
                    );

                }
            );

    },


    answerLocalQuery(question, activeDataset) {
        if (!activeDataset || !activeDataset.data || activeDataset.data.length === 0) {
            return { text: "Please upload or select a dataset first.", metricHighlight: null };
        }

        const q = question.toLowerCase();
        const data = activeDataset.data;
        const profile = activeDataset.profile || {};
        const cols = profile.columnProfiles ? Object.values(profile.columnProfiles) : [];
        const numRows = profile.totalRows || data.length;
        const numCols = profile.totalColumns || (data[0] ? Object.keys(data[0]).length : 0);

        if (q.includes("row") || q.includes("record") || q.includes("how many") || q.includes("count") || q.includes("size")) {
            return {
                text: `The active dataset **${activeDataset.name}** contains **${numRows.toLocaleString()}** records across **${numCols}** columns.`,
                metricHighlight: `${numRows} Rows | ${numCols} Columns`
            };
        }

        if (q.includes("summary") || q.includes("overview") || q.includes("describe") || q.includes("about")) {
            const colNames = cols.map(c => c.name).join(", ");
            return {
                text: `Dataset **${activeDataset.name}** has **${numRows}** rows and **${numCols}** columns (${colNames}). Domain: **${profile.domain || 'General Data Analytics'}**. Data Quality Score: **${profile.qualityScore || '100%'}**.`,
                metricHighlight: `Quality: ${profile.qualityScore || '100%'}`
            };
        }

        if (q.includes("quality") || q.includes("missing") || q.includes("null") || q.includes("clean")) {
            const missingCols = cols.filter(c => c.missingCount > 0);
            if (missingCols.length === 0) {
                return {
                    text: `Data quality is excellent! Overall Quality Score is **${profile.qualityScore || '100%'}**. There are no missing values across all columns.`,
                    metricHighlight: "100% Data Quality"
                };
            } else {
                const details = missingCols.map(c => `**${c.name}** (${c.missingCount} missing)`).join(", ");
                return {
                    text: `Overall Quality Score is **${profile.qualityScore}**. Columns with missing values: ${details}.`,
                    metricHighlight: `Quality: ${profile.qualityScore}`
                };
            }
        }

        for (const col of cols) {
            if (q.includes(col.name.toLowerCase())) {
                if (col.dataType === 'numeric' && col.stats) {
                    const s = col.stats;
                    return {
                        text: `Column **${col.name}** statistics:\n• Minimum: **${s.min}**\n• Maximum: **${s.max}**\n• Average: **${s.avg ? s.avg.toFixed(2) : 'N/A'}**\n• Total Sum: **${s.sum ? s.sum.toFixed(2) : 'N/A'}**`,
                        metricHighlight: `${col.name} Avg: ${s.avg ? s.avg.toFixed(2) : s.min}`
                    };
                } else {
                    return {
                        text: `Column **${col.name}** is a **${col.dataType}** field with **${col.uniqueCount}** unique values out of **${numRows}** records.`,
                        metricHighlight: `${col.uniqueCount} Unique Values`
                    };
                }
            }
        }

        const numericCols = cols.filter(c => c.dataType === 'numeric');
        const firstNum = numericCols[0];
        let highlight = `${numRows} Records`;
        let detail = `Dataset **${activeDataset.name}** (${numRows} records, ${numCols} fields).`;

        if (firstNum && firstNum.stats) {
            highlight = `${firstNum.name} Avg: ${firstNum.stats.avg ? firstNum.stats.avg.toFixed(1) : firstNum.stats.min}`;
            detail += ` Key metric **${firstNum.name}** averages **${firstNum.stats.avg ? firstNum.stats.avg.toFixed(2) : firstNum.stats.min}** (Range: ${firstNum.stats.min} to ${firstNum.stats.max}).`;
        }

        return {
            text: detail,
            metricHighlight: highlight
        };
    },


    // ============================================================
    // EXPORT HANDLERS
    // ============================================================

    setupExportHandlers() {

        const csvButton =
            document.getElementById(
                "exportCsvBtn"
            );


        const jsonButton =
            document.getElementById(
                "exportJsonBtn"
            );


        if (csvButton) {

            csvButton.addEventListener(
                "click",
                () => {

                    const dataset =
                        this.getActiveDataset();


                    if (!dataset) {

                        alert(
                            "Please select a dataset first."
                        );


                        return;

                    }


                    const csv =
                        Papa.unparse(
                            dataset.data
                        );


                    const blob =
                        new Blob(
                            [csv],
                            {
                                type:
                                    "text/csv;charset=utf-8;"
                            }
                        );


                    const link =
                        document.createElement(
                            "a"
                        );


                    link.href =
                        URL.createObjectURL(
                            blob
                        );


                    link.download =
                        `exported_${dataset.name.replace(
                            /\.[^/.]+$/,
                            ""
                        )}.csv`;


                    document.body.appendChild(
                        link
                    );


                    link.click();


                    document.body.removeChild(
                        link
                    );

                }
            );

        }


        if (jsonButton) {

            jsonButton.addEventListener(
                "click",
                () => {

                    const dataset =
                        this.getActiveDataset();


                    if (!dataset) {

                        alert(
                            "Please select a dataset first."
                        );


                        return;

                    }


                    const json =
                        JSON.stringify(
                            dataset.data,
                            null,
                            2
                        );


                    const blob =
                        new Blob(
                            [json],
                            {
                                type:
                                    "application/json"
                            }
                        );


                    const link =
                        document.createElement(
                            "a"
                        );


                    link.href =
                        URL.createObjectURL(
                            blob
                        );


                    link.download =
                        `exported_${dataset.name.replace(
                            /\.[^/.]+$/,
                            ""
                        )}.json`;


                    document.body.appendChild(
                        link
                    );


                    link.click();


                    document.body.removeChild(
                        link
                    );

                }
            );

        }

    },


    // ============================================================
    // DATA CLEANING
    // ============================================================

    setupDataCleaning() {

        const button =
            document.getElementById(
                "cleanDatasetBtn"
            );


        if (!button) {

            return;

        }


        button.addEventListener(
            "click",
            () => {

                const dataset =
                    this.getActiveDataset();


                if (!dataset) {

                    alert(
                        "Please select a dataset first."
                    );


                    return;

                }


                const cleanedRows = [];

                const seen =
                    new Set();

                const medians = {};


                Object.values(
                    dataset.profile.columnProfiles || {}
                ).forEach(
                    column => {

                        if (
                            column.dataType ===
                                "numeric" &&
                            column.numericStats
                        ) {

                            medians[
                                column.name
                            ] =
                                column.numericStats.median;

                        }

                    }
                );


                dataset.data.forEach(
                    row => {

                        const key =
                            JSON.stringify(
                                row
                            );


                        if (
                            seen.has(
                                key
                            )
                        ) {

                            return;

                        }


                        seen.add(
                            key
                        );


                        const cleanRow = {
                            ...row
                        };


                        Object.keys(
                            cleanRow
                        ).forEach(
                            columnName => {

                                const value =
                                    cleanRow[
                                        columnName
                                    ];


                                if (
                                    value ===
                                        null ||
                                    value ===
                                        undefined ||
                                    value ===
                                        ""
                                ) {

                                    if (
                                        medians[
                                            columnName
                                        ] !==
                                            undefined
                                    ) {

                                        cleanRow[
                                            columnName
                                        ] =
                                            medians[
                                                columnName
                                            ];

                                    } else {

                                        cleanRow[
                                            columnName
                                        ] =
                                            "N/A";

                                    }

                                }

                            }
                        );


                        cleanedRows.push(
                            cleanRow
                        );

                    }
                );


                dataset.data =
                    cleanedRows;


                dataset.profile =
                    DataProfiler.profile(
                        cleanedRows
                    );


                dataset.plan =
                    RecommendationEngine.generateDashboardPlan(
                        cleanedRows,
                        dataset.profile
                    );


                const insightsResult =
                    InsightsEngine.generate(
                        cleanedRows,
                        dataset.profile
                    );


                dataset.insights =
                    insightsResult.insights;


                dataset.executiveBriefing =
                    insightsResult.executiveBriefing;


                dataset.scAnalysis =
                    this.isSupplyChainDataset(
                        cleanedRows
                    )
                        ? SupplyChainEngine.analyze(
                            cleanedRows
                        )
                        : SupplyChainEngine.emptyAnalysis();


                alert(
                    "Dataset successfully cleaned and re-profiled."
                );


                this.switchTab(
                    "quality"
                );

            }
        );

    }

};


// ============================================================
// START APPLICATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        App.init();

    }
);