//const db = require('../models/dbOperations');

class SiteController {
    //[GET]/
    home(req, res, next) {
        res.render('home', {
            titlle: 'Trang chủ',
            navP: () => 'nav',
            sidebarP: () => 'managerSidebar',
            cssP: () => 'style',
            scriptP: () => 'script',
            footerP: () => 'footer',
        });
    }
}

module.exports = new SiteController;