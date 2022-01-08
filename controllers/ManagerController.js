const db = require('../models/ManagerModel');

class ManagerController {
    //[GET]/
    async home(req, res) {
        res.render('./Management/dashboard',{
            layout: 'managementLayout',
            title: 'Trang chủ',
            cssP:() => 'style-supplies',
            scriptP:() => 'script',
        });
    }

    //[GET]/supplies
    async supplies(req, res) {
        const suppliesList = await db.getSuppliesList();
        res.render('./Management/supplies',{
            layout: 'managementLayout',
            title: 'Nhu yếu phẩm',
            supplies: suppliesList,
            cssP:() => 'style-supplies',
            scriptP:() => 'script',
        });
    }

    //[GET]/supplies
    async packages(req, res) {
        const packageList = await db.getPackageList();
        res.render('./Management/packages',{
            layout: 'managementLayout',
            title: 'Gói nhu yếu phẩm',
            packages: packageList,
            cssP:() => 'style-supplies',
            scriptP:() => 'script',
        });
    }


    //[POST]/addSupplies
    async addSupplies(req, res) {
        const productName = req.body.productName;
        const price = req.body.price;
        const unit = req.body.unit;
        const product = await db.addSupplies(productName,price,unit);
        if(product == 0){
            console.log('Thêm sản phẩm thất bại');
        }
        res.redirect('/manager/supplies');
        return;
    }

    //[POST]/updateSupplies
    async updateSupplies(req, res) {
        const productID = req.body.productID;
        const productName = req.body.productName;
        const price = req.body.price;
        const unit = req.body.unit;
        const product = await db.updateSupplies(productID,productName,price,unit);
        if(product == 0){
            console.log('Cập nhật thông tin thất bại');
        }
        res.redirect('/manager/supplies');
        return;
    }
}

module.exports = new ManagerController;