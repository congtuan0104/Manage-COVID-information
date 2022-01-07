//const db = require('../models/dbOperations');

class PatientControler {
    //[GET]/
    home(req, res, next) {
        res.render('home', {
            title: 'Trang chủ',
            navP: () => 'nav',
            sidebarP: () => 'patientSidebar',
            cssP: () => 'style',
            scriptP: () => 'script',
            footerP: () => 'footer',
            currentPage: 'home'
        });
    }
    detailInfo(req, res, next) {
        res.render('Patient/patientDetailInfo', {
            title: 'Trang chủ',
            navP: () => 'nav',
            sidebarP: () => 'patientSidebar',
            cssP: () => 'style',
            scriptP: () => 'script',
            footerP: () => 'footer',
            currentPage: 'detailInfo'
        });
    }
    payment(req, res, next) {
        res.render('Patient/payment', {
            title: 'Trang chủ',
            navP: () => 'nav',
            sidebarP: () => 'patientSidebar',
            cssP: () => 'style',
            scriptP: () => 'script',
            footerP: () => 'footer',
            currentPage: 'payment'
        });
    }
    manageHistory(req, res, next) {
        res.render('Patient/manageHistory', {
            title: 'Trang chủ',
            navP: () => 'nav',
            sidebarP: () => 'patientSidebar',
            cssP: () => 'style',
            scriptP: () => 'script',
            footerP: () => 'footer',
            currentPage: 'manageHistory'
        });
    }
    supplies(req, res, next) {
        res.render('Management/supplieItems', {
            title: 'Trang chủ',
            navP: () => 'nav',
            sidebarP: () => 'patientSidebar',
            cssP: () => 'style',
            scriptP: () => 'script',
            footerP: () => 'footer',
            currentPage: 'supplies'
        });
    }
    changePassword(req, res, next) {
        res.render('Patient/changePassword', {
            title: 'Trang chủ',
            navP: () => 'nav',
            sidebarP: () => 'patientSidebar',
            cssP: () => 'style',
            scriptP: () => 'script',
            footerP: () => 'footer',
        });
    }
}

module.exports = new PatientControler;