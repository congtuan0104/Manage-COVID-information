const { Router } = require('express');
const express = require('express');
const route = express.Router();

const siteController = require('../controllers/SiteController');

route.get('/',siteController.home);
route.get('/signup',siteController.signup);
route.get('/signin',siteController.signin);
route.post('/adminSignUp',siteController.adminSignUp);
route.post('/userSignUp',siteController.userSignUp);
route.post('/signin',siteController.doSignIn);

module.exports = route;
