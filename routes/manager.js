const {
    Router
} = require("express");
const express = require("express");
const multer = require('multer');
const route = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage
}).array('pro-image', 10);
const managerController = require("../controllers/ManagerController");

route.get('/packageFilter', managerController.packageFilter);
route.get('/suppliesFilter', managerController.suppliesFilter);
route.get('/sortList', managerController.sort);
route.get('/search', managerController.search);
route.get('/suppliesConsume', managerController.suppliesConsume);
route.get('/packageConsume', managerController.packageConsume);
route.get('/searchRange', managerController.searchRange);
route.get('/searchStatistic', managerController.searchStatistic);
route.get('/statistic', managerController.statistical);
route.post('/deletePackage', managerController.deletePackage);
route.post('/addPackage', managerController.addPackage);
route.post("/deleteSupplies", managerController.deleteSupplies);
route.post("/updateSupplies", managerController.updateSupplies);
route.post("/addSupplies", upload, managerController.addSupplies);
route.post("/addPatient", managerController.addPatient);
route.post("/updatePatientInfo", managerController.updatePatientInfor);

route.get('/packages/:packageID', managerController.packageDetail);
route.get("/packages", managerController.packages);
route.get("/supplies", managerController.supplies);
route.get("/patients", managerController.patients);
route.get("/patients/:patientID", managerController.patientDetail);
route.get("/patientsSortByName", managerController.patientsSortByName);
route.get("/patientsSortByStatus", managerController.patientsSortByStatus);
// route.get("/payment", managerController.paymentManagement);
route.get("/", managerController.home);

module.exports = route;