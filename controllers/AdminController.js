const bcrypt = require("bcrypt");
const saltRounds = 10;
const adminM = require("../models/AdminModel");
const siteM = require("../models/SiteModel");
class AdminController {
  //[GET]/
  async getManagers(req, res, next) {
    const managers = await adminM.getAllManagers();
    // const managers = accounts.filter(manger => manager.status == "1" || manager.status == "0");
    console.log("get all managers: ", managers);
    console.log(managers.filter((manager) => {
      return manager.status == "1" || manager.status == "0";
    }));
    res.render("./Admin/managers", {
      layout: "adminLayout",
      title: "Quản lý tài khoản",
      Managers: managers.filter((manager) => {
        return manager.status == "1" || manager.status == "0"
      }),
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
    let manager = await adminM.getManager(managerId);
    manager.status = 0;

    await adminM.updateManager(manager);
    res.redirect(`/admin/account/${managerId}`);
  }
  async activateAccount(req, res, next) {
    const managerId = req.params.ManagerId;
    let manager = await adminM.getManager(managerId);
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
      layout: "adminLayout",
      title: "Địa điểm điều trị và cách ly",
      provinces: provinces,
      navP: () => "accountNav",
      cssP: () => "style",
      scriptP: () => "script",
      footerP: () => "footer",
    });
  }
  async getEditLocation(req, res, next) {
    const id = req.params.Id;
    const location = await adminM.getTreatmentLocation(id);
    const provinces = await siteM.all("province");
    console.log(location);
    res.render("./Admin/editLocation", {
      layout: "adminLayout",
      Location: location,
      provinces: provinces,
      title: "Điều chỉnh địa điểm điều trị và cách ly",
      navP: () => "accountNav",
      cssP: () => "style",
      scriptP: () => "script",
      footerP: () => "footer",
    });
  }
  async getAccount(req, res, next) {
    const managerId = req.params.ManagerId;
    const manager = await adminM.getManager(managerId);

    // console.log("getAccount: ", manager);
    const history = await adminM.getManagerHistory(managerId);
    console.log('get history:', history);
    if (history) {
      history.forEach((h) => {
        // console.log(new Date(h.update_time).getMonth(), new Date(h.update_time).getDate(), new Date(h.update_time).getFullYear());
        // console.log(new Date(h.update_time).toLocaleTimeString() + " " + new Date(h.update_time).toDateString());
        h.update_time = new Date(h.update_time).toLocaleTimeString() + " " + new Date(h.update_time).toDateString();
      })
    }
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
    console.log("get district: ", req.query.province_name);
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

    res.send(districts);
  }
  //[GET]/getWard
  async getWard(req, res) {
    console.log("getWard: ", req.query.district_name);
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
      address: `${req.body.address}, Quận ${req.body.district}, Phường ${req.body.ward}, ${req.body.province}`,
      cur_capacity: req.body.cur_capacity,
      max_capacity: req.body.max_capacity,
    };
    await adminM.updateTreatmentLocation(location);
    res.redirect("/admin/locations");
  }
  async postAddLocation(req, res, next) {
    const location = {
      place_name: req.body.place_name,
      address: `${req.body.address}, Quận ${req.body.district}, Phường ${req.body.ward}, ${req.body.province}`,
      cur_capacity: 0,
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
      manager_name: req.body.manager_name,
      status: 1,
      username: req.body.username,
    };
    console.log("add manager: ", managerEntity);
    await adminM.addManager(managerEntity);
    res.redirect("/admin");
  }
}

module.exports = new AdminController();