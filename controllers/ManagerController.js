const db = require('../models/ManagerModel');

class ManagerController {
    //[GET]/
    async home(req, res) {
        const suppliesList = await db.list();
        console.table(suppliesList);
        res.render('./Management/supplies',{
            layout: 'managementLayout',
            title: 'Nhu yếu phẩm',
            sidebarP: () => 'managerSidebar',
            cssP:() => 'style-supplies',
            scriptP:() => 'script',
        });
    }
}

module.exports = new ManagerController;