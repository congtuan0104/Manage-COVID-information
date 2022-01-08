const db = require('./dbConfig');

module.exports = {
    getSuppliesList: async() =>{  
        const res = await db.any('SELECT * FROM Supplies');
        if(res.length == 0) return null;
        return res;
    },

    getPackageList: async() =>{
        const res = await db.any(`
        SELECT p.Package_ID,Package_Name,Package_Limit, Time_Limit,COUNT(*) AS SLSP
        FROM Package p, Package_Detail pd
        WHERE p.Package_ID = pd.Package_ID
        GROUP BY p.Package_ID,Package_Name,Package_Limit, Time_Limit`);

        if(res.length == 0) return null;
        return res;
    },

    addSupplies: async(productName,price,unit) =>{
        const res = await db.none(`
        INSERT INTO supplies(supplies_name,price,unit)
          VALUES('${productName}',${price},'${unit}')`);
        if(res){
            console.log(error);
            return 0;
        }   
        return 1;
    },

    updateSupplies: async(productID,productName,price,unit) =>{

        const res = await db.none(`
        UPDATE supplies
         SET supplies_name='$1', price=$2, unit='$3'
         WHERE supplies_id=$4`,[productName,price,unit,productID]);
        console.log(res);
        if(res){
            return 0;
        }   
        return 2;
    },
}