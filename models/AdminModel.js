const db = require("./dbConfig");

const dbModel = require("./SiteModel");

const accountTableName = "account";
const treamentPlaceTableName = "treatment_place";
const managerTableName = "manager";
const treamentHistoryTableName = "treatment_history";

module.exports = {
  getAllTreatmentLocations: async () => {
    const locations = await dbModel.all(treamentPlaceTableName);
    return locations;
  },
  getAllManagers: async () => {
    const managers = await dbModel.all(managerTableName);
    return managers;
  },
  getManager: async (managerId) => {
    const manager = await dbModel.get(
      managerId,
      managerTableName,
      "manager_id"
    );

    return manager;
  },
  getManagerHistory: async (managerId) => {
    const history = await dbModel.get(
      managerId,
      treamentHistoryTableName,
      "reformist"
    );
    return history;
  },
  getTreatmentLocation: async (id) => {
    const location = await dbModel.get(id, treamentPlaceTableName, "place_id");
    return location;
  },
  updateTreatmentLocation: async (location) => {
    const res = await dbModel.update(
      treamentPlaceTableName,
      "place_id",
      location
    );
    return res;
  },

  addTreatmentLocation: async (location) => {
    const res = await dbModel.add(location, treamentPlaceTableName);
    return res;
  },

  addManagerAccount: async (account) => {
    const res = await dbModel.add(account, accountTableName);
    return res;
  },
  addManager: async (manager) => {
    const res = await dbModel.add(manager, managerTableName);
  },
};
