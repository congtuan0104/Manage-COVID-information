const { Router } = require("express");
const express = require("express");
const multer = require('multer');
const route = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).array('pro-image',10);
const managerController = require("../controllers/ManagerController");

route.post('/uploadImage',upload,managerController.uploadImage);//
route.post('/addPackage',managerController.addPackage);
route.post("/deleteSupplies", managerController.deleteSupplies);
route.post("/updateSupplies", managerController.updateSupplies);
route.post("/addSupplies",upload, managerController.addSupplies);
route.post("/addPatient", managerController.addPatient);
route.get('/packages/:packageID',managerController.packageDetail);
route.get("/packages", managerController.packages);
route.get("/supplies", managerController.supplies);
route.get("/patients", managerController.patients);
route.get("/", managerController.home);

module.exports = route;
