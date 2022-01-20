const { Router } = require("express");
const express = require("express");
const route = express.Router();

const adminController = require("../controllers/AdminController");

route.get("/", adminController.getManagers);

route.get("/addaccount", adminController.getAddAccount);

route.get("/locations", adminController.getLocations);

route.get("/add-location", adminController.getAddLoction);

route.get("/edit-location/:Id", adminController.getEditLocation);

route.get("/account/:ManagerId", adminController.getAccount);

route.get("/delete-location/:Id", adminController.deleteLocation);

route.get("/account/lock/:ManagerId", adminController.lockAccount);

route.get("/account/activate/:ManagerId", adminController.activateAccount);

route.post("/edit-location/:Id", adminController.postEditLocation);

route.post("/add-location", adminController.postAddLocation);

route.post("/addaccount", adminController.postAddAccount);

module.exports = route;
