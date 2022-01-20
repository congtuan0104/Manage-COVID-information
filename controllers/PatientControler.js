
const { restart } = require("nodemon");
const db = require("../models/PatientModel");
const bcrypt = require('bcrypt');
const saltRounds = 10;
var jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { user } = require("pg/lib/defaults");
var jwtOptions = {};
const axios = require('axios'); 

jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'mySecretKey';
class PatientControler {
  //[GET]/
  async home(req, res, next) {
    res.redirect('/user/detailInfo');
  }
  //[GET]/patients/:patientID
  async detailInfo(req, res) {
    if (req.session.patient) {
      
      const patientID = req.session.patient.patient_id;
      const notification = await db.getNotification(patientID);
      const patientDetail = await db.getPatientDetail(patientID);
      var treatmentPlace = treatmentPlace = await db.getTreatmentPlaceByID(patientDetail.place_id);

      const patientsRelatedList = await db.getRelatedPatients(patientID);

      var d = new Date(patientDetail.birthday);
      patientDetail.birthday = d.getUTCFullYear();

      if (patientsRelatedList != null) {
        patientsRelatedList.forEach(patient => {
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
        notification:notification,
        patient: patientDetail,
        patients: patientsRelatedList,
        treatmentPlace: treatmentPlace,
      });
      return;
    }
    res.redirect('/signin');
  }
  async payment(req, res, next) {
    if(!req.session.patient){
      res.redirect('/signin');
      return;
    }
    const notification = await db.getNotification(req.session.patient.patient_id);
    const orderList = await db.getOrderListDetail(req.session.patient.patient_id);
    let paymentInfo = await db.getPaymentInfomation();
    const payLimitPertime = paymentInfo.payment_limit;
    var totalGrand = 0;
    for (var i = 0; i < orderList.length; i++) {
      
      let supplies = await db.getOrderDetailByOrderId(orderList[i].order_id);
      orderList[i].supplies = supplies;
      
      if(orderList[i].order_status == 0){
        totalGrand += orderList[i].grand_total;
      }
    };
    res.render('Patient/payment', {
      layout: 'userLayout',
      title: 'Lịch sử thanh toán',
      orders: orderList,
      payLimitPertime:payLimitPertime,
      patient: req.session.patient,
      totalGrand: totalGrand,
      notification,notification,
      navP: () => 'nav',
      sidebarP: () => 'patientSidebar',
      cssP: () => 'style',
      scriptP: () => 'paymentScript',
      footerP: () => 'footer',
    });
  }
  async manageHistory(req, res, next) {
    if(!req.session.patient){
      res.redirect('/signin');
      return;
    }
    const notification = await db.getNotification(req.session.patient.patient_id);
    const history = await db.getListTreatmentHistoryById(req.session.patient.patient_id);
    res.render('Patient/manageHistory', {
      layout: 'userLayout',
      title: 'Lịch sử quản lí',
      history: history,
      patient: req.session.patient,
      notification:notification,
      navP: () => 'nav',
      sidebarP: () => 'patientSidebar',
      cssP: () => 'style',
      scriptP: () => 'script',
      footerP: () => 'footer',
    });
  }
  //[GET]/package
  async packages(req, res) {
    if(!req.session.patient){
      res.redirect('/signin');
      return;
    }
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
    const notification = await db.getNotification(req.session.patient.patient_id);
    res.render("./Patient/packages", {
      layout: "userLayout",
      title: "Gói nhu yếu phẩm",
      packages: packageList,
      supplies: supplies,
      patient: req.session.patient,
      notification,notification,
      navP: () => 'nav',
      sidebarP: () => 'patientSidebar',
      cssP: () => 'style',
      scriptP: () => 'script',
      footerP: () => 'footer',
    });
  }
  async getchangePassword(req, res, next) {
    if(!req.session.patient){
      res.redirect('/signin');
      return;
    }
    const notification = await db.getNotification(req.session.patient.patient_id);
    res.render('Patient/changePassword', {
      layout: 'userLayout',
      title: 'Trang chủ',
      patient: req.session.patient,
      notification:notification,
      navP: () => 'nav',
      sidebarP: () => 'patientSidebar',
      cssP: () => 'style',
      scriptP: () => 'script',
      footerP: () => 'footer',
    });
  }
  async postChangePassword(req,res,next){
    if(!req.session.patient){
      res.redirect('/signin');
      return;
    }
    var username = req.session.patient.username;
    var userAccount = await db.getUserAccount(username);
    var currentPass = req.body.currentPassword;
    var newPass = req.body.newPassword;
    var retypePass = req.body.retypeNewPassword;
    const challengeResult = await bcrypt.compare(currentPass, userAccount.password);
    const notification = await db.getNotification(req.session.patient.patient_id);
    if(!challengeResult){
      res.render('Patient/changePassword', {
        layout: 'userLayout',
        title: 'Trang chủ',
        patient: req.session.patient,
        notification:notification,
        navP: () => 'nav',
        sidebarP: () => 'patientSidebar',
        cssP: () => 'style',
        scriptP: () => 'script',
        footerP: () => 'footer',
        msg:"Wrong Password",
        color: "danger"
      });
    }
    else if(newPass !==retypePass){
      res.render('Patient/changePassword', {
        layout: 'userLayout',
        title: 'Trang chủ',
        patient: req.session.patient,
        notification:notification,
        navP: () => 'nav',
        sidebarP: () => 'patientSidebar',
        cssP: () => 'style',
        scriptP: () => 'script',
        footerP: () => 'footer',
        msg:"Wrong Retype Password",
        color: "danger"
      });
    }
    else{
      const newPassHashed = await bcrypt.hash(newPass, saltRounds);
      var result = await db.changePassword(username,newPassHashed);
      res.render('Patient/changePassword', {
        layout: 'userLayout',
        title: 'Trang chủ',
        patient: req.session.patient,
        notification:notification,
        navP: () => 'nav',
        sidebarP: () => 'patientSidebar',
        cssP: () => 'style',
        scriptP: () => 'script',
        footerP: () => 'footer',
        msg:"Change Password Success",
        color: "success"
      });
    }
    
  }
  //[GET]/package/:packageID
  async packageDetail(req, res) {
    if(!req.session.patient){
      res.redirect('/signin');
      return;
    }
    const packageID = req.params.packageID;
    const packageDetail = await db.getPackageDetail(packageID);
    const suppliesOfPackage = await db.getSuppliesOfPackage(packageID);
    const remainingPackage = await db.getRemainingPackage(packageID);
    var defaultPrice = 0;
    for (var i = 0; i < suppliesOfPackage.length; i++) {
      suppliesOfPackage[i].img = await db.getSuppliesImg(suppliesOfPackage[i].supplies_id);
    }
    suppliesOfPackage.forEach(supply => {
      let count = supply.quantity_limit;
      let price = supply.price;
      defaultPrice += count * price;
    })
    const notification = await db.getNotification(req.session.patient.patient_id);
    res.render("./Patient/packageDetail", {
      layout: "userLayout",
      title: "Gói nhu yếu phẩm",
      package: packageDetail,
      supplies1: suppliesOfPackage,
      patient: req.session.patient,
      supplies2: remainingPackage,
      defaultPrice: defaultPrice,
      notification:notification,
      navP: () => 'nav',
      sidebarP: () => 'patientSidebar',
      cssP: () => 'style',
      scriptP: () => 'packageDetailScript',
      footerP: () => 'footer',
    });
  }
  async getAccessToken(req,res){
    if(!req.session.patient){
      res.json({msg:"No Singin"});
    }
    else{
      let payload = { account_id: req.session.patient.username };
      let token = jwt.sign(payload, jwtOptions.secretOrKey);
      res.json({ msg: 'sucess', token: token });
    }
  }
  async callAddPaymentAPI(req,res){
    if(!req.session.patient){
      res.redirect('/signin');
      return;
    }
    let paymentInfo = await db.getPaymentInfomation();
    const payLimitPertime = paymentInfo.payment_limit;
    
    let payload = { account_id: req.session.patient.username };
    let token = jwt.sign(payload, jwtOptions.secretOrKey);
    let totalPayment = req.body.totalPayment;
    let checkedOrder = req.body.checkedOrder;
    for(var i=0;i<checkedOrder.length;i++){
      var order = await db.getOrderById(checkedOrder[i]);
      if(order.status){
        res.redirect('/user/payment');
        return;
      }
    }
    
    var balance = 0;
    const notification = await db.getNotification(req.session.patient.patient_id);
    axios.get('http://localhost:3003/balance', {
      params: {
        account_id: req.session.patient.username
      },
      headers: {
        'Authorization': 'Bearer  '+token
      }
    }).then( async function (response) {
      balance = response.data.balance;
      var orderList = await db.getOrderListDetail(req.session.patient.patient_id);
    if(balance<totalPayment){
      console.log(balance);
      res.render('Patient/payment', {
        layout: 'userLayout',
        title: 'Lịch sử thanh toán',
        orders: orderList,
        payLimitPertime:payLimitPertime,
        patient: req.session.patient,
        totalGrand: totalPayment,
        notification:notification,
        navP: () => 'nav',
        sidebarP: () => 'patientSidebar',
        cssP: () => 'style',
        scriptP: () => 'paymentScript',
        footerP: () => 'footer',
        msg:'Số dư trong tài khoản không đủ hay nạp thêm',
        color:'danger'
      });
      return;
  }
   
    let receive_id =paymentInfo.main_account;
    axios.post('http://localhost:3003/addPayment', {
      transfer_id: req.session.patient.username,
      receive_id: receive_id,
      totalPayment:totalPayment
    }, {
      headers: {
        'Authorization': 'Bearer  '+token
      }
    }).then(async function (response) {
     if(response.data.msg=='success'){
      for(var i=0;i<checkedOrder.length;i++){
        await db.setOrderStatus(checkedOrder[i]);
      }
      var date = new Date();
      let day = date.getUTCDate();
      let month = date.getUTCMonth() + 1;
      let year = date.getUTCFullYear();
      let hour = date.getHours();
      let minutes = date.getUTCMinutes();
      let second = date.getUTCSeconds();
      const dateStr = `${year}-${month}-${day} ${hour}:${minutes}:${second}`;
      await db.addNotification(req.session.patient.patient_id,dateStr,"Thanh toán thành công");
      orderList = await db.getOrderListDetail(req.session.patient.patient_id);
      res.render('Patient/payment', {
        layout: 'userLayout',
        title: 'Lịch sử thanh toán',
        orders: orderList,
        payLimitPertime:payLimitPertime,
        patient: req.session.patient,
        totalGrand: totalPayment,
        notification:notification,
        navP: () => 'nav',
        sidebarP: () => 'patientSidebar',
        cssP: () => 'style',
        scriptP: () => 'paymentScript',
        footerP: () => 'footer',
        msg:"Thanh toán thành công",
        color:'success'
      });
     }
     else{
      res.render('Patient/payment', {
        layout: 'userLayout',
        title: 'Lịch sử thanh toán',
        orders: orderList,
        payLimitPertime:payLimitPertime,
        patient: req.session.patient,
        totalGrand: totalPayment,
        balance:balance,
        notification:notification,
        navP: () => 'nav',
        sidebarP: () => 'patientSidebar',
        cssP: () => 'style',
        scriptP: () => 'paymentScript',
        footerP: () => 'footer',
        msg:'Thanh toán thất bái',
        color:'danger'
      });
     }
    })
    .catch(function (error) {
      console.log(error);
    });
    })
    .catch(function (error) {
      console.log(error);
    });
    
  }
  async buyPackage(req, res) {
    if (req.session.patient) {
      const notification = await db.getNotification(req.session.patient.patient_id);
      const packageID = req.params.packageID;
      const patientID = req.session.patient.patient_id;
      let date = new Date();
      let day = date.getUTCDate();
      let month = date.getUTCMonth() + 1;
      let year = date.getUTCFullYear();
      let hour = date.getHours();
      let minutes = date.getUTCMinutes();
      let second = date.getUTCSeconds();
      const dateStr = `${year}-${month}-${day} ${hour}:${minutes}:${second}`;
      const timeOrder = dateStr;
      const quantity = 1;
      const grandToltal = req.body.grandTotal;
      const status = 0;
      const nProduct = req.body.nProduct;

      const packageDetail = await db.getPackageDetail(packageID);
      var isOverLimit = false;
      var msg = "";
      switch (packageDetail.time_limit) {
        case "d": {
          let listOrderById = await db.getOrderListByIdByDate(packageID,patientID);
          if (listOrderById) {
            if (listOrderById.length >= packageDetail.package_limit) {
              //isOverLimit = true;
              //msg = "Đã quá giới hạn mua trong ngày";
            }
          }
          break;
        }
        case "w": {
          let listOrderById = await db.getOrderListByIdByWeek(packageID,patientID);
          if (listOrderById) {
            if (listOrderById.length >= packageDetail.package_limit) {
              isOverLimit = true;
              msg = "Đã quá giới hạn mua trong tuần";
            }

          }
          break;
        }
        case "m": {
          let listOrderById = await db.getOrderListByIdByMonth(packageID,patientID);
          if (listOrderById) {
            if (listOrderById.length >= packageDetail.package_limit) {
              isOverLimit = true;
              msg = "Đã quá giới hạn mua trong tháng";
            }

          }
          break;
        }
      }
      if(isOverLimit){
          const packageDetail = await db.getPackageDetail(packageID);
          const suppliesOfPackage = await db.getSuppliesOfPackage(packageID);
          const remainingPackage = await db.getRemainingPackage(packageID);
          var defaultPrice = 0;
          for (var i = 0; i < suppliesOfPackage.length; i++) {
            suppliesOfPackage[i].img = await db.getSuppliesImg(suppliesOfPackage[i].supplies_id);
          }
          suppliesOfPackage.forEach(supply => {
            let count = supply.quantity_limit;
            let price = supply.price;
            defaultPrice += count * price;
          })
          res.render("./Patient/packageDetail", {
            layout: "userLayout",
            title: "Gói nhu yếu phẩm",
            package: packageDetail,
            supplies1: suppliesOfPackage,
            patient: req.session.patient,
            supplies2: remainingPackage,
            defaultPrice: defaultPrice,
            notification:notification,
            navP: () => 'nav',
            sidebarP: () => 'patientSidebar',
            cssP: () => 'style',
            scriptP: () => 'packageDetailScript',
            footerP: () => 'footer',
            msg:msg
          });
          return;
      }
      const orderID = await db.addPackage(patientID, timeOrder, packageID, quantity, grandToltal, status);
      
      const newDate = `${year}-${month}-${day}`;
      var isPackageConsumtionExists = await db.isExistPackageConsumption(packageID, newDate);
      if (isPackageConsumtionExists) {
        await db.updatePackageConsumption(packageID, newDate);
      }
      else {
        await db.addPackageConsumption(packageID, newDate);
      }
      const suppliesofPackage = await db.getSuppliesOfPackage(packageID);
      suppliesofPackage.forEach(async (supply, index) => {
        if(nProduct[index]!=null){
          let res = await db.addOrderDetail(orderID, supply.supplies_id, nProduct[index], supply.price * nProduct[index]);
        }

      });
      res.redirect("/user/payment");
      return;
    }
    res.redirect('/signin');
  }
}

module.exports = new PatientControler;