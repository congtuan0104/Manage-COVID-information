const { async } = require("@firebase/util");
const { addPatient } = require("../models/ManagerModel");
const db = require("../models/ManagerModel");

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

    const result = await db.updatePatientInfor(
      patientID,
      patient_name,
      identity_card,
      birthday,
      address,
      statusAfterUpdate,
      place_id
    );
    if (result == 0) {
      console.log("Cập nhật thông tin thất bại");
    }
    res.redirect("/manager/patients");
    return;
  }

  //[POST]/addPatients
  async addPatient(req, res) {
    const patient_name = req.body.patient_name;
    const identity_card = req.body.identity_card;
    const birthday = req.body.birthday;
    const address = req.body.address;
    const status = req.body.status;
    const place_id = req.body.place_id;

    const relatedPatientID = req.body.relatedPatientID;

    await db.addPatient(
      patient_name,
      identity_card,
      birthday,
      address,
      status,
      place_id
    );

    await db.addAccount(identity_card);

    if(relatedPatientID != 0){
        const newPatient = await db.getPatientByIdentityCard(identity_card);
        await db.addRelatedPatient(relatedPatientID, newPatient.patient_id);
    }
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
    if (parseInt(day) < 10) day = "0" + day;
    if (parseInt(month) < 10) month = "0" + month;
    const today = year + "-" + month + "-" + day;
    day = parseInt(day) - parseInt(13);
    if (parseInt(day) < 10) day = "0" + day;
    const startDay = year + "-" + month + "-" + day;
    const staOverTime = await db.getRangeStatistic(startDay, today, "ASC");

    res.render("./Management/statistical", {
      layout: "managementLayout",
      title: "Thống kê",
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
    const sta = await db.getRangeStatistic(start, end, "ASC");
    res.send(sta);
  }
}

module.exports = new ManagerController();
