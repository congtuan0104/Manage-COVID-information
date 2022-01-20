const { Router } = require('express');
const express = require('express');
const route = express.Router();

const patientController = require('../controllers/PatientControler');

route.get('/detailInfo', patientController.detailInfo);
route.get('/payment', patientController.payment);
route.get('/manageHistory', patientController.manageHistory);
route.get('/packages', patientController.packages);
route.get('/packages/:packageID',patientController.packageDetail);
route.get('/changePassword', patientController.getchangePassword);
route.get('/',patientController.home);
route.get('/getToken',patientController.getAccessToken);
route.post('/buyPacket/:packageID', patientController.buyPackage);
route.post('/changePassword', patientController.postChangePassword);
route.post('/callAddPaymentAPI', patientController.callAddPaymentAPI);
module.exports = route;