const { Router } = require('express');
const express = require('express');
const route = express.Router();

const patientController = require('../controllers/PatientControler');

route.get('/detailInfo', patientController.detailInfo);
route.get('/payment', patientController.payment);
route.get('/manageHistory', patientController.manageHistory);
route.get('/supplies', patientController.supplies);
route.get('/changePassword', patientController.changePassword);

module.exports = route;