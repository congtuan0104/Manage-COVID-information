const pgp = require("pg-promise")({ capSQL: true });

const config = {

    user: 'postgres',
    host: 'localhost',
    database: 'qltt',
    password: '1234',
    port: 5432,
    max: 30,

};

const db = pgp(config);
module.exports = db;
