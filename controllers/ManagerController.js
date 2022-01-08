const db = require('../models/ManagerModel');

class ManagerController {
    //[GET]/
    async home(req, res) {
        res.render('./Management/dashboard', {
            layout: 'managementLayout',
            title: 'Trang chủ',
            cssP: () => 'style-supplies',
            scriptP: () => 'script',
        });
    }

    //[GET]/supplies
    async supplies(req, res) {
        const page = parseInt(req.query.page) || 1;
        const suppliesList = await db.getSuppliesList(page);
        const numberOfPage = await db.getNumberOfPage('supplies', 12);
        var pageList = [];
        if (numberOfPage <= 7) {           
            for (var i = 1; i <= numberOfPage; i++) {
                pageList.push(i);
            }
        }
        else {
            for (var i = page; i <= page + 3; i++) {
                pageList.push(i);
            }
            pageList.push('...');
            for (var i = numberOfPage - 3; i <= numberOfPage; i++) {
                pageList.push(i);
            }
        }

        res.render('./Management/supplies', {
            layout: 'managementLayout',
            title: 'Nhu yếu phẩm',
            supplies: suppliesList,
            page: page,
            pageList: pageList,
            numberOfPage: numberOfPage,
            cssP: () => 'style-supplies',
            scriptP: () => 'script',
        });
    }

    //[GET]/package
    async packages(req, res) {
        const page = parseInt(req.query.page) || 1;
        const packageList = await db.getPackageList(page);
        const numberOfPage = await db.getNumberOfPage('package', 12);
        packageList.forEach(element => {
            if (element.time_limit == 'd') element.time_limit = 'ngày';
            if (element.time_limit == 'w') element.time_limit = 'tuần';
            if (element.time_limit == 'm') element.time_limit = 'tháng';
        });
        var pageList = [];
        if (numberOfPage <= 7) {
            for (var i = 1; i <= numberOfPage; i++) {
                pageList.push(i);
            }
        }


        res.render('./Management/packages', {
            layout: 'managementLayout',
            title: 'Gói nhu yếu phẩm',
            packages: packageList,
            cssP: () => 'style-supplies',
            scriptP: () => 'script',
        });
    }


    //[POST]/addSupplies
    async addSupplies(req, res) {
        const productName = req.body.productName;
        const price = req.body.price;
        const unit = req.body.unit;
        const result = await db.addSupplies(productName, price, unit);
        if (result == 0) {
            console.log('Thêm sản phẩm thất bại');
        }
        res.redirect('/manager/supplies');
        return;
    }

    //[POST]/updateSupplies
    async updateSupplies(req, res) {
        const suppliesID = req.body.suppliesID;
        const suppliesName = req.body.suppliesName;
        const price = req.body.price;
        const unit = req.body.unit;
        const result = await db.updateSupplies(suppliesID, suppliesName, price, unit);
        if (result == 0) {
            console.log('Cập nhật thông tin thất bại');
        }
        res.redirect('/manager/supplies');
        return;
    }

    //[POST]/deleteSupplies
    async deleteSupplies(req, res) {
        const suppliesID = req.body.suppliesID;
        const result = await db.deleteSupplies(suppliesID);

        if (result == 0) {
            console.log('Xoá sản phẩm thất bại');
        }
        res.redirect('/manager/supplies');
        return;
    }
}

module.exports = new ManagerController;