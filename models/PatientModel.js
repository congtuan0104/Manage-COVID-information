
const passport = require('passport');
const { user, password } = require('pg/lib/defaults');
const db = require('./dbConfig');


module.exports = {
    getNotification: async (patient_id)=>{
        const res = await db.any("SELECT *, TO_CHAR(time,'dd/MM/yyyy hh:MI:ss') AS time FROM notification WHERE patient_id =$1",[patient_id]);
        return res;
    },
    addNotification: async (patient_id,time,message)=>{
        await db.none(`INSERT INTO notification(patient_id,time,message)
        VALUES('${patient_id}','${time}','${message}')`);
    },
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


  //Lấy tất cả nhu yếu phẩm
  getAllSupplies: async () => {
    const res = await db.any("SELECT * FROM Supplies");
    if (res.length == 0) return null;
    return res;
  },

  //Xem danh sách gói nhu yếu phẩm
  getPackageList: async (page) => {
    const res = await db.any(
      `
        SELECT p.Package_ID,Package_Name,Package_Limit, Time_Limit,COUNT(*) AS SLSP
        FROM Package p, Package_Detail pd
        WHERE p.Package_ID = pd.Package_ID
        GROUP BY p.Package_ID,Package_Name,Package_Limit, Time_Limit
        ORDER BY p.Package_ID
        LIMIT 12 OFFSET $1`,
      [(page - 1) * 12]
    );

    if (res.length == 0) return null;
    return res;
  },

  // Xem danh sách người bệnh
  getPatientList: async () => {
    const res = await db.any("SELECT * FROM patient");
    return res;
  },

  getPatientDetail: async (patientID) => {
    const res = await db.one("SELECT * FROM patient WHERE patient_id=$1", [
      patientID,
    ]);
    if (res.length == 0) return null;
    return res;
  },
  getRelatedPatients: async (patientID) => {
    const res = await db.any(
      "SELECT * FROM related_patients,patient WHERE related_patients.patient_id1=$1 AND related_patients.patient_id2 = patient.patient_id",
      [patientID]
    );
    if (res.length == 0) return null;
    return res;
  },

  getTreatmentPlaceByID: async (placeID) => {
    const res = await db.one(
      "SELECT * FROM treatment_place WHERE place_id=$1",
      [placeID]
    );
    if (res.length == 0) return null;
    return res.place_name;
  },

  // Xem thông tin gói nhu yếu phẩm
  getPackageDetail: async (packageID) => {
    const res = await db.one("SELECT * FROM package WHERE package_id=$1", [
      packageID,
    ]);
    if (res.length == 0) return null;
    return res;
  },


    //Xem ảnh mô tả của nhu yếu phẩm
    getSuppliesImg: async (suppliesID) => {
        const res = await db.any(
        `SELECT image_url FROM supplies_image WHERE supplies_id = ${suppliesID}`
        );
        if (res.length == 0) return null;
        return res;
    },
    // Lấy danh sách các sản phẩm trong gói nhu yếu phẩm
    getSuppliesOfPackage: async (packageID)=> {
        const res = await db.any(`SELECT *

                                 FROM package_detail p, supplies s 
                                WHERE package_id=$1 AND p.supplies_id=s.supplies_id`,
      [packageID]
    );
    if (res.length == 0) return null;
    return res;
  },


    // Lấy danh sách các sản phẩm không nằm trong gói nhu yếu phẩm
    getRemainingPackage: async (packageID)=> {
        const res = await db.any(`SELECT * from supplies where supplies_id not in
        (SELECT supplies_id FROM package_detail WHERE package_id=$1)`,[packageID]);
        if(res.length==0) return null;
        return res;
    },
    // Thêm đơn hàng
    addPackage: async(patient_id,timeorder,package_id,quantity,grand_total,status)=>{
        await db.none(`INSERT INTO orders(patient_id,timeorder,package_id,quantity,grand_total,status)
        VALUES('${patient_id}','${timeorder}','${package_id}','${quantity}','${grand_total}','${status}')`);
        const allOrders = await db.any('SELECT * FROM orders');
        return allOrders.length;
    },
    // Thêm đơn hàng
    addOrderDetail: async(order_id,supplies_id,quantity,total)=>{
        await db.none(`INSERT INTO order_detail(order_id, supplies_id,quantity,total)
        VALUES('${order_id}', '${supplies_id}','${quantity}','${total}')`);
    },
    //Danh sách đơn hàng
    getOrderList: async (patient_id)=> {
        const res = await db.any("SELECT *, TO_CHAR(timeorder,'dd/MM/yyyy hh:MI:ss') AS timeorder FROM orders WHERE patient_id = $1",[patient_id]);
        
        return res;
    },
    getOrderDetailByOrderId: async (order_id)=>{
        const res = await db.any("SELECT * FROM order_detail, supplies WHERE order_detail.order_id = $1 AND supplies.supplies_id = order_detail.supplies_id",[order_id]);
        return res;
    },
    getOrderById: async (order_id) =>{
        const res = await db.any("SELECT * FROM orders WHERE order_id = $1",[order_id]);
        return res;
    },
    getOrderListDetail: async (patient_id)=> {
        const res = await db.any("SELECT *, TO_CHAR(orders.timeorder,'dd/MM/yyyy hh:MI:ss') AS timeorder, patient.status AS patient_status,orders.status AS order_status FROM orders,package,patient WHERE orders.patient_id = $1 AND orders.patient_id = patient.patient_id AND package.package_id = orders.package_id",[patient_id]);
        return res;
    },
    setOrderStatus: async(order_id)=>{
        await db.none(`UPDATE orders SET status = 1 WHERE order_id = $1`,[order_id]);
    },
    addPackageConsumption: async (package_id,date)=>{
        await db.none(`INSERT INTO package_consumption(package_id, date,consume)
        VALUES('${package_id}', '${date}', 1)`);
    },
    updatePackageConsumption: async (package_id,date)=>{
        await db.none(`UPDATE package_consumption SET consume = consume+1 WHERE package_id = $1 AND date = $2`,[package_id,date]);
    },
    isExistPackageConsumption: async(package_id,date)=>{
        const res = await db.any("SELECT * FROM package_consumption WHERE package_id=$1 AND date = $2", [package_id,date]);
        if(res.length == 0) return false;
        return true;
    },
    getOrderListByIdByDate: async(packageID,patient_id)=>{
        let now = new Date(Date.now());
        let day  = now.getUTCDate();
        let month = now.getUTCMonth()+1;
        let year = now.getUTCFullYear();
        let hour = now.getHours();
        let minutes = now.getMinutes();
        let second = now.getSeconds();
        const currentDate = `${year}-${month}-${day} ${hour}:${minutes}:${second}`;
        let lastDate = new Date(Date.now()-24*60*60*1000);
        day  = lastDate.getUTCDate();
        month = lastDate.getUTCMonth()+1;
        year = lastDate.getUTCFullYear();
        hour = lastDate.getHours();
        minutes = lastDate.getMinutes();
        second = lastDate.getSeconds();
        const lastDateStr = `${year}-${month}-${day} ${hour}:${minutes}:${second}`;
        const res = await db.any(`SELECT * from orders where package_id=$1 and timeorder >=$2 and timeorder <=$3 AND patient_id = $4`,[packageID,lastDateStr,currentDate,patient_id]);
        if(res.length==0) return null;
        return res;
    },
    getOrderListByIdByWeek: async(packageID,patient_id)=>{
        let now = new Date(Date.now());
        let day  = now.getUTCDate();
        let month = now.getUTCMonth()+1;
        let year = now.getUTCFullYear();
        let hour = now.getHours();
        let minutes = now.getMinutes();
        let second = now.getSeconds();
        const currentDate = `${year}-${month}-${day} ${hour}:${minutes}:${second}`;
        let lastDate = new Date(Date.now()-7*24*60*60*1000);
        day  = lastDate.getUTCDate();
        month = lastDate.getUTCMonth()+1;
        year = lastDate.getUTCFullYear();
        hour = lastDate.getHours();
        minutes = lastDate.getMinutes();
        second = lastDate.getSeconds();
        const lastDateStr = `${year}-${month}-${day} ${hour}:${minutes}:${second}`;
        const res = await db.any(`SELECT * from orders where package_id=$1 and timeorder >=$2 and timeorder <=$3 AND patient_id = $4`,[packageID,lastDateStr,currentDate,patient_id]);
        if(res.length==0) return null;
        return res;
    },
    getOrderListByIdByMonth: async(packageID)=>{
        let now = new Date(Date.now());
        let day  = now.getUTCDate();
        let month = now.getUTCMonth()+1;
        let year = now.getUTCFullYear();
        let hour = now.getHours();
        let minutes = now.getMinutes();
        let second = now.getSeconds();
        const currentDate = `${year}-${month}-${day} ${hour}:${minutes}:${second}`;
        let lastDate = new Date(Date.now()-30*24*60*60*1000);
        day  = lastDate.getUTCDate();
        month = lastDate.getUTCMonth()+1;
        year = lastDate.getUTCFullYear();
        hour = lastDate.getHours();
        minutes = lastDate.getMinutes();
        second = lastDate.getSeconds();
        const lastDateStr = `${year}-${month}-${day} ${hour}:${minutes}:${second}`;
        const res = await db.any(`SELECT * from orders where package_id=$1 and timeorder >=$2 and timeorder <=$3 AND patient_id = $4`,[packageID,lastDateStr,currentDate,patient_id]);
        if(res.length==0) return null;
        return res;
    },
    getListTreatmentHistoryById: async(patient_id)=>{
        const res = await db.any("SELECT *,TO_CHAR(update_time,'dd/mm/yyyy hh:mm:ss') AS update_time FROM treatment_history,treatment_place WHERE treatment_history.patient_id=$1 AND treatment_history.place_id = treatment_place.place_id", [patient_id]);
        if(res.length == 0) return null;
        return res;
    },
    getUserAccount: async(username)=>{
        const res = await db.one("SELECT * FROM account WHERE username=$1 ", [username]);
        if(res.length == 0) return null;
        return res;
    },
    changePassword: async(username, password) =>{
        var res = await db.none(`UPDATE account SET password = $1 WHERE username = $2`, [password,username]);
        return res;
    },
    getPaymentInfomation: async() =>{
        const res = await db.one(`SELECT * FROM payment`);
        if (res.length == 0) return null;
        return res;
    }
    
}

