const db = require("./dbConfig");
const pgp = require("pg-promise")({
  capSQL: true
});
const schema = "public";

module.exports = {

  all: async (tblName) => {
    const table = new pgp.helpers.TableName({
      table: tblName,
      schema: schema
    });
    const qStr = pgp.as.format("SELECT * FROM $1", table);
    try {
      const res = await db.any(qStr);
      return res;
    } catch (error) {
      console.log("error accountM/all:", error);
    }
  },
  get: async (value, tblName, fieldName) => {
    const table = new pgp.helpers.TableName({
      table: tblName,
      schema: schema
    });
    const qStr = pgp.as.format(`SELECT * FROM $1 WHERE "${fieldName}"='${value}'`, table);
    try {
      const res = await db.any(qStr);
      if (res.length > 0) {
        return res[0];
      }
      return null;
    } catch (error) {
      console.log('error siteM/get:', error);
      console.log("fieldName", fieldName);
      console.log("value", value);
      console.log("tblName", tblName);
    }
  },
  getN: async (value, tblName, fieldName) => {
    const table = new pgp.helpers.TableName({
      table: tblName,
      schema: schema
    });
    const qStr = pgp.as.format(`SELECT * FROM $1 WHERE "${fieldName}"='${value}'`, table);
    try {
      const res = await db.any(qStr);
      if (res.length > 0) {
        return res;
      }
      return null;
    } catch (error) {
      console.log('error siteM/getN:', error);
    }
  },
  add: async (entity, tblName) => {
    const table = new pgp.helpers.TableName({
      table: tblName,
      schema: schema
    });
    const qStr = pgp.helpers.insert(entity, null, table) + " RETURNING *";
    try {
      const res = await db.any(qStr);
      return res;
    } catch (error) {
      console.log("error accountM/add:", error);
    }
  },
  update: async (tbName, fieldName, entity) => {
    const table = new pgp.helpers.TableName({
      table: tbName,
      schema: schema,
    });
    const condition = pgp.as.format(
      ` WHERE "${fieldName}" = '${entity[fieldName]}'`,
      table
    );
    const qStr = pgp.helpers.update(entity, null, table) + condition;

    try {
      console.log("Update query: ", qStr);
      const res = await db.one(qStr);
    } catch (error) {
      console.log("error db/update", error);
    }
  },
  ///////////////////////////////////////////////////////////////
  delete: async (tbName, fieldName, val) => {
    const table = new pgp.helpers.TableName({
      table: tbName,
      schema: schema,
    });
    const qStr = pgp.as.format(
      `DELETE FROM $1 WHERE "${fieldName}"='${val}'`,
      table
    );
    try {
      const res = await db.any(qStr);
      return res;
    } catch (error) {
      console.log("error db/delete", error);
    }
  },
};