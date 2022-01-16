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
        const res = await db.any('SELECT * FROM Supplies ORDER BY supplies_id LIMIT 12 OFFSET $1',[(page - 1) * 12]);
        if (res.length == 0) return null;
        return res;
    },


    //Lấy tất cả nhu yếu phẩm
    getAllSupplies: async () => {
        const res = await db.any('SELECT * FROM Supplies');
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
        ORDER BY p.Package_ID
        LIMIT 12 OFFSET $1`,[(page - 1) * 12]);

        if (res.length == 0) return null;
        return res;
    },

    // Xem danh sách người bệnh
    getPatientList: async ()=> {
        const res = await db.any("SELECT * FROM patient");
        return res;
    },

    getPatientDetail: async (patientID) => {
        const res = await db.one("SELECT * FROM patient WHERE patient_id=$1", [patientID]);
        if(res.length == 0) return null;
        return res;
    },

    getListTreatmentPlace: async()=>{
        const res= await db.any("SELECT * FROM treatment_place");
        if(res.length==0) return null;
        return res;
    },
    getTreatmentPlaceByID: async (placeID) =>{
        const res = await db.one("SELECT * FROM treatment_place WHERE place_id=$1", [placeID]);
        if(res.length == 0) return null;
        return res.place_name;
    },

    // Thêm người bệnh
    addPatient: async(patient_name, identity_card,birthday,address,status)=>{
        await db.none(`INSERT INTO patient(patient_name, identity_card,birthday,address,status)
        VALUES('${patient_name}', '${identity_card}','${birthday}','${address}','${status}')`);
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


    //Thêm thông tin gói nhu yếu phẩm
    addPackage: async (packageName,limit,limitTime) => {
        const insert = await db.none(`INSERT INTO package(package_name,package_limit,time_limit)
             VALUES('${packageName}',${limit},'${limitTime}')`);
        if(insert){
            console.log(insert);
            return null;
        }
        const package_id = await db.one(`SELECT package_id FROM package WHERE package_name='${packageName}'`);
        if(package_id==null) return null;
        return package_id.package_id;
    },


    //Thêm chi tiết gói sản phẩm
    addPackageDetail: async (packageID,suppliesID,quantityLimit) => {
        const res = await db.none(`
        INSERT INTO package_detail(package_id,supplies_id,quantity_limit)
         VALUES(${packageID},${suppliesID},${quantityLimit})`);
        if (res) {
            console.log(res);
            return 0;
        }
        return 1;
    },


    // Xem thông tin gói nhu yếu phẩm
    getPackageDetail: async (packageID)=> {
        const res = await db.any("SELECT * FROM package WHERE package_id=$1",[packageID]);
        if(res.length==0) return null;
        return res;
    },



    // Lấy danh sách các sản phẩm trong gói nhu yếu phẩm
    getSuppliesOfPackage: async (packageID)=> {
        const res = await db.any(`SELECT p.supplies_id, supplies_name, quantity_limit
                                 FROM package_detail p, supplies s 
                                WHERE package_id=$1 AND p.supplies_id=s.supplies_id`,[packageID]);
        if(res.length==0) return null;
        return res;
    },


    // Lấy danh sách các sản phẩm không nằm trong gói nhu yếu phẩm
    getRemainingPackage: async (packageID)=> {
        const res = await db.any(`SELECT supplies_id, supplies_name from supplies where supplies_id not in
        (SELECT supplies_id FROM package_detail WHERE package_id=$1)`,[packageID]);
        if(res.length==0) return null;
        return res;
    },
}