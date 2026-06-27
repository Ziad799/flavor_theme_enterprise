from odoo import api, fields, models


PRESETS = {
    "indigo": {
        "light": {
            "primary": "#4F46E5", "primary_soft": "#ECEDFE", "on_primary": "#FFFFFF",
            "secondary": "#6366F1", "accent": "#0EA5C4", "accent_soft": "#E0F4F9",
            "bg": "#F2F3FB", "surface": "#FCFCFE", "surface_2": "#F6F7FD",
            "text": "#1B1C2E", "text_muted": "#6B6E85", "border": "#E6E7F2",
        },
        "dark": {
            "primary": "#8487FF", "primary_soft": "#1E1F3A", "on_primary": "#0C0D17",
            "secondary": "#6366F1", "accent": "#22D3EE", "accent_soft": "#102A30",
            "bg": "#0C0D17", "surface": "#161827", "surface_2": "#1D1F30",
            "text": "#E7E8F4", "text_muted": "#9A9DB5", "border": "#272A3C",
        },
    },
    "emerald": {
        "light": {
            "primary": "#059669", "primary_soft": "#E1F4ED", "on_primary": "#FFFFFF",
            "secondary": "#10B981", "accent": "#E8920B", "accent_soft": "#FBEFD6",
            "bg": "#EFF4F1", "surface": "#FBFDFC", "surface_2": "#F3F8F5",
            "text": "#102018", "text_muted": "#5E7268", "border": "#DEEAE3",
        },
        "dark": {
            "primary": "#2BC48A", "primary_soft": "#10241B", "on_primary": "#04150D",
            "secondary": "#10B981", "accent": "#FBBF24", "accent_soft": "#2C2410",
            "bg": "#0A130F", "surface": "#11201A", "surface_2": "#16271F",
            "text": "#E4F0EA", "text_muted": "#8AA399", "border": "#21302A",
        },
    },
    "sand": {
        "light": {
            "primary": "#B85C38", "primary_soft": "#F6E8E0", "on_primary": "#FFFFFF",
            "secondary": "#C2703D", "accent": "#4F7A66", "accent_soft": "#E4EDE8",
            "bg": "#F3F0E9", "surface": "#FBF9F3", "surface_2": "#F0EBE0",
            "text": "#2A2520", "text_muted": "#786E60", "border": "#E7E0D2",
        },
        "dark": {
            "primary": "#D98E5F", "primary_soft": "#2A1E15", "on_primary": "#1A0F08",
            "secondary": "#C2703D", "accent": "#7FA890", "accent_soft": "#16241D",
            "bg": "#14110C", "surface": "#1E1A13", "surface_2": "#251F17",
            "text": "#EDE6D9", "text_muted": "#A89C88", "border": "#2F2A1F",
        },
    },
}

GOOGLE_FONTS = [
    ("Inter", "Inter"),
    ("Poppins", "Poppins"),
    ("Roboto", "Roboto"),
    ("Open Sans", "Open Sans"),
    ("Lato", "Lato"),
    ("Montserrat", "Montserrat"),
    ("Raleway", "Raleway"),
    ("Nunito", "Nunito"),
    ("Work Sans", "Work Sans"),
    ("DM Sans", "DM Sans"),
    ("Plus Jakarta Sans", "Plus Jakarta Sans"),
    ("Outfit", "Outfit"),
    ("Manrope", "Manrope"),
    ("Space Grotesk", "Space Grotesk"),
    ("Rubik", "Rubik"),
    ("Quicksand", "Quicksand"),
    ("Mulish", "Mulish"),
    ("Josefin Sans", "Josefin Sans"),
    ("Playfair Display", "Playfair Display"),
    ("Merriweather", "Merriweather"),
]


class ResConfigSettings(models.TransientModel):
    _name = 'res.config.settings'
    _inherit = ['res.config.settings']

    tfe_preset = fields.Selection(
        [("indigo", "Indigo Pro"), ("emerald", "Emerald"), ("sand", "Sand")],
        string="Color Preset",
        config_parameter="theme_flavor_enterprise.preset",
        default="indigo",
    )
    tfe_primary = fields.Char(
        string="Primary Color",
        config_parameter="theme_flavor_enterprise.primary_color",
    )
    tfe_accent = fields.Char(
        string="Accent Color",
        config_parameter="theme_flavor_enterprise.accent_color",
    )
    tfe_use_custom = fields.Boolean(
        string="Use Custom Colors",
        config_parameter="theme_flavor_enterprise.use_custom",
        default=False,
    )
    tfe_density = fields.Selection(
        [("compact", "Compact"), ("comfortable", "Comfortable"), ("spacious", "Spacious")],
        string="List Density",
        config_parameter="theme_flavor_enterprise.density",
        default="comfortable",
    )
    tfe_zoom = fields.Integer(
        string="Zoom Level (%)",
        config_parameter="theme_flavor_enterprise.zoom",
        default=100,
    )
    tfe_font_heading = fields.Selection(
        GOOGLE_FONTS,
        string="Heading Font",
        config_parameter="theme_flavor_enterprise.font_heading",
        default="Space Grotesk",
    )
    tfe_font_body = fields.Selection(
        GOOGLE_FONTS,
        string="Body Font",
        config_parameter="theme_flavor_enterprise.font_body",
        default="Manrope",
    )
    tfe_loader_style = fields.Selection(
        [("pulse", "Pulse Bar"), ("dots", "Bouncing Dots"), ("ring", "Spinner Ring")],
        string="Loading Animation",
        config_parameter="theme_flavor_enterprise.loader_style",
        default="pulse",
    )
    tfe_login_bg = fields.Binary(
        string="Login Background Image",
        related="company_id.tfe_login_bg",
        readonly=False,
    )

    @api.model
    def get_theme_colors(self, mode="light"):
        ICP = self.env["ir.config_parameter"].sudo()
        preset = ICP.get_param("theme_flavor_enterprise.preset", "indigo")
        use_custom = ICP.get_param("theme_flavor_enterprise.use_custom", "False")
        if use_custom == "True":
            primary = ICP.get_param("theme_flavor_enterprise.primary_color", "#4F46E5")
            accent = ICP.get_param("theme_flavor_enterprise.accent_color", "#0EA5C4")
            base = PRESETS.get(preset, PRESETS["indigo"])[mode].copy()
            base["primary"] = primary
            base["accent"] = accent
            return base
        return PRESETS.get(preset, PRESETS["indigo"]).get(mode, PRESETS["indigo"]["light"])

    @api.model
    def get_preset_definitions(self):
        return PRESETS

    @api.model
    def get_enterprise_config(self):
        ICP = self.env["ir.config_parameter"].sudo()
        return {
            "density": ICP.get_param("theme_flavor_enterprise.density", "comfortable"),
            "zoom": int(ICP.get_param("theme_flavor_enterprise.zoom", "100")),
            "font_heading": ICP.get_param("theme_flavor_enterprise.font_heading", "Space Grotesk"),
            "font_body": ICP.get_param("theme_flavor_enterprise.font_body", "Manrope"),
            "loader_style": ICP.get_param("theme_flavor_enterprise.loader_style", "pulse"),
        }
