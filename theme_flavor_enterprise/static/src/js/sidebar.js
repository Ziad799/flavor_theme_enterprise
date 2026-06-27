/** @odoo-module **/

import { Component, useState, onMounted } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { user } from "@web/core/user";

export class TFESidebar extends Component {
    static template = "tfe.Sidebar";
    static props = {};

    setup() {
        this.menuService = useService("menu");
        this.actionService = useService("action");
        this.orm = useService("orm");
        this.state = useState({
            collapsed: false,
            showAppsGrid: true,
            currentAppId: null,
            bookmarks: [],
        });
        this.userId = user.userId;
        this.userName = user.name;

        onMounted(() => {
            document.body.classList.add("tf-has-sidebar");
            this._updateCurrentApp();
            this._loadBookmarks();
            this._interval = setInterval(() => this._updateCurrentApp(), 500);
        });
    }

    _updateCurrentApp() {
        try {
            const app = this.menuService.getCurrentApp();
            const newId = app ? app.id : null;
            if (this.state.currentAppId !== newId) {
                this.state.currentAppId = newId;
            }
        } catch {}
    }

    async _loadBookmarks() {
        try {
            const bms = await this.orm.call("theme.flavor.bookmark", "get_user_bookmarks");
            this.state.bookmarks = bms || [];
        } catch {
            this.state.bookmarks = [];
        }
    }

    get apps() {
        try { return this.menuService.getApps() || []; }
        catch { return []; }
    }

    get currentApp() {
        try { return this.menuService.getCurrentApp(); }
        catch { return null; }
    }

    isActive(app) {
        return this.state.currentAppId === app.id;
    }

    onAppClick(app) {
        this.state.showAppsGrid = true;
        this.state.currentAppId = app.id;
        this.menuService.selectMenu(app);
    }

    toggleCollapse() {
        this.state.collapsed = !this.state.collapsed;
        document.body.classList.toggle("tf-sidebar-collapsed", this.state.collapsed);
    }

    toggleAppsGrid() {
        this.state.showAppsGrid = !this.state.showAppsGrid;
    }

    async onPreferences() {
        const actionDescription = await this.orm.call("res.users", "action_get");
        actionDescription.res_id = this.userId;
        this.actionService.doAction(actionDescription);
    }

    onLogout() {
        window.location.href = "/web/session/logout";
    }

    onSearchClick() {
        document.dispatchEvent(new CustomEvent("tfe-open-palette"));
    }

    // Bookmarks
    onBookmarkClick(bm) {
        try {
            const menu = this.menuService.getMenu(bm.menu_id);
            if (menu) this.menuService.selectMenu(menu);
        } catch {}
    }

    async onAddBookmark(app) {
        try {
            await this.orm.call("theme.flavor.bookmark", "add_bookmark", [app.id]);
            await this._loadBookmarks();
        } catch {}
    }

    async onRemoveBookmark(bm) {
        try {
            await this.orm.call("theme.flavor.bookmark", "remove_bookmark", [bm.id]);
            await this._loadBookmarks();
        } catch {}
    }

    isBookmarked(app) {
        return this.state.bookmarks.some(b => b.menu_id === app.id);
    }
}

registry.category("main_components").add("TFESidebar", { Component: TFESidebar });
