const pgp = require('pg-promise')({
    capSQL: true,
});

const schema = 'public';
const cn={
    user: 'postgres',
    host: 'localhost',
    database: 'qlbh',
    password: '1234',
    port: 5432,
    max: 30,
};

const db=pgp(cn);

exports.load = async tbName =>{
    const table = new pgp.helpers.TableName({table: tbName, schema: schema});
    const qStr = pgp.as.format('SELECT * FROM $1', table);
    try{
        const res = await db.any(qStr);
        console.log(res)
        return res;
    }catch(error){
        console.log('error db/load:', error)

    }
}

exports.get = async (tbName, fieldName, value) =>{
    const table = new pgp.helpers.TableName({table: tbName, schema: schema});
    const qStr = pgp.as.format(`SELECT * FROM $1 WHERE "${fieldName}"='${value}'`, table);

    try{
        const res = await db.any(qStr);
        return res;
    }catch(error){
        console.log('error db/get:', error)

    }
}

exports.add = async (tbName, entity) =>{
    const table = new pgp.helpers.TableName({table: tbName, schema: schema});
    const qStr = pgp.helpers.insert(entity, null, table) + 'RETURNING *';
    try{
        const res = await db.one(qStr);
        return res;
    }catch(error){
        console.log('error db/add:', error)

    }
}


