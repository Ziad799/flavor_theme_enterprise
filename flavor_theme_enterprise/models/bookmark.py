from odoo import api, fields, models


class ThemeFlavorBookmark(models.Model):
    _name = 'theme.flavor.bookmark'
    _description = 'Sidebar Bookmark'
    _order = 'sequence, id'

    user_id = fields.Many2one(
        'res.users',
        string='User',
        default=lambda self: self.env.uid,
        required=True,
        ondelete='cascade',
        index=True,
    )
    menu_id = fields.Many2one(
        'ir.ui.menu',
        string='Menu',
        required=True,
        ondelete='cascade',
    )
    menu_name = fields.Char(related='menu_id.name', string='Name', store=True)
    sequence = fields.Integer(default=10)

    _sql_constraints = [
        ('user_menu_uniq', 'unique(user_id, menu_id)', 'This menu is already bookmarked.'),
    ]

    @api.model
    def get_user_bookmarks(self):
        bookmarks = self.search([('user_id', '=', self.env.uid)], order='sequence, id')
        return [{
            'id': bm.id,
            'menu_id': bm.menu_id.id,
            'name': bm.menu_id.name,
            'sequence': bm.sequence,
        } for bm in bookmarks]

    @api.model
    def add_bookmark(self, menu_id):
        existing = self.search([('user_id', '=', self.env.uid), ('menu_id', '=', menu_id)])
        if existing:
            return existing[0].id
        max_seq = self.search([('user_id', '=', self.env.uid)], order='sequence desc', limit=1)
        seq = (max_seq.sequence + 10) if max_seq else 10
        return self.create({'menu_id': menu_id, 'sequence': seq}).id

    @api.model
    def remove_bookmark(self, bookmark_id):
        bm = self.browse(bookmark_id)
        if bm.exists() and bm.user_id.id == self.env.uid:
            bm.unlink()
            return True
        return False
