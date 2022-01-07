const { Router } = require('express');
const express = require('express');
const route = express.Router();

const managerController = require('../controllers/ManagerController');

route.get('/',managerController.home);

module.exports = route;