const { async } = require('@firebase/util');
const { addPatient } = require('../models/ManagerModel');
const db = require('../models/ManagerModel');

class ManagerController {
    //[GET]/
    async home(req, res) {
        res.render("./Management/dashboard", {
            layout: "managementLayout",
            title: "Trang chủ",
            cssP: () => "style-supplies",
            scriptP: () => "script",
        });
    }


    //[GET]/supplies
    async supplies(req, res) {
        const page = parseInt(req.query.page) || 1;
        var suppliesList = await db.getSuppliesList(page);
        const numberOfPage = await db.getNumberOfPage('supplies', 12);
        var pageList = [];
        if (numberOfPage <= 7) {
            for (var i = 1; i <= numberOfPage; i++) {
                pageList.push(i);
            }
        }
        else {

            for (var i = page - 3; i < page; i++) {
                if (i < 1) continue;
                pageList.push(i);
            }

            for (var i = page; i <= page + 3; i++) {
                if (i > numberOfPage) continue;
                pageList.push(i);
            }
        }


        for (var i = 0; i < suppliesList.length; i++) {
            suppliesList[i].img = await db.getSuppliesImg(suppliesList[i].supplies_id);
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
        const numberOfPage = await db.getNumberOfPage("package", 12);
        const supplies = await db.getAllSupplies();
        packageList.forEach((element) => {
            if (element.time_limit == "d") element.time_limit = "ngày";
            if (element.time_limit == "w") element.time_limit = "tuần";
            if (element.time_limit == "m") element.time_limit = "tháng";
        });
        var pageList = [];
        if (numberOfPage <= 7) {
            for (var i = 1; i <= numberOfPage; i++) {
                pageList.push(i);
            }
        }

        res.render("./Management/packages", {
            layout: "managementLayout",
            title: "Gói nhu yếu phẩm",
            packages: packageList,
            supplies: supplies,
            cssP: () => "style-supplies",
            scriptP: () => "script",
        });
    }

    //[GET]/package/:packageID
    async packageDetail(req, res) {
        const packageID = req.params.packageID;
        const packageDetail = await db.getPackageDetail(packageID);
        const suppliesOfPackage = await db.getSuppliesOfPackage(packageID);
        const remainingPackage = await db.getRemainingPackage(packageID);

        res.render("./Management/packageDetail", {
            layout: "managementLayout",
            title: "Gói nhu yếu phẩm",
            package: packageDetail,
            supplies1: suppliesOfPackage,
            supplies2: remainingPackage,
            cssP: () => "style-supplies",
            scriptP: () => "script",
        });
    }

    //[GET]/patients
    async patients(req, res, next) {
        const patientsList = await db.getPatientList();

        for (let i = 0; i < patientsList.length; i++) {
            var d = new Date(patientsList[i].birthday);
            patientsList[i].birthday = d.getUTCFullYear();
        }

        res.render("./Management/patients", {
            layout: "managementLayout",
            title: "Bệnh nhân",
            patients: patientsList,
            cssP: () => "style-supplies",
            scriptP: () => "script",
            scriptP: () => "script",
            footerP: () => "footer",
        });
    }

    //[GET]/patients/:patientID
    async patientDetail(req, res) {
        const patientID = req.params.patientID;
        const patientDetail = await db.getPatientDetail(patientID);
        const treatmentPlace = await db.getTreatmentPlaceByID(patientDetail.place_id);

        var d = new Date(patientDetail.birthday);
        patientDetail.birthday = d.getUTCFullYear();

        res.render("./Management/patientDetail", {
            layout: "managementLayout",
            patient: patientDetail,
            treatmentPlace: treatmentPlace,
            cssP: () => "style-supplies",
            scriptP: () => "script",
            scriptP: () => "script",
            footerP: () => "footer",
        });
    }
    //[POST]/addPatients
    async addPatient(req, res) {
        const patient_name = req.body.patient_name;
        const identity_card = req.body.identity_card;
        const birthday = req.body.birthday;
        const address = req.body.address;
        const status = req.body.status;
        await db.addPatient(patient_name, identity_card, birthday, address, status);
        res.redirect("/manager/patients");
    }

    //[POST]/addSupplies
    async addSupplies(req, res) {
        const productName = req.body.productName;
        const price = req.body.price;
        const unit = req.body.unit;
        const result = await db.addSupplies(productName, price, unit);
        if (result == 0) {
            console.log("Thêm sản phẩm thất bại");
        }
    res.redirect("/manager/supplies");
    return;
  }

  //[POST]/updateSupplies
  async updateSupplies(req, res) {
    const suppliesID = req.body.suppliesID;
    const suppliesName = req.body.suppliesName;
    const price = req.body.price;
    const unit = req.body.unit;
    const result = await db.updateSupplies(
      suppliesID,
      suppliesName,
      price,
      unit
    );
    if (result == 0) {
      console.log("Cập nhật thông tin thất bại");
        }
        res.redirect("/manager/supplies");
        return;
    }

  //[POST]/deleteSupplies
  async deleteSupplies(req, res) {
    const suppliesID = req.body.suppliesID;
    const result = await db.deleteSupplies(suppliesID);

    if (result == 0) {
      console.log("Xoá sản phẩm thất bại");
    }
    res.redirect("/manager/supplies");
    return;
}

  //[POST]/addPackage
  async addPackage(req, res) {
    console.log(req.body);
    const packageName = req.body.packageName;
    const limit = req.body.limit;
    const limitTime = req.body.limitTime;
    const suppliesList = req.body.suppliesID;
    const quantityLimit = req.body.nProduct;
    if (suppliesList.length < 2) {
        res.send("Gói sản phẩm cần có ít nhất 2 sản phẩm");
        return;
    }

    const packageID = await db.addPackage(packageName, limit, limitTime);
    if (packageID == null) {
        res.send("Thêm sản phẩm thất bại");
        return;
    }

    var result;
    for (var i = 0; i < suppliesList.length; i++) {
      result = await db.addPackageDetail(
        packageID,
        suppliesList[i],
        quantityLimit[i]
      );
    }

    res.redirect("/manager/dashboard");
    return;
}
}

module.exports = new ManagerController();
