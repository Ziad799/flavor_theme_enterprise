/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { standardFieldProps } from "@web/views/fields/standard_field_props";

class ThemeColorPicker extends Component {
    static template = "tfe.ColorPicker";
    static props = { ...standardFieldProps };

    setup() {
        this.themeService = useService("theme_flavor_enterprise");
        this.state = useState({
            selectedPreset: this.themeService.getPreset(),
            previewMode: this.themeService.isDark() ? "dark" : "light",
        });
    }

    get presets() {
        return [
            {
                key: "indigo",
                label: "Indigo Pro",
                colors: this.themeService.PRESETS.indigo,
            },
            {
                key: "emerald",
                label: "Emerald",
                colors: this.themeService.PRESETS.emerald,
            },
            {
                key: "sand",
                label: "Sand",
                colors: this.themeService.PRESETS.sand,
            },
        ];
    }

    onSelectPreset(presetKey) {
        this.state.selectedPreset = presetKey;
        this.themeService.applyPreset(presetKey, this.state.previewMode);
        this.props.record.update({ tfe_preset: presetKey });
    }

    togglePreviewMode() {
        this.state.previewMode = this.state.previewMode === "light" ? "dark" : "light";
        this.themeService.applyPreset(this.state.selectedPreset, this.state.previewMode);
    }
}

registry.category("fields").add("tfe_color_picker", {
    component: ThemeColorPicker,
    supportedTypes: ["selection"],
});
