const { async } = require('@firebase/util');
const { addPatient } = require('../models/ManagerModel');
const db = require('../models/ManagerModel');
const axios = require('axios');

class ManagerController {
    //[GET]/
    async home(req, res) {
        var day = new Date().getDate();
        var month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        const today = year + "-" + month + "-" + day;
        const startDay = year + "-" + month + "-" + (parseInt(day) - parseInt(13));
        const totalCases = await db.getTotalCases(today);
        const staOverTime = await db.getRangeStatistic(startDay, today, "ASC");
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
        const numberOfPage = await db.getNumberOfPage("supplies", 12);
        var pageList = [];
        if (numberOfPage <= 7) {
            for (var i = 1; i <= numberOfPage; i++) {
                pageList.push(i);
            }
        } else {
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
            suppliesList[i].img = await db.getSuppliesImg(
                suppliesList[i].supplies_id
            );
        }

        res.render("./Management/supplies", {
            layout: "managementLayout",
            title: "Nhu yếu phẩm",
            supplies: suppliesList,
            page: page,
            pageList: pageList,
            numberOfPage: numberOfPage,
            cssP: () => "style-supplies",
            scriptP: () => "script",
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
        const listTreatmentPlace = await db.getListTreatmentPlace();

        for (let i = 0; i < patientsList.length; i++) {
            var d = new Date(patientsList[i].birthday);
            patientsList[i].birthday = d.getUTCFullYear();
        }

        res.render("./Management/patients", {
            layout: "managementLayout",
            title: "Bệnh nhân",
            patients: patientsList,
            listTreatmentPlace: listTreatmentPlace,
            cssP: () => "style-supplies",
            scriptP: () => "script",
            footerP: () => "footer",
        });
    }

    //[GET]/patients/:patientID
    async patientDetail(req, res) {
        const patientID = req.params.patientID;
        const patientDetail = await db.getPatientDetail(patientID);

        const idRelatedPatients = await db.getIdRelatedPatient(patientID);
        let relatedPatients = [];
        for (let i = 0; i < idRelatedPatients.length; i++) {
            const temp = await db.getPatientDetail(idRelatedPatients[i]);
            relatedPatients.push(temp);
        }

        const treatmentPlace = await db.getTreatmentPlaceByID(
            patientDetail.place_id
        );
        const listTreatmentPlace = await db.getListTreatmentPlace();

        var d = new Date(patientDetail.birthday);
        patientDetail.birthday = d.getUTCFullYear();

        res.render("./Management/patientDetail", {
            layout: "managementLayout",
            title: "Bệnh nhân",
            patient: patientDetail,
            relatedPatients: relatedPatients,
            treatmentPlace: treatmentPlace,
            listTreatmentPlace: listTreatmentPlace,
            cssP: () => "style-supplies",
            scriptP: () => "script",
            footerP: () => "footer",
        });
    }

    //[GET]/patientsSortByName
    async patientsSortByName(req, res) {
        const patientsList = await db.getPatientList();
        const listTreatmentPlace = await db.getListTreatmentPlace();

        for (let i = 0; i < patientsList.length; i++) {
            var d = new Date(patientsList[i].birthday);
            patientsList[i].birthday = d.getUTCFullYear();
        }

        var i = 0,
            j;
        while (i < patientsList.length) {
            j = i + 1;
            while (j < patientsList.length) {
                if (patientsList[j].patient_name < patientsList[i].patient_name) {
                    var temp = patientsList[i];
                    patientsList[i] = patientsList[j];
                    patientsList[j] = temp;
                }

            }

            res.render("./Management/patients", {
                layout: "managementLayout",
                title: "Bệnh nhân",
                patients: patientsList,
                listTreatmentPlace: listTreatmentPlace,
                cssP: () => "style-supplies",
                scriptP: () => "script",
                scriptP: () => "script",
                footerP: () => "footer",
            });
        }
    }
    //[GET]/patientsSortByStatus
    async patientsSortByStatus(req, res) {
        const patientsList = await db.getPatientList();
        const listTreatmentPlace = await db.getListTreatmentPlace();

        for (let i = 0; i < patientsList.length; i++) {
            var d = new Date(patientsList[i].birthday);
            patientsList[i].birthday = d.getUTCFullYear();
        }

        var i = 0,
            j;
        while (i < patientsList.length) {
            j = i + 1;
            while (j < patientsList.length) {
                if (patientsList[j].status < patientsList[i].status) {
                    var temp = patientsList[i];
                    patientsList[i] = patientsList[j];
                    patientsList[j] = temp;
                }
                j++;
            }
            i++;
        }

        res.render("./Management/patients", {
            layout: "managementLayout",
            title: "Bệnh nhân",
            patients: patientsList,
            listTreatmentPlace: listTreatmentPlace,
            cssP: () => "style-supplies",
            scriptP: () => "script",
            scriptP: () => "script",
            footerP: () => "footer",
        });
    }

    //[POST]/updatePatientInfor
    async updatePatientInfor(req, res) {
        const patientID = req.body.patientID;
        console.log("patientID: ", patientID);
        const patient_name = req.body.patient_name;
        const identity_card = req.body.identity_card;
        let birthday = req.body.birthday;
        birthday += "-05-05";
        const address = req.body.address;
        const statusAfterUpdate = req.body.status; // status afterUpdate
        const treatment_place = await db.getTreatmentPlaceByName(
            req.body.treatment_place_name
        );
        const place_id = req.body.new_place_id;

        const patientBeforeUpdate = await db.getPatientDetail(patientID);
        const statusBeforeUpdate = patientBeforeUpdate.status;
        const idRelatedPatients = await db.getIdRelatedPatient(patientID);
        let relatedPatients = [];
        for (let i = 0; i < idRelatedPatients.length; i++) {
            const temp = await db.getPatientDetail(idRelatedPatients[i]);
            relatedPatients.push(temp);
        }

        for (let i = 0; i < relatedPatients.length; i++) {
            if (relatedPatients[i].status > statusBeforeUpdate) {
                const incre = statusBeforeUpdate - statusAfterUpdate;
                await db.updatePatientStatus(
                    relatedPatients[i].patient_id,
                    relatedPatients[i].status - incre
                );
            }
        }
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
        if (isExistPatient) {
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
                msg: "CMND đã tồn tại",
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
        await db.addNewAccount(username, dateStr, 0);
        await db.addPatient(patient_name, identity_card, birthday, address, status, username);
        axios.post('http://localhost:3003/addAccount', {
            account_id: username
        }).then(async function (response) {
            if (response.data.msg == 'success') {
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
                    msg: "Thêm thành công",
                    color: "success"
                });
            }
            else {
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
                    msg: "Thêm thất bại",
                    color: "danger"
                });
            }
        })
            .catch(function (error) {
                console.log(error);
            });

