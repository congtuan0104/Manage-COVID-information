const siteRoute = require('./site');
const patientRoute = require('./patient');
const managerRoute = require('./test');

function route(app) {
    //app.use('/admin', adminController); //Dành cho phân hệ quản trị/  Minh Lợi
    app.use('/manager', managerRoute);   //Dành cho phân hệ quản lý   /  Ngọc Nguyên + Công Tuấn
    app.use('/user', patientRoute);      //Dành cho phân hệ người dùng/ Thái Bảo   
    app.use('/', siteRoute);             //Trang chủ, đăng nhập, đăng ký, xem một số thông tin chung, ... Huy Tùng
}

module.exports = route;