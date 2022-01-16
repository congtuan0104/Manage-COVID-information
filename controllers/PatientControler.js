
const db = require("../models/PatientModel");
class PatientControler {
    //[GET]/
    async home(req, res, next) {
      const patientsList = await db.getRelatedPatients(1);
        res.render('home', {
            layout: 'userLayout',
            title: 'Trang chủ',
            navP: () => 'nav',
            sidebarP: () => 'patientSidebar',
            cssP: () => 'style',
            scriptP: () => 'script',
            footerP: () => 'footer',
        });
    }
    //[GET]/patients/:patientID
    async detailInfo(req, res) {
        const patientID = req.params.patientID;
        const patientDetail = await db.getPatientDetail(patientID);
        const treatmentPlace = await db.getTreatmentPlaceByID(patientDetail.place_id);
        const patientsRelatedList = await db.getRelatedPatients(patientID);
        
        var d = new Date(patientDetail.birthday);
        patientDetail.birthday = d.getUTCFullYear();

        if(patientsRelatedList!=null){
          patientsRelatedList.forEach(patient=>{
            var d = new Date(patient.birthday);
            patient.birthday = d.getUTCFullYear();
          })
        }
        res.render('Patient/patientDetailInfo', {
            layout: 'userLayout',
            title: 'Thông tin cá nhân',
            navP: () => 'nav',
            sidebarP: () => 'patientSidebar',
            cssP: () => 'style',
            scriptP: () => 'script',
            footerP: () => 'footer',
            patient: patientDetail,
            patients: patientsRelatedList,
            treatmentPlace: treatmentPlace,
        });
    }
    async payment(req, res, next) {
      const orderList = await db.getOrderListDetail(1);
      for(var i =0;i<orderList.length;i++){
        let supplies = await db.getOrderDetailByOrderId(orderList[i].order_id);
        console.log(supplies);
        orderList[i].supplies = supplies;
      };
        res.render('Patient/payment', {
            layout: 'userLayout',
            title: 'Lịch sử thanh toán',
            orders: orderList,
            navP: () => 'nav',
            sidebarP: () => 'patientSidebar',
            cssP: () => 'style',
            scriptP: () => 'script',
            footerP: () => 'footer',
        });
    }
    async manageHistory(req, res, next) {
      const history = await db.getListTreatmentHistoryById(1);
        res.render('Patient/manageHistory', {
            layout: 'userLayout',
            title: 'Lịch sử quản lí',
            history:history,
            navP: () => 'nav',
            sidebarP: () => 'patientSidebar',
            cssP: () => 'style',
            scriptP: () => 'script',
            footerP: () => 'footer',
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

    res.render("./Patient/packages", {
      layout: "userLayout",
      title: "Gói nhu yếu phẩm",
      packages: packageList,
      supplies: supplies,
      navP: () => 'nav',
      sidebarP: () => 'patientSidebar',
      cssP: () => 'style',
      scriptP: () => 'script',
      footerP: () => 'footer',
    });
  }
    changePassword(req, res, next) {
        res.render('.Patient/changePassword', {
            layout: 'userLayout',
            title: 'Trang chủ',
            navP: () => 'nav',
            sidebarP: () => 'patientSidebar',
            cssP: () => 'style',
            scriptP: () => 'script',
            footerP: () => 'footer',
        });
    }
    //[GET]/package/:packageID
  async packageDetail(req, res) {
    const packageID = req.params.packageID;
    const packageDetail = await db.getPackageDetail(packageID);
    const suppliesOfPackage = await db.getSuppliesOfPackage(packageID);
    const remainingPackage = await db.getRemainingPackage(packageID);
    var defaultPrice = 0;
    suppliesOfPackage.forEach(supply=>{
      let count = supply.quantity_limit;
      let price = supply.price;
      defaultPrice +=count*price;
    })
    res.render("./Patient/packageDetail", {
      layout: "userLayout",
      title: "Gói nhu yếu phẩm",
      package: packageDetail,
      supplies1: suppliesOfPackage,
      supplies2: remainingPackage,
      defaultPrice: defaultPrice,
      navP: () => 'nav',
            sidebarP: () => 'patientSidebar',
            cssP: () => 'style',
            scriptP: () => 'packageDetailScript',
            footerP: () => 'footer',
    });
  }
  async buyPackage(req, res) {
    const orders = await db.getOrderList(1);
    const order_id = orders.length;
    const packageID = req.params.packageID;
    const patientID = 1;
    let date = new Date(Date.now());
    let day  = date.getUTCDate();
    let month = date.getUTCMonth()+1;
    let year = date.getUTCFullYear();
    let hour = date.getHours();
    let minutes = date.getMinutes();
    let second = date.getSeconds();
    const dateStr = `${year}-${month}-${day} ${hour}:${minutes}:${second}`;
    const timeOrder = dateStr;
    const quantity = 1;
    const grandToltal = req.body.grandTotal;
    const status = 0;
    const nProduct = req.body.nProduct;
    
    const packageDetail = await db.getPackageDetail(packageID);
    switch(packageDetail.time_limit){
      case "d":{
        let listOrderById = await db.getOrderListByIdByDate(packageID);
        if(listOrderById.length>=packageDetail.package_limit+2){
          res.redirect("/user/payment");
          return;
        }
        break;
      }
      case "w":{
        let listOrderById = await db.getOrderListByIdByWeek(packageID);
        if(listOrderById.length>=packageDetail.package_limit){
          res.redirect("/user/payment");
          return;
        }
        break;
      }
      case "m":{
        let listOrderById = await db.getOrderListByIdByMonth(packageID);
        if(listOrderById.length>=packageDetail.package_limit){
          res.redirect("/user/payment");
          return;
        }
        break;
      }
    }
    
    const result = await db.addPackage(order_id,patientID,timeOrder,packageID,quantity,grandToltal,status);
    const newDate = `${year}-${month}-${day}`;
    var isPackageConsumtionExists = await db.isExistPackageConsumption(packageID,newDate);
    if(isPackageConsumtionExists){
      await db.updatePackageConsumption(packageID,newDate);
    }
    else{
      await db.addPackageConsumption(packageID,newDate);
    }
    const suppliesofPackage = await db.getSuppliesOfPackage(packageID);
    suppliesofPackage.forEach(async (supply,index) => {
      let res = await db.addOrderDetail(order_id,supply.supplies_id,nProduct[index],supply.price*nProduct[index]);
    
    });
    if (result == 0) {
      console.log("Thêm sản phẩm thất bại");
    }
    res.redirect("/user/payment");
    return;
  }
}

module.exports = new PatientControler;