/** @odoo-module **/

import { registry } from "@web/core/registry";
import { user } from "@web/core/user";
import { rpc } from "@web/core/network/rpc";

const PRESETS = {
    indigo: {
        light: {
            primary: "#4F46E5", primary_soft: "#ECEDFE", on_primary: "#FFFFFF",
            secondary: "#6366F1", accent: "#0EA5C4", accent_soft: "#E0F4F9",
            bg: "#F2F3FB", surface: "#FCFCFE", surface_2: "#F6F7FD",
            text: "#1B1C2E", text_muted: "#6B6E85", border: "#E6E7F2",
        },
        dark: {
            primary: "#8487FF", primary_soft: "#1E1F3A", on_primary: "#0C0D17",
            secondary: "#6366F1", accent: "#22D3EE", accent_soft: "#102A30",
            bg: "#0C0D17", surface: "#161827", surface_2: "#1D1F30",
            text: "#E7E8F4", text_muted: "#9A9DB5", border: "#272A3C",
        },
    },
    emerald: {
        light: {
            primary: "#059669", primary_soft: "#E1F4ED", on_primary: "#FFFFFF",
            secondary: "#10B981", accent: "#E8920B", accent_soft: "#FBEFD6",
            bg: "#EFF4F1", surface: "#FBFDFC", surface_2: "#F3F8F5",
            text: "#102018", text_muted: "#5E7268", border: "#DEEAE3",
        },
        dark: {
            primary: "#2BC48A", primary_soft: "#10241B", on_primary: "#04150D",
            secondary: "#10B981", accent: "#FBBF24", accent_soft: "#2C2410",
            bg: "#0A130F", surface: "#11201A", surface_2: "#16271F",
            text: "#E4F0EA", text_muted: "#8AA399", border: "#21302A",
        },
    },
    sand: {
        light: {
            primary: "#B85C38", primary_soft: "#F6E8E0", on_primary: "#FFFFFF",
            secondary: "#C2703D", accent: "#4F7A66", accent_soft: "#E4EDE8",
            bg: "#F3F0E9", surface: "#FBF9F3", surface_2: "#F0EBE0",
            text: "#2A2520", text_muted: "#786E60", border: "#E7E0D2",
        },
        dark: {
            primary: "#D98E5F", primary_soft: "#2A1E15", on_primary: "#1A0F08",
            secondary: "#C2703D", accent: "#7FA890", accent_soft: "#16241D",
            bg: "#14110C", surface: "#1E1A13", surface_2: "#251F17",
            text: "#EDE6D9", text_muted: "#A89C88", border: "#2F2A1F",
        },
    },
};

function applyColors(colors) {
    const root = document.documentElement;
    for (const [key, value] of Object.entries(colors)) {
        root.style.setProperty(`--tf-${key.replace(/_/g, "-")}`, value);
    }
}

function loadGoogleFont(fontName) {
    const id = "tf-font-" + fontName.replace(/\s+/g, "-").toLowerCase();
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;500;600;700&display=swap`;
    document.head.appendChild(link);
}

const themeFlavorEnterpriseService = {
    dependencies: [],

    async start() {
        let preset = "indigo";
        let darkMode = false;
        let density = "comfortable";
        let zoom = 100;
        let fontHeading = "Space Grotesk";
        let fontBody = "Manrope";
        let loaderStyle = "pulse";

        // Load preset
        try {
            const result = await rpc(
                "/web/dataset/call_kw/ir.config_parameter/get_param",
                { model: "ir.config_parameter", method: "get_param",
                  args: ["flavor_theme_enterprise.preset", "indigo"], kwargs: {} }
            );
            if (result) preset = result;
        } catch {}

        // Load dark mode preference
        try {
            const userResult = await rpc(
                "/web/dataset/call_kw/res.users/read",
                { model: "res.users", method: "read",
                  args: [[user.userId], ["tfe_dark_mode"]], kwargs: {} }
            );
            if (userResult && userResult.length) {
                darkMode = userResult[0].tfe_dark_mode || false;
            }
        } catch {}

        // Load enterprise config
        try {
            const config = await rpc(
                "/web/dataset/call_kw/res.config.settings/get_enterprise_config",
                { model: "res.config.settings", method: "get_enterprise_config",
                  args: [], kwargs: {} }
            );
            if (config) {
                density = config.density || "comfortable";
                zoom = config.zoom || 100;
                fontHeading = config.font_heading || "Space Grotesk";
                fontBody = config.font_body || "Manrope";
                loaderStyle = config.loader_style || "pulse";
            }
        } catch {}

        // Apply colors
        const mode = darkMode ? "dark" : "light";
        const presetColors = PRESETS[preset]?.[mode] || PRESETS.indigo.light;
        applyColors(presetColors);

        if (darkMode) {
            document.body.classList.add("tf-dark");
        }

        // Apply density
        document.body.classList.remove("tf-density-compact", "tf-density-comfortable", "tf-density-spacious");
        document.body.classList.add(`tf-density-${density}`);

        // Apply zoom
        document.documentElement.style.setProperty("--tf-zoom", zoom / 100);
        document.documentElement.style.fontSize = `${zoom / 100 * 16}px`;

        // Apply fonts
        loadGoogleFont(fontHeading);
        loadGoogleFont(fontBody);
        document.documentElement.style.setProperty("--tf-font-heading", `'${fontHeading}', system-ui, sans-serif`);
        document.documentElement.style.setProperty("--tf-font-body", `'${fontBody}', system-ui, sans-serif`);

        // Apply loader style
        document.body.classList.remove("tf-loader-pulse", "tf-loader-dots", "tf-loader-ring");
        document.body.classList.add(`tf-loader-${loaderStyle}`);

        return {
            PRESETS,
            getPreset: () => preset,
            isDark: () => darkMode,
            applyPreset(presetName, m) {
                const colors = PRESETS[presetName]?.[m];
                if (colors) {
                    preset = presetName;
                    applyColors(colors);
                }
            },
            toggleDarkMode() {
                darkMode = !darkMode;
                const m = darkMode ? "dark" : "light";
                const colors = PRESETS[preset]?.[m] || PRESETS.indigo.light;
                applyColors(colors);
                document.body.classList.toggle("tf-dark", darkMode);
                rpc("/web/dataset/call_kw/res.users/write", {
                    model: "res.users", method: "write",
                    args: [[user.userId], { tfe_dark_mode: darkMode }], kwargs: {},
                });
                return darkMode;
            },
            setDensity(val) {
                document.body.classList.remove("tf-density-compact", "tf-density-comfortable", "tf-density-spacious");
                document.body.classList.add(`tf-density-${val}`);
                density = val;
            },
            setZoom(val) {
                zoom = val;
                document.documentElement.style.setProperty("--tf-zoom", val / 100);
                document.documentElement.style.fontSize = `${val / 100 * 16}px`;
            },
            setFont(type, fontName) {
                loadGoogleFont(fontName);
                const prop = type === "heading" ? "--tf-font-heading" : "--tf-font-body";
                document.documentElement.style.setProperty(prop, `'${fontName}', system-ui, sans-serif`);
            },
            applyColors,
        };
    },
};

registry.category("services").add("flavor_theme_enterprise", themeFlavorEnterpriseService);
