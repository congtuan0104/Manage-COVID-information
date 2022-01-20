const { Router } = require('express');
const express = require('express');
const route = express.Router();
const passport = require('passport');
const {applyPassport} = require('../passport');
applyPassport(passport);

const siteController = require('../controllers/SiteController');

route.get('/',siteController.home);
route.get('/signup',siteController.signup);
route.get('/signin',siteController.signin);
route.get('/log-out',siteController.logOut);
route.get('/createNewPwd',siteController.createNewPwd);
route.get('/getDistrict', siteController.getDistrict);
route.get('/getWard', siteController.getWard);
route.post('/adminSignUp',siteController.adminSignUp);
route.post('/userSignUp',siteController.userSignUp);
route.post('/signin',siteController.doSignIn);
route.post('/createNewPwd',siteController.doCreateNewPwd);


route.get('/protected', passport.authenticate('jwt', { session: false }), function(req, res) {
    res.json('Success! You can now see this without a token.');
  });

module.exports = route;
