/** @odoo-module **/

import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

class DarkModeToggle extends Component {
    static template = "tfe.DarkModeToggle";

    setup() {
        this.themeService = useService("theme_flavor_enterprise");
    }

    get isDark() {
        return this.themeService.isDark();
    }

    toggleDark() {
        this.themeService.toggleDarkMode();
        this.render();
    }
}

registry
    .category("systray")
    .add("tfe.dark_mode_toggle", { Component: DarkModeToggle }, { sequence: 1 });
