const ThemeManager = {

    themes: {

        ben10: {
            label: "💚 Ben 10",
            primary: "#9dff00",
            secondary: "#18c900",
            accent: "#dfff8a",
            background: "#020703"
        },

        avengers: {
            label: "🛡️ Avengers",
            primary: "#ef233c",
            secondary: "#2563eb",
            accent: "#f59e0b",
            background: "#05070c"
        },

        midnight: {
            label: "🌌 Midnight AI",
            primary: "#6366f1",
            secondary: "#a855f7",
            accent: "#06b6d4",
            background: "#030610"
        },

        cyberpunk: {
            label: "⚡ Cyberpunk",
            primary: "#ff00aa",
            secondary: "#00f5ff",
            accent: "#ffe600",
            background: "#05010a"
        },

        ocean: {
            label: "🌊 Ocean",
            primary: "#00b4d8",
            secondary: "#0077b6",
            accent: "#48cae4",
            background: "#02131a"
        },

        royal: {
            label: "👑 Royal",
            primary: "#c084fc",
            secondary: "#7c3aed",
            accent: "#facc15",
            background: "#080411"
        },

        sunset: {
            label: "🌅 Sunset",
            primary: "#ff6b35",
            secondary: "#ef233c",
            accent: "#b5179e",
            background: "#100306"
        }
    },


    init() {

        this.injectStyles();

        this.createPicker();

        const saved =
            localStorage.getItem("omniDataTheme") ||
            "midnight";

        this.apply(saved);
    },


    injectStyles() {

        const style =
            document.createElement("style");

        style.id =
            "omniThemeStyles";

        style.textContent = `

        :root {

            --theme-primary: #6366f1;
            --theme-secondary: #a855f7;
            --theme-accent: #06b6d4;
            --theme-background: #030610;
        }


        /* =====================================================
           GLOBAL BACKGROUND
        ===================================================== */

        html,
        body {

            min-height: 100%;
        }


        body {

            background:

                radial-gradient(
                    circle at 10% 0%,
                    color-mix(
                        in srgb,
                        var(--theme-primary) 35%,
                        transparent
                    ),
                    transparent 30%
                ),

                radial-gradient(
                    circle at 90% 20%,
                    color-mix(
                        in srgb,
                        var(--theme-secondary) 30%,
                        transparent
                    ),
                    transparent 30%
                ),

                radial-gradient(
                    circle at 50% 100%,
                    color-mix(
                        in srgb,
                        var(--theme-accent) 24%,
                        transparent
                    ),
                    transparent 32%
                ),

                var(--theme-background) !important;

            transition:
                background 0.5s ease;
        }


        /* =====================================================
           BACKGROUND GRID
        ===================================================== */

        body::before {

            content: "";

            position: fixed;

            inset: 0;

            pointer-events: none;

            z-index: 0;

            background-image:

                linear-gradient(
                    color-mix(
                        in srgb,
                        var(--theme-primary) 13%,
                        transparent
                    ) 1px,
                    transparent 1px
                ),

                linear-gradient(
                    90deg,
                    color-mix(
                        in srgb,
                        var(--theme-secondary) 10%,
                        transparent
                    ) 1px,
                    transparent 1px
                );

            background-size:
                45px 45px;

            opacity: 0.14;
        }


        body > * {

            position: relative;

            z-index: 1;
        }


        /* =====================================================
           HEADER
        ===================================================== */

        body > header {

            background:

                linear-gradient(
                    100deg,

                    color-mix(
                        in srgb,
                        var(--theme-primary) 20%,
                        #080b10
                    ),

                    color-mix(
                        in srgb,
                        var(--theme-secondary) 18%,
                        #080b10
                    )
                ) !important;

            border-bottom:

                2px solid
                var(--theme-primary) !important;

            box-shadow:

                0 0 40px

                color-mix(
                    in srgb,
                    var(--theme-primary) 28%,
                    transparent
                );
        }


        /* =====================================================
           NAVIGATION
        ===================================================== */

        body nav {

            background:

                linear-gradient(
                    90deg,

                    color-mix(
                        in srgb,
                        var(--theme-primary) 15%,
                        #080b10
                    ),

                    color-mix(
                        in srgb,
                        var(--theme-secondary) 13%,
                        #080b10
                    )
                ) !important;

            border-bottom:

                1px solid

                color-mix(
                    in srgb,
                    var(--theme-primary) 65%,
                    #27303a
                ) !important;
        }


        .nav-tab {

            transition:

                all 0.25s ease;
        }


        .nav-tab.active {

            background:

                linear-gradient(
                    135deg,
                    var(--theme-primary),
                    var(--theme-secondary)
                ) !important;

            color: white !important;

            box-shadow:

                0 0 30px

                color-mix(
                    in srgb,
                    var(--theme-primary) 55%,
                    transparent
                ) !important;
        }


        .nav-tab:hover:not(.active) {

            background:

                color-mix(
                    in srgb,
                    var(--theme-primary) 20%,
                    transparent
                ) !important;

            color: white !important;
        }


        /* =====================================================
           CARDS
        ===================================================== */

        body .rounded-2xl {

            border-color:

                color-mix(
                    in srgb,
                    var(--theme-primary) 38%,
                    #26313c
                ) !important;

            box-shadow:

                0 12px 38px
                rgba(0,0,0,0.38),

                inset 0 1px 0
                rgba(255,255,255,0.035);

            transition:

                border-color 0.35s ease,
                box-shadow 0.35s ease,
                transform 0.25s ease;
        }


        body .rounded-2xl:hover {

            box-shadow:

                0 18px 50px

                color-mix(
                    in srgb,
                    var(--theme-primary) 18%,
                    rgba(0,0,0,0.4)
                );
        }


        /* =====================================================
           BORDERS
        ===================================================== */

        body [class*="border-slate-8"],
        body [class*="border-slate-7"] {

            border-color:

                color-mix(
                    in srgb,
                    var(--theme-primary) 35%,
                    #2c3540
                ) !important;
        }


        /* =====================================================
           BUTTONS
        ===================================================== */

        body .bg-indigo-600,
        body .bg-indigo-500 {

            background:

                linear-gradient(
                    135deg,
                    var(--theme-primary),
                    var(--theme-secondary)
                ) !important;

            box-shadow:

                0 8px 28px

                color-mix(
                    in srgb,
                    var(--theme-primary) 45%,
                    transparent
                ) !important;
        }


        body .bg-purple-600,
        body .bg-purple-500 {

            background:

                linear-gradient(
                    135deg,
                    var(--theme-secondary),
                    var(--theme-accent)
                ) !important;
        }


        body button:hover {

            filter:
                brightness(1.12);

            transform:
                translateY(-1px);
        }


        /* =====================================================
           ACCENT TEXT
        ===================================================== */

        body .text-indigo-400,
        body .text-indigo-300 {

            color:
                var(--theme-primary) !important;
        }


        body .text-purple-400,
        body .text-purple-300 {

            color:
                var(--theme-secondary) !important;
        }


        /* =====================================================
           INPUTS
        ===================================================== */

        body input,
        body select,
        body textarea {

            border-color:

                color-mix(
                    in srgb,
                    var(--theme-primary) 40%,
                    #334155
                ) !important;
        }


        body input:focus,
        body select:focus,
        body textarea:focus {

            border-color:
                var(--theme-primary) !important;

            box-shadow:

                0 0 0 3px

                color-mix(
                    in srgb,
                    var(--theme-primary) 20%,
                    transparent
                ) !important;
        }


        /* =====================================================
           THEME PICKER
        ===================================================== */

        #omniThemePicker {

            display: flex;

            align-items: center;

            gap: 8px;

            margin-right: 8px;

            padding:
                6px 10px;

            border-radius: 11px;

            background:
                rgba(0,0,0,0.38);

            border:

                1px solid

                color-mix(
                    in srgb,
                    var(--theme-primary) 70%,
                    transparent
                );

            box-shadow:

                0 0 22px

                color-mix(
                    in srgb,
                    var(--theme-primary) 25%,
                    transparent
                );
        }


        #omniThemePicker select {

            border: none !important;

            background: transparent !important;

            color: white !important;

            font-size: 11px;

            font-weight: 700;

            outline: none;

            cursor: pointer;
        }


        #omniThemePicker option {

            background:
                #111827;

            color:
                white;
        }


        #omniThemeSwatch {

            width:
                18px;

            height:
                18px;

            border-radius:
                50%;

            background:

                linear-gradient(
                    135deg,
                    var(--theme-primary),
                    var(--theme-secondary)
                );

            box-shadow:

                0 0 16px
                var(--theme-primary);
        }


        /* =====================================================
           BEN 10
        ===================================================== */

        html[data-theme="ben10"] {

            --theme-primary: #9dff00;
            --theme-secondary: #18c900;
            --theme-accent: #dfff8a;
            --theme-background: #020703;
        }


        html[data-theme="ben10"] body {

            background:

                radial-gradient(
                    circle at 80% 10%,
                    rgba(157,255,0,0.42),
                    transparent 27%
                ),

                radial-gradient(
                    circle at 15% 80%,
                    rgba(24,201,0,0.34),
                    transparent 30%
                ),

                #020703 !important;
        }


        html[data-theme="ben10"] body::after {

            content: "";

            position: fixed;

            inset: 0;

            pointer-events: none;

            border:
                3px solid
                rgba(157,255,0,0.28);

            box-shadow:
                inset 0 0 90px
                rgba(157,255,0,0.10);

            z-index: 9998;
        }


        /* =====================================================
           AVENGERS
        ===================================================== */

        html[data-theme="avengers"] {

            --theme-primary: #ef233c;
            --theme-secondary: #2563eb;
            --theme-accent: #f59e0b;
            --theme-background: #05070c;
        }


        html[data-theme="avengers"] body {

            background:

                radial-gradient(
                    circle at 80% 10%,
                    rgba(239,35,60,0.38),
                    transparent 28%
                ),

                radial-gradient(
                    circle at 15% 80%,
                    rgba(37,99,235,0.32),
                    transparent 30%
                ),

                radial-gradient(
                    circle at 52% 45%,
                    rgba(245,158,11,0.18),
                    transparent 32%
                ),

                #05070c !important;
        }


        /* =====================================================
           MIDNIGHT AI
        ===================================================== */

        html[data-theme="midnight"] {

            --theme-primary: #6366f1;
            --theme-secondary: #a855f7;
            --theme-accent: #06b6d4;
            --theme-background: #030610;
        }


        html[data-theme="midnight"] body {

            background:

                radial-gradient(
                    circle at 80% 10%,
                    rgba(99,102,241,0.38),
                    transparent 28%
                ),

                radial-gradient(
                    circle at 15% 80%,
                    rgba(168,85,247,0.30),
                    transparent 30%
                ),

                radial-gradient(
                    circle at 50% 45%,
                    rgba(6,182,212,0.16),
                    transparent 32%
                ),

                #030610 !important;
        }


        /* =====================================================
           CYBERPUNK
        ===================================================== */

        html[data-theme="cyberpunk"] {

            --theme-primary: #ff00aa;
            --theme-secondary: #00f5ff;
            --theme-accent: #ffe600;
            --theme-background: #05010a;
        }


        html[data-theme="cyberpunk"] body {

            background:

                radial-gradient(
                    circle at 80% 10%,
                    rgba(255,0,170,0.42),
                    transparent 27%
                ),

                radial-gradient(
                    circle at 15% 80%,
                    rgba(0,245,255,0.32),
                    transparent 30%
                ),

                radial-gradient(
                    circle at 50% 45%,
                    rgba(255,230,0,0.12),
                    transparent 30%
                ),

                #05010a !important;
        }


        html[data-theme="cyberpunk"] body::after {

            content: "";

            position: fixed;

            left: 0;
            right: 0;
            bottom: 0;

            height: 5px;

            background:

                linear-gradient(
                    90deg,
                    #ff00aa,
                    #00f5ff,
                    #ffe600,
                    #ff00aa
                );

            box-shadow:

                0 0 22px
                rgba(0,245,255,0.55);

            z-index: 9999;
        }


        /* =====================================================
           OCEAN
        ===================================================== */

        html[data-theme="ocean"] {

            --theme-primary: #00b4d8;
            --theme-secondary: #0077b6;
            --theme-accent: #48cae4;
            --theme-background: #02131a;
        }


        html[data-theme="ocean"] body {

            background:

                radial-gradient(
                    circle at 80% 5%,
                    rgba(0,180,216,0.38),
                    transparent 30%
                ),

                radial-gradient(
                    circle at 10% 80%,
                    rgba(0,119,182,0.34),
                    transparent 30%
                ),

                radial-gradient(
                    circle at 50% 45%,
                    rgba(72,202,228,0.14),
                    transparent 33%
                ),

                #02131a !important;
        }


        /* =====================================================
           ROYAL
        ===================================================== */

        html[data-theme="royal"] {

            --theme-primary: #c084fc;
            --theme-secondary: #7c3aed;
            --theme-accent: #facc15;
            --theme-background: #080411;
        }


        html[data-theme="royal"] body {

            background:

                radial-gradient(
                    circle at 80% 8%,
                    rgba(192,132,252,0.40),
                    transparent 28%
                ),

                radial-gradient(
                    circle at 15% 82%,
                    rgba(124,58,237,0.34),
                    transparent 30%
                ),

                radial-gradient(
                    circle at 50% 40%,
                    rgba(250,204,21,0.15),
                    transparent 32%
                ),

                #080411 !important;
        }


        html[data-theme="royal"] body::after {

            content: "";

            position: fixed;

            left: 0;
            right: 0;
            bottom: 0;

            height: 5px;

            background:

                linear-gradient(
                    90deg,
                    #7c3aed,
                    #c084fc,
                    #facc15,
                    #7c3aed
                );

            box-shadow:

                0 0 22px
                rgba(192,132,252,0.55);

            z-index: 9999;
        }


        /* =====================================================
           SUNSET
        ===================================================== */

        html[data-theme="sunset"] {

            --theme-primary: #ff6b35;
            --theme-secondary: #ef233c;
            --theme-accent: #b5179e;
            --theme-background: #100306;
        }


        html[data-theme="sunset"] body {

            background:

                radial-gradient(
                    circle at 80% 8%,
                    rgba(255,107,53,0.42),
                    transparent 28%
                ),

                radial-gradient(
                    circle at 15% 82%,
                    rgba(181,23,158,0.30),
                    transparent 31%
                ),

                radial-gradient(
                    circle at 50% 45%,
                    rgba(239,35,60,0.17),
                    transparent 33%
                ),

                #100306 !important;
        }


        html[data-theme="sunset"] body::after {

            content: "";

            position: fixed;

            left: 0;
            right: 0;
            bottom: 0;

            height: 5px;

            background:

                linear-gradient(
                    90deg,
                    #ff6b35,
                    #ef233c,
                    #b5179e,
                    #ff6b35
                );

            box-shadow:

                0 0 22px
                rgba(255,107,53,0.50);

            z-index: 9999;
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 700px) {

            #omniThemePicker select {

                max-width: 100px;
            }
        }

        `;

        document.head.appendChild(style);
    },


    createPicker() {

        if (
            document.getElementById(
                "omniThemePicker"
            )
        ) {
            return;
        }


        const uploadButton =
            document.getElementById(
                "uploadNewDatasetNavBtn"
            );


        if (!uploadButton) {
            return;
        }


        const picker =
            document.createElement("div");


        picker.id =
            "omniThemePicker";


        picker.innerHTML = `

            <span
                id="omniThemeSwatch"
                title="Current theme"
            ></span>


            <select
                id="omniThemeSelect"
                aria-label="Choose application theme"
            >

                <option value="ben10">
                    💚 Ben 10
                </option>

                <option value="avengers">
                    🛡️ Avengers
                </option>

                <option value="midnight">
                    🌌 Midnight AI
                </option>

                <option value="cyberpunk">
                    ⚡ Cyberpunk
                </option>

                <option value="ocean">
                    🌊 Ocean
                </option>

                <option value="royal">
                    👑 Royal
                </option>

                <option value="sunset">
                    🌅 Sunset
                </option>

            </select>
        `;


        uploadButton.parentElement.insertBefore(
            picker,
            uploadButton
        );


        const select =
            document.getElementById(
                "omniThemeSelect"
            );


        select.addEventListener(
            "change",
            event => {

                this.apply(
                    event.target.value
                );
            }
        );
    },


    apply(themeName) {

        if (
            !this.themes[themeName]
        ) {
            themeName = "midnight";
        }


        document.documentElement.dataset.theme =
            themeName;


        localStorage.setItem(
            "omniDataTheme",
            themeName
        );


        const select =
            document.getElementById(
                "omniThemeSelect"
            );


        if (select) {

            select.value =
                themeName;
        }


        const swatch =
            document.getElementById(
                "omniThemeSwatch"
            );


        if (swatch) {

            const theme =
                this.themes[themeName];


            swatch.style.background =

                `linear-gradient(
                    135deg,
                    ${theme.primary},
                    ${theme.secondary}
                )`;


            swatch.style.boxShadow =

                `0 0 18px ${theme.primary}`;
        }
    }
};


document.addEventListener(
    "DOMContentLoaded",
    () => {

        ThemeManager.init();

    }
);