const config = require('./dbConfig');
const pgp = require('pg-promise')({
    capSQL: true,
});


module.exports = {
    list: async() =>{
        const db = await pgp(config);
        const res = await db.any('SELECT * FROM "Supplies"');
        if(res.length == 0) return null;
        return res;
    }
}