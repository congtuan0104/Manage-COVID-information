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
            console.log('error accountM/all:', error);
        }
    },
    get: async (username, tblName, fieldName) => {
        const table = new pgp.helpers.TableName({ table: tblName, schema: schema });
        const qStr = pgp.as.format(`SELECT * FROM $1 WHERE "${fieldName}"='${username}'`, table);
        try {
            const res = await db.any(qStr);
            if (res.length > 0) {
                return res[0];
            }
            return null;
        } catch (error) {
            console.log('error accountM/get:', error);
        }
    },
    add: async (entity, tblName) => {
        const table = new pgp.helpers.TableName({ table: tblName, schema: schema });
        const qStr = pgp.helpers.insert(entity, null, table) + ' RETURNING *';
        try {
            const res = await db.any(qStr);
            return res;
        } catch (error) {
            console.log('error accountM/add:', error);
        }
    },
};