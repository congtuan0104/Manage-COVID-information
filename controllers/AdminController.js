const bcrypt = require("bcrypt");
const saltRounds = 10;
const adminM = require("../models/AdminModel");
const siteM = require("../models/SiteModel");
class AdminController {
  //[GET]/
  async getManagers(req, res, next) {
    const managers = await adminM.getAllManagers();
    res.render("./Admin/managers", {
      layout: "adminLayout",
      title: "Quản lý tài khoản",
      Managers: managers,
      navP: () => "nav",
      cssP: () => "style",
      scriptP: () => "script",
      footerP: () => "footer",
    });
  }
  getAddAccount(req, res, next) {
    res.render("./Admin/addAccount", {
      layout: "adminLayout",
      title: "Tạo tài khoản",
      navP: () => "nav",
      cssP: () => "style",
      scriptP: () => "script",
      footerP: () => "footer",
    });
  }

  async deleteLocation(req, res, next) {
    const locationId = req.params.Id;
    await adminM.deleteLocation(locationId);
    res.redirect("/admin/locations");
  }

  async lockAccount(req, res, next) {
    const managerId = req.params.ManagerId;
    let manager = (await adminM.getManager(managerId))[0];
    manager.status = 0;
    console.log("lock account:", manager);
    await adminM.updateManager(manager);
    res.redirect(`/admin/account/${managerId}`);
  }
  async activateAccount(req, res, next) {
    const managerId = req.params.ManagerId;
    let manager = (await adminM.getManager(managerId))[0];
    manager.status = 1;
    await adminM.updateManager(manager);
    res.redirect(`/admin/account/${managerId}`);
  }

  async getLocations(req, res, next) {
    res.render("./Admin/locations", {
      layout: "adminLayout",
      title: "Địa điểm điều trị và cách ly",
      navP: () => "nav",
      cssP: () => "style",
      scriptP: () => "script",
      footerP: () => "footer",
      Locations: await adminM.getAllTreatmentLocations(),
    });
  }
  async getAddLoction(req, res, next) {
    const provinces = await siteM.all("province");
    res.render("./Admin/addLocation", {
      layout: "managementLayout",
      title: "Địa điểm điều trị và cách ly",
      provinces: provinces,
      navP: () => "nav",
      cssP: () => "style",
      scriptP: () => "script",
      footerP: () => "footer",
    });
  }
  async getEditLocation(req, res, next) {
    const id = req.params.Id;
    const location = (await adminM.getTreatmentLocation(id))[0];

    res.render("./Admin/editLocation", {
      layout: "adminLayout",
      Location: location,
      title: "Điều chỉnh địa điểm điều trị và cách ly",
      navP: () => "nav",
      cssP: () => "style",
      scriptP: () => "script",
      footerP: () => "footer",
    });
  }
  async getAccount(req, res, next) {
    const managerId = req.params.ManagerId;
    const manager = (await adminM.getManager(managerId))[0];
    // console.log("getAccount: ", manager);
    const history = await adminM.getManagerHistory(managerId);
    res.render("./Admin/account", {
      layout: "adminLayout",
      title: "Thông tin tài khoản",
      Manager: manager,
      History: history,
      navP: () => "nav",
      cssP: () => "style",
      scriptP: () => "script",
      footerP: () => "footer",
    });
  }

  async getDistrict(req, res) {
    const province = await siteM.get(
      req.query.province_name,
      "province",
      "province_name"
    );
    const districts = await siteM.getN(
      province.province_id,
      "district",
      "province_id"
    );
    console.log(districts);
    res.send(districts);
  }
  //[GET]/getWard
  async getWard(req, res) {
    const district = await siteM.get(
      req.query.district_name,
      "district",
      "district_name"
    );
    const wards = await siteM.getN(district.district_id, "ward", "district_id");
    res.send(wards);
  }

  //[POST]/
  async postEditLocation(req, res, next) {
    const id = req.params.Id;
    const location = {
      place_id: id,
      place_name: req.body.place_name,
      address: req.body.address,
      cur_capacity: req.body.cur_capacity,
      max_capacity: req.body.max_capacity,
    };
    await adminM.updateTreatmentLocation(location);
    res.redirect("/admin/locations");
  }
  async postAddLocation(req, res, next) {
    const location = {
      place_id: req.body.place_id,
      place_name: req.body.place_name,
      address: req.body.address,
      cur_capacity: req.body.cur_capacity,
      max_capacity: req.body.max_capacity,
    };
    // console.log(location);
    await adminM.addTreatmentLocation(location);
    res.redirect("/admin/locations");
  }

  async postAddAccount(req, res, next) {
    const hash = bcrypt.hashSync(req.body.password, saltRounds);
    const managerAccount = {
      username: req.body.username,
      password: hash,
      role: 1,
    };
    const r = await adminM.addManagerAccount(managerAccount);

    const managerEntity = {
      manager_id: req.body.manager_id,
      manager_name: "",
      status: 1,
      username: req.body.username,
    };
    await adminM.addManager(managerEntity);
    res.redirect("/admin");
  }
}

module.exports = new AdminController();
