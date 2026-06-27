from odoo import fields, models


class ResCompany(models.Model):
    _name = 'res.company'
    _inherit = ['res.company']

    tfe_login_bg = fields.Binary(
        string="Login Background Image",
        attachment=True,
    )
