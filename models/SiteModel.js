const db = require('./dbConfig');
const pgp = require('pg-promise')({ capSQL: true });
const schema = 'public';

module.exports = {
    all: async (tblName) => {
        const table = new pgp.helpers.TableName({ table: tblName, schema: schema });
        const qStr = pgp.as.format('SELECT * FROM $1', table);
        try {
            const res = await db.any(qStr);
            return res;
        } catch (error) {
            console.log('error siteM/all:', error);
        }
    },
    get: async (value, tblName, fieldName) => {
        const table = new pgp.helpers.TableName({ table: tblName, schema: schema });
        const qStr = pgp.as.format(`SELECT * FROM $1 WHERE "${fieldName}"='${value}'`, table);
        try {
            const res = await db.any(qStr);
            if (res.length > 0) {
                return res[0];
            }
            return null;
        } catch (error) {
            console.log('error siteM/get:', error);
        }
    },
    getN: async (value, tblName, fieldName) => {
        const table = new pgp.helpers.TableName({ table: tblName, schema: schema });
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
        const table = new pgp.helpers.TableName({ table: tblName, schema: schema });
        const qStr = pgp.helpers.insert(entity, null, table) + ' RETURNING *';
        try {
            const res = await db.any(qStr);
            return res;
        } catch (error) {
            console.log('error siteM/add:', error);
        }
    },
    update: async (tblName, entity, fieldName, value) => {
        const table = new pgp.helpers.TableName({table: tblName, schema: schema});
        const qStr = pgp.helpers.update(entity, null, table) + `WHERE "${fieldName}" = '${value}'`;
        try {
            const res = db.any(qStr);
            return res;
        } catch (error) {
            console.log('error siteM/update:', error);
        }
    }
};