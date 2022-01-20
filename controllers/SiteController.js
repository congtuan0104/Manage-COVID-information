const siteM = require('../models/SiteModel');
const bcrypt = require('bcrypt');
const passport = require('passport');
const saltRounds = 10;

class SiteController {
    //[GET]/
    home(req, res) {
        var logined, fullname;
        if (req.user) logined = true;
        else logined = false;
        if (req.session.admin) {
            fullname = req.session.admin.manager_name;
        }
        else if (req.session.manager) {
            fullname = req.session.manager.manager_name;
        }
        else if (req.session.user) {
            fullname = req.session.user.patient_name;
        }
        res.render('home', {
            title: 'Trang chủ',
            logined: logined,
            fullname: fullname,
            navP: () => 'nav',
            cssP: () => 'style',
            scriptP: () => 'script',
            footerP: () => 'footer',
        });
    }
    //[GET]/signup
    async signup(req, res) {
        if (req.user) {
            return res.redirect('/');
        }
        const admin = await siteM.get(2, 'account', 'role');
        const provinces = await siteM.all('province');
        if (admin) {
            res.render('./Account/userSignUp', {
                title: 'Đăng ký',
                provinces: provinces,
                navP: () => 'accountNav',
                cssP: () => 'style',
                scriptP: () => 'script',
                footerP: () => 'footer',
            });
        }
        else {
            res.render('./Account/adminSignUp', {
                title: 'Đăng ký',
                navP: () => 'accountNav',
                cssP: () => 'style',
                scriptP: () => 'script',
                footerP: () => 'footer',
            });

        }
    }
    //[POST]/adminSignUp
    async adminSignUp(req, res) {
        const username = req.body.username;
        const pwd = req.body.pwd;
        const repwd = req.body.repwd;
        const user = await siteM.get(username, 'account', 'username');
        if (user) {
            res.render('./Account/adminSignUp', {
                title: 'Đăng ký',
                navP: () => 'accountNav',
                cssP: () => 'style',
                scriptP: () => 'script',
                footerP: () => 'footer',
                msg: 'User already exists',
                color: 'danger',
            });
            return;
        }
        if (pwd != repwd) {
            res.render('./Account/adminSignUp', {
                title: 'Đăng ký',
                navP: () => 'accountNav',
                cssP: () => 'style',
                scriptP: () => 'script',
                footerP: () => 'footer',
                msg: 'Re-password incorrect',
                color: 'danger',
            });
            return;
        }
        const pwdHashed = await bcrypt.hash(pwd, saltRounds);
        let newUser = {
            username: username,
            password: pwdHashed,
            role: 2
        };
        let newManager = {
            manager_name: req.body.fullname,
            status: 2,
            username: username
        };
        await siteM.add(newUser, 'account');
        await siteM.add(newManager, 'manager');
        res.render('./Account/adminSignUp', {
            title: 'Đăng ký',
            navP: () => 'accountNav',
            cssP: () => 'style',
            scriptP: () => 'script',
            footerP: () => 'footer',
            msg: 'Sign up successfully',
            color: 'success',
        });
    }
    //[POST]/userSignUp
    async userSignUp(req, res) {
        const username = req.body.username;
        const pwd = req.body.pwd;
        const repwd = req.body.repwd;
        const user = await siteM.get(username, 'account', 'username');
        if (user) {
            res.render('./Account/userSignUp', {
                title: 'Đăng ký',
                navP: () => 'accountNav',
                cssP: () => 'style',
                scriptP: () => 'script',
                footerP: () => 'footer',
                msg: 'Số CMND/CCCD này đã được đăng ký',
                color: 'danger',
            });
            return;
        }
        if (pwd != repwd) {
            res.render('./Account/userSignUp', {
                title: 'Đăng ký',
                navP: () => 'accountNav',
                cssP: () => 'style',
                scriptP: () => 'script',
                footerP: () => 'footer',
                msg: 'Mật khẩu nhập lại không trùng khớp',
                color: 'danger',
            });
            return;
        }
        const pwdHashed = await bcrypt.hash(pwd, saltRounds);
        let newAccount = {
            username: username,
            password: pwdHashed,
            role: 0
        };
        const address = `${req.body.address}, ${req.body.ward}, ${req.body.district}, ${req.body.province}`;
        let newPatient = {
            patient_name: req.body.fullname,
            identity_card: username,
            birthday: req.body.bday,
            address: address,
            status: null,
            place_id: null,
            username: username
        };
        await siteM.add(newAccount, 'account');
        await siteM.add(newPatient, 'patient');
        res.render('./Account/userSignUp', {
            title: 'Đăng ký',
            navP: () => 'accountNav',
            cssP: () => 'style',
            scriptP: () => 'script',
            footerP: () => 'footer',
            msg: 'Đăng ký thành công',
            color: 'success',
        });
    }
    //[GET]/signin
    signin(req, res, next) {
        if (req.user) {
            return res.redirect('/');
        }
        res.render('./Account/signin', {
            title: 'Đăng nhập',
            navP: () => 'accountNav',
            cssP: () => 'style',
            scriptP: () => 'script',
            footerP: () => 'footer',
        });
    }
    //[POST]/signin
    async doSignIn(req, res, next) {
        const user = await siteM.get(req.body.username, 'account', 'username');
        if (user && !user.password) {
            return res.redirect('/createNewPwd?username=' + user.username);
        }
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return res.render('./Account/signin', {
                    title: 'Đăng nhập',
                    navP: () => 'accountNav',
                    cssP: () => 'style',
                    scriptP: () => 'script',
                    footerP: () => 'footer',
                    msg: err,
                    color: 'danger'
                });
            }
            if (!user) {
                return res.render('./Account/signin', {
                    title: 'Đăng nhập',
                    navP: () => 'accountNav',
                    cssP: () => 'style',
                    scriptP: () => 'script',
                    footerP: () => 'footer',
                    msg: info.message,
                    color: 'danger'
                });
            }
            req.logIn(user, async function (err) {
                if (err) {
                    return res.render('./Account/signin', {
                        title: 'Đăng nhập',
                        navP: () => 'accountNav',
                        cssP: () => 'style',
                        scriptP: () => 'script',
                        footerP: () => 'footer',
                        msg: err,
                        color: 'danger'
                    });
                }
                if (user.role === 2) {
                    req.session.admin = await siteM.get(user.username, 'manager', 'username');
                    return res.redirect('/');
                }
                if (user.role === 1) {
                    req.session.manager = await siteM.get(user.username, 'manager', 'username');
                    return res.redirect('/manager');
                }
                if (user.role === 0) {
                    const temp = await siteM.get(user.username, 'patient', 'username');
                    req.session.patient = temp;
                    //res.redirect('/')
                    return res.redirect('/user');
                }
            });
        })(req, res, next);
    }
    //[GET]/getDistrict
    async getDistrict(req, res) {
        const province = await siteM.get(req.query.province_name, 'province', 'province_name');
        const districts = await siteM.getN(province.province_id, 'district', 'province_id');
        res.send(districts);
    }
    //[GET]/getWard
    async getWard(req, res) {
        const district = await siteM.get(req.query.district_name, 'district', 'district_name');
        const wards = await siteM.getN(district.district_id, 'ward', 'district_id');
        res.send(wards);
    }
    //[GET]/createNewPwd
    async createNewPwd(req, res) {
        if (req.user || !req.query.username) {
            return res.redirect('/');
        }
        const user = await siteM.get(req.query.username, 'account', 'username');
        if (user && user.password) {
            return res.redirect('/signin');
        }       
        res.render('./Account/createNewPwd', {
            title: 'Tạo mật khẩu mới',
            navP: () => 'accountNav',
            cssP: () => 'style',
            scriptP: () => 'script',
            footerP: () => 'footer',
            username: req.query.username,
            msg: 'Đây là lần đầu bạn đăng nhập. Vui lòng tạo mật khẩu mới.',
            color: 'warning'
        });        
    }
    //[POST]/createNewPwd
    async doCreateNewPwd(req, res) {
        const username = req.body.username;       
        const pwd = req.body.pwd;
        const repwd = req.body.repwd;              
        if (pwd != repwd) {
            res.render('./Account/createNewPwd', {
                title: 'Tạo mật khẩu mới',              
                navP: () => 'accountNav',
                cssP: () => 'style',
                scriptP: () => 'script',
                footerP: () => 'footer',
                username: username,
                msg: 'Mật khẩu nhập lại không trùng khớp',
                color: 'danger',
            });
            return;
        }
        const pwdHashed = await bcrypt.hash(pwd, saltRounds);
        let entity = {           
            password: pwdHashed,
        };
        await siteM.update('account', entity, 'username', username);
        res.redirect('/signin');
    }
    //[GET]/log-out
    logOut(req, res) {
        if (req.user) {
            req.logOut();
        }
        return res.redirect('/signin');
    }
}

module.exports = new SiteController;