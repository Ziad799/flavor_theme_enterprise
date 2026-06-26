from odoo import fields, models


class ResUsers(models.Model):
    _name = 'res.users'
    _inherit = ['res.users']

    tfe_dark_mode = fields.Boolean(
        string="Dark Mode",
        default=False,
    )
    tfe_sidebar_collapsed = fields.Boolean(
        string="Sidebar Collapsed",
        default=False,
    )
