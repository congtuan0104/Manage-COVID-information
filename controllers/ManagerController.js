const { async } = require('@firebase/util');
const { addPatient } = require('../models/ManagerModel');
const db = require('../models/ManagerModel');
var jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { user } = require("pg/lib/defaults");
var jwtOptions = {};
const axios = require('axios'); 
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'mySecretKey';

class ManagerController {
    //[GET]/
    async home(req, res) {
        var day = new Date().getDate();
        var month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        const today = year + '-' + month + '-' + day;
        const startDay = year + '-' + month + '-' + (parseInt(day) - parseInt(13));
        const totalCases = await db.getTotalCases(today);
        const staOverTime = await db.getRangeStatistic(startDay, today, 'ASC');
        const staToday = await db.getStatistic(today);

        res.render("./Management/dashboard", {
            layout: "managementLayout",
            title: "Trang chủ",
            totalCases: totalCases,
            staToday: staToday,
            staOverTime: staOverTime,
            cssP: () => "style-supplies",
            scriptP: () => "chartScript",
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
        const listTreatmentPlace = await db.getListTreatmentPlace();
        var d = new Date(patientDetail.birthday);
        patientDetail.birthday = d.getUTCFullYear();

        res.render("./Management/patientDetail", {
            layout: "managementLayout",
            patient: patientDetail,
            title: 'Bệnh nhân',
            treatmentPlace: treatmentPlace,
            listTreatmentPlace: listTreatmentPlace,
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
        const username = identity_card;
        const birthday = req.body.birthday;
        const address = req.body.address;
        const status = req.body.status;
        var isExistPatient = await db.isExistPatient(username);
        if(isExistPatient){
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
                msg:"CMND đã tồn tại",
                color: "danger"
            });
            return;
        }
        let date = new Date();
        let day = date.getUTCDate();
        let month = date.getUTCMonth() + 1;
        let year = date.getUTCFullYear();
        let hour = date.getHours();
        let minutes = date.getUTCMinutes();
        let second = date.getUTCSeconds();
        const dateStr = `${year}-${month}-${day} ${hour}:${minutes}:${second}`;
        await db.addNewAccount(username,dateStr,0);
        await db.addPatient(patient_name, identity_card, birthday, address, status,username);
        let managerId = '234567891';
        let payload = { account_id: managerId };
        let token = jwt.sign(payload, jwtOptions.secretOrKey);
        axios.post('http://localhost:3003/addAccount', {
            account_id: username
            }, {
            headers: {
                'Authorization': 'Bearer  '+token
            }
            }).then(async function (response) {
                console.log(response.data);
            if(response.data.msg=='success'){
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
                    msg:"Thêm thành công",
                    color: "success"
                });
            }
            else{
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
                    msg:"Thêm thất bại",
                    color: "danger"
                });
            }
            })
            .catch(function (error) {
            console.log(error);
            });
    }

    //[POST]/addSupplies
    async addSupplies(req, res) {
        const imageList = req.files;
        const productName = req.body.productName;
        const price = req.body.price;
        const unit = req.body.unit;
        const suppliesID = await db.addSupplies(productName, price, unit);
        if (!suppliesID) {
            console.log("Thêm sản phẩm thất bại");
        }

        imageList.forEach(async image => {
            await db.uploadImage(suppliesID, image);
        });
        res.redirect("/manager/supplies");
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

        res.redirect("/manager/packages");
        return;
    }


    //[POST]/deletePackage
    async deletePackage(req, res) {
        const packageID = req.body.packageID;
        const result = await db.deletePackage(packageID);

        if (result == 0) {
            console.log("Xoá gói sản phẩm thất bại");
        }
        res.redirect("/manager/packages");
        return;
    }


    //[GET]/statistic
    async statistical(req, res) {

        var day = new Date().getDate();
        var month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        if (parseInt(day) < 10) day = '0' + day;
        if (parseInt(month) < 10) month = '0' + month;
        const today = year + '-' + month + '-' + day;
        day = parseInt(day) - parseInt(13);
        if (parseInt(day) < 10) day = '0' + day;
        const startDay = year + '-' + month + '-' + day;
        const staOverTime = await db.getRangeStatistic(startDay, today, 'ASC');

        res.render("./Management/statistical", {
            layout: "managementLayout",
            title: 'Thống kê',
            staOverTime: staOverTime,
            startDay: startDay,
            today: today,
            cssP: () => "style-supplies",
            scriptP: () => "statisticScript",
            footerP: () => "footer",
        });
        return;


    }

    //[GET]/searchStatistic  --> Xem chi tiết thống kê của một ngày
    async searchStatistic(req, res) {
        const date = req.query.d;
        const sta = await db.getStatistic(date);
        res.send(sta);
    }


    //[GET]/searchRange  --> Xem thống kê trong một khoảng thời gian
    async searchRange(req, res) {
        const start = req.query.start;
        const end = req.query.end;
        const sta = await db.getRangeStatistic(start, end, 'ASC');
        res.send(sta);
    }
}

module.exports = new ManagerController();
