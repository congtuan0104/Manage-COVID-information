const { Router } = require('express');
const express = require('express');
const route = express.Router();

const patientController = require('../controllers/PatientControler');

route.get('/detailInfo/:patientID', patientController.detailInfo);
route.get('/payment', patientController.payment);
route.get('/manageHistory', patientController.manageHistory);
route.get('/packages', patientController.packages);
route.get('/packages/:packageID',patientController.packageDetail);
route.get('/changePassword', patientController.changePassword);
route.get('/',patientController.home);

route.post('/buyPacket/:packageID', patientController.buyPackage);

module.exports = route;