        res.redirect("/manager/patients");
        return;

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

        imageList.forEach(async (image) => {
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
        const packageName = req.body.packageName;
        const limit = req.body.limit;
        const limitTime = req.body.limitTime;
        const suppliesList = req.body.suppliesID;
        const quantityLimit = req.body.nProduct;
        if (suppliesList.length < 2) {
            res.send("Gói sản phẩm cần có ít nhất 2 sản phẩm");
            return;
        }
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
        const packageList = await db.getPackageList(1);
        const suppliesList = await db.getSuppliesList(1);
        const suppliesConsume = await db.getSuppliesConsume(startDay, today, suppliesList[0].supplies_id);
        const packageConsume = await db.getPackageConsume(startDay, today, packageList[0].package_id);

        res.render("./Management/statistical", {
            layout: "managementLayout",
            title: 'Thống kê',
            staOverTime: staOverTime,
            startDay: startDay,
            today: today,
            supplies: suppliesList,
            package: packageList,
            packageConsume: packageConsume,
            suppliesConsume: suppliesConsume,
            cssP: () => "style-supplies",
            scriptP: () => "statisticScript",
            footerP: () => "footer",
        });
        return;


    }

    //[POST]/deletePackage
    async deletePackage(req, res) {
        const packageID = req.body.packageID;
        const result = await db.deletePackage(packageID);

        if (result == 0) {
            console.log("Xoá gói sản phẩm thất bại");
        }
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



    //[GET]/packageConsume  --> Xem thống kê trong một khoảng thời gian
    async packageConsume(req, res) {
            const start = req.query.start;
            const end = req.query.end;
            const packageID = req.query.packageID;
            const sta = await db.getPackageConsume(start, end, packageID);
            res.send(sta);
        }


    //[GET]/suppliesConsume  --> Xem thống kê trong một khoảng thời gian
    async suppliesConsume(req, res) {
            const start = req.query.start;
            const end = req.query.end;
            const suppliesID = req.query.suppliesID;
            const sta = await db.getSuppliesConsume(start, end, suppliesID);
            res.send(sta);
        }


    //[GET]/search 
    async search(req, res) {
            const q = req.query.q;
            const type = req.query.type;
            if (type == 1) {
                const patientList = await db.getPatient(q);

                res.render("./Management/patients", {
                    layout: "managementLayout",
                    title: "Bệnh nhân",
                    patients: patientList,
                    cssP: () => "style-supplies",
                    scriptP: () => "script",
                    scriptP: () => "script",
                    footerP: () => "footer",
                });
                return;
            }

            if (type == 2) {
                const suppliesList = await db.getSupplies(q);

                if (suppliesList) {
                    for (var i = 0; i < suppliesList.length; i++) {
                        suppliesList[i].img = await db.getSuppliesImg(suppliesList[i].supplies_id);
                    }
                }

                res.render('./Management/supplies', {
                    layout: 'managementLayout',
                    title: 'Nhu yếu phẩm',
                    supplies: suppliesList,
                    cssP: () => 'style-supplies',
                    scriptP: () => 'script',
                });
                return;
            }

            if (type == 3) {
                const packageList = await db.getPackage(q);
                const supplies = await db.getAllSupplies();
                if (packageList) {
                    packageList.forEach((element) => {
                        if (element.time_limit == "d") element.time_limit = "ngày";
                        if (element.time_limit == "w") element.time_limit = "tuần";
                        if (element.time_limit == "m") element.time_limit = "tháng";
                    });
                }
                res.render("./Management/packages", {
                    layout: "managementLayout",
                    title: "Gói nhu yếu phẩm",
                    packages: packageList,
                    supplies: supplies,
                    cssP: () => "style-supplies",
                    scriptP: () => "script",
                });
                return;
            }

        }


    //[GET]/sort
    async sort(req, res) {
            const list = req.query.list;
            const sortBy = req.query.sortBy;
            const sortOption = req.query.sortOption;
            if (list == 'supplies') {
                const suppliesList = await db.getSuppliesSorted(sortBy, sortOption);
                for (var i = 0; i < suppliesList.length; i++) {
                    suppliesList[i].img = await db.getSuppliesImg(suppliesList[i].supplies_id);
                }
                res.send(suppliesList);
                return;
            }

            if (list == 'package') {
                const packageList = await db.getPackageSorted(sortBy, sortOption);
                res.send(packageList);
                return;
            }

        }


    //[GET]/suppliesFilter
    async suppliesFilter(req, res) {
            const min = req.query.min;
            const max = req.query.max;
            const suppliesList = await db.suppliesFilter(min, max);
            for (var i = 0; i < suppliesList.length; i++) {
                suppliesList[i].img = await db.getSuppliesImg(suppliesList[i].supplies_id);
            }
            res.send(suppliesList);

        }


    //[GET]/packageFilter
    async packageFilter(req, res) {
            const time = req.query.time;
            const packageList = await db.packageFilter(time);
            res.send(packageList);
        }
    }

module.exports = new ManagerController();
