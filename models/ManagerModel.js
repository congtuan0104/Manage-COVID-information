const db = require('./dbConfig');

module.exports = {
    getNumberOfPage: async (tblName,nElementOfPage) => {
        let numberOfPage;
        const res = await db.any('SELECT COUNT(*) AS number FROM $1:name',tblName);
        if (res.length == 0) return null;
        numberOfPage = Math.ceil(parseInt(res[0].number)/parseInt(nElementOfPage));
        return numberOfPage;
    },


    //Xem danh sách nhu yếu phẩm
    getSuppliesList: async (page) => {
        const res = await db.any('SELECT * FROM Supplies LIMIT 12 OFFSET $1',[(page - 1) * 12]);
        if (res.length == 0) return null;
        return res;
    },


    //Xem danh sách gói nhu yếu phẩm
    getPackageList: async (page) => {
        const res = await db.any(`
        SELECT p.Package_ID,Package_Name,Package_Limit, Time_Limit,COUNT(*) AS SLSP
        FROM Package p, Package_Detail pd
        WHERE p.Package_ID = pd.Package_ID
        GROUP BY p.Package_ID,Package_Name,Package_Limit, Time_Limit
        LIMIT 12 OFFSET $1`,[(page - 1) * 12]);

        if (res.length == 0) return null;
        return res;
    },


    //Thêm một sản phẩm mới
    addSupplies: async (productName, price, unit) => {
        const res = await db.none(`
        INSERT INTO supplies(supplies_name,price,unit)
          VALUES('${productName}',${price},'${unit}')`);
        if (res) {
            console.log(res);
            return 0;
        }
        return 1;
    },


    //Sửa thông tín sản phẩm
    updateSupplies: async (suppliesID, suppliesName, price, unit) => {
        const res = await db.none(`
        UPDATE supplies
         SET supplies_name=$1, price=$2, unit=$3
         WHERE supplies_id=$4`, [suppliesName, price, unit, suppliesID]);
        if (res) {
            console.log(res);
            return 0;
        }
        return 1;
    },


    //Xoá sản phẩm
    deleteSupplies: async (suppliesID) => {
        const res = await db.none(`DELETE FROM supplies WHERE supplies_id=$1`, [suppliesID]);
        if (res) {
            console.log(res);
            return 0;
        }
        return 1;
    },
}