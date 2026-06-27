/** @odoo-module **/

import { Component, useState, useRef, onMounted, onWillUnmount, markup } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

export class TFECommandPalette extends Component {
    static template = "tfe.CommandPalette";
    static props = {};

    setup() {
        this.menuService = useService("menu");
        this.state = useState({
            isOpen: false,
            query: "",
            results: [],
            selectedIndex: 0,
        });
        this.inputRef = useRef("searchInput");
        this._allMenuItems = null;

        onMounted(() => {
            this._onKeyDown = this._handleGlobalKeyDown.bind(this);
            this._onOpen = () => this.open();
            document.addEventListener("keydown", this._onKeyDown, true);
            document.addEventListener("tfe-open-palette", this._onOpen);
        });

        onWillUnmount(() => {
            document.removeEventListener("keydown", this._onKeyDown, true);
            document.removeEventListener("tfe-open-palette", this._onOpen);
        });
    }

    _buildMenuIndex() {
        if (this._allMenuItems) return this._allMenuItems;
        const items = [];
        const apps = this.menuService.getApps() || [];
        for (const app of apps) {
            const tree = this.menuService.getMenuAsTree(app.id);
            this._flattenTree(tree, [], items);
        }
        this._allMenuItems = items;
        return items;
    }

    _flattenTree(node, path, results) {
        const currentPath = [...path, node.name];
        if (node.actionID) {
            results.push({
                id: node.id,
                name: node.name,
                path: currentPath.join(" / "),
                actionID: node.actionID,
                menu: node,
            });
        }
        if (node.childrenTree) {
            for (const child of node.childrenTree) {
                this._flattenTree(child, currentPath, results);
            }
        }
    }

    open() {
        this._allMenuItems = null;
        this.state.isOpen = true;
        this.state.query = "";
        this.state.results = [];
        this.state.selectedIndex = 0;
        requestAnimationFrame(() => {
            if (this.inputRef.el) this.inputRef.el.focus();
        });
    }

    close() {
        this.state.isOpen = false;
        this.state.query = "";
        this.state.results = [];
    }

    onInput(ev) {
        const query = ev.target.value.trim().toLowerCase();
        this.state.query = query;
        this.state.selectedIndex = 0;

        if (!query) {
            this.state.results = [];
            return;
        }

        const allItems = this._buildMenuIndex();
        const terms = query.split(/\s+/);
        const scored = [];

        for (const item of allItems) {
            const haystack = item.path.toLowerCase();
            const nameLC = item.name.toLowerCase();
            let match = true;
            for (const term of terms) {
                if (!haystack.includes(term)) { match = false; break; }
            }
            if (!match) continue;

            let score = 0;
            if (nameLC.startsWith(query)) score += 100;
            else if (nameLC.includes(query)) score += 50;
            score -= item.path.split(" / ").length;
            scored.push({ ...item, score });
        }

        scored.sort((a, b) => b.score - a.score);
        this.state.results = scored.slice(0, 12);
    }

    onResultClick(item) {
        this.close();
        this.menuService.selectMenu(item.menu);
    }

    onOverlayClick(ev) {
        if (ev.target === ev.currentTarget) this.close();
    }

    _handleGlobalKeyDown(ev) {
        // Intercept Ctrl+K before Odoo's handler
        if ((ev.ctrlKey || ev.metaKey) && ev.key === "k") {
            ev.preventDefault();
            ev.stopPropagation();
            ev.stopImmediatePropagation();
            if (this.state.isOpen) {
                this.close();
            } else {
                this.open();
            }
            return;
        }

        if (!this.state.isOpen) return;

        if (ev.key === "Escape") {
            ev.preventDefault();
            ev.stopPropagation();
            this.close();
        } else if (ev.key === "ArrowDown") {
            ev.preventDefault();
            this.state.selectedIndex = Math.min(
                this.state.selectedIndex + 1,
                this.state.results.length - 1
            );
        } else if (ev.key === "ArrowUp") {
            ev.preventDefault();
            this.state.selectedIndex = Math.max(this.state.selectedIndex - 1, 0);
        } else if (ev.key === "Enter" && this.state.results.length) {
            ev.preventDefault();
            this.onResultClick(this.state.results[this.state.selectedIndex]);
        }
    }

    highlightMatch(text) {
        if (!this.state.query) return markup(text);
        const terms = this.state.query.split(/\s+/);
        let result = text;
        for (const term of terms) {
            const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
            result = result.replace(regex, "<b>$1</b>");
        }
        return markup(result);
    }
}

registry.category("main_components").add("TFECommandPalette", { Component: TFECommandPalette });
