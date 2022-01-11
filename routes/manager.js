const { Router } = require("express");
const express = require("express");
const route = express.Router();

const managerController = require("../controllers/ManagerController");

route.post("/deleteSupplies", managerController.deleteSupplies);
route.post("/updateSupplies", managerController.updateSupplies);
route.post("/addSupplies", managerController.addSupplies);
route.post("/addPatient", managerController.addPatient);
route.get("/packages", managerController.packages);
route.get("/supplies", managerController.supplies);
route.get("/patients", managerController.patients);
route.get("/", managerController.home);

module.exports = route;
