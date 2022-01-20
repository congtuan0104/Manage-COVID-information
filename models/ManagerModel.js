const db = require("./dbConfig");
const storage = require("./firebaseConfig");
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
global.XMLHttpRequest = require("xhr2"); // must be used to avoid bug

module.exports = {
  //Tải ảnh lên firebase và lấy link về
  uploadImage: async (suppliesID, file) => {
    const timestamp = Date.now();
    const name = file.originalname.split(".")[0];
    const type = file.originalname.split(".")[1];
    const fileName = `${name}_${timestamp}.${type}`;
    // Step 1. Tạo tham chiếu tới firebase
    const imageRef = ref(storage, fileName);
    // Step 2. Tải ảnh lên
    const snapshot = await uploadBytes(imageRef, file.buffer);
    // Step 3. Lấy link ảnh về
    const downloadURL = await getDownloadURL(imageRef);
    console.log(downloadURL);
    // Step 4. Lưu link ảnh vào database
    const res = db.none(
      `INSERT INTO supplies_image(supplies_id,image_url) VALUES(${suppliesID},'${downloadURL}')`
    );
    if (res) {
      console.log(res);
      return 0;
    }
    return 1;
  },

  getNumberOfPage: async (tblName, nElementOfPage) => {
    let numberOfPage;
    const res = await db.any("SELECT COUNT(*) AS number FROM $1:name", tblName);
    if (res.length == 0) return null;
    numberOfPage = Math.ceil(
      parseInt(res[0].number) / parseInt(nElementOfPage)
    );
    return numberOfPage;
  },

  //Xem danh sách nhu yếu phẩm
  getSuppliesList: async (page) => {
    const res = await db.any(
      `SELECT * FROM Supplies ORDER BY supplies_id LIMIT 12 OFFSET $1`,
      [(page - 1) * 12]
    );
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
        WHERE p.Package_ID = pd.Package_ID AND Status=1
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

  getPatientByIdentityCard: async (identity_card) => {
    const res = await db.one("SELECT * FROM patient WHERE identity_card = $1", [
      identity_card,
    ]);
    if (res.length == 0) return null;
    return res;
  },

  getPatientDetail: async (patientID) => {
    const res = await db.one("SELECT * FROM patient WHERE patient_id=$1", [
      patientID,
    ]);
    if (res.length == 0) return null;
    return res;
  },

  getListTreatmentPlace: async () => {
    const res = await db.any("SELECT * FROM treatment_place");
    if (res.length == 0) return null;
    return res;
  },

  getTreatmentPlaceByID: async (placeID) => {
    const res = await db.one(
      "SELECT * FROM treatment_place WHERE place_id=$1",
      [placeID]
    );
    if (res.length == 0) return null;
    return res;
  },

  getTreatmentPlaceByName: async (place_name) => {
    const res = await db.one(
      "SELECT * FROM treatment_place WHERE place_name=$1",
      [place_name]
    );
    if (res.length == 0) return null;
    return res;
  },

  getListTreatmentPlace: async () => {
    const res = await db.any("SELECT * FROM treatment_place");
    if (res.length == 0) return null;
    return res;
  },
  // Thêm tài khoản 
  addNewAccount: async (username,modified_at,role)=>{
    await db.none(`INSERT INTO account(username, modified_at,role)
    VALUES('${username}', '${modified_at}', '${role}')`);
    const res = await db.one('SELECT * FROM account WHERE username =$1',username);
    if (res.length == 0) return null;
    return res;
},
isExistPatient: async(username)=>{
  const res = await db.any("SELECT * FROM account WHERE username=$1 ", [username]);
  if(res.length == 0) return false;
  return true;
},
  // Thêm người bệnh
  addPatient: async (
    patient_name,
    identity_card,
    birthday,
    address,
    status,
    username
  ) => {
    await db.none(`INSERT INTO patient(patient_name, identity_card,birthday,address,status,username)
        VALUES('${patient_name}', '${identity_card}','${birthday}','${address}','${status}','${username}')`);
  },

  //Thêm một sản phẩm mới và lấy id của sản phẩm đó
  // Sửa thông tin người bệnh
  updatePatientInfor: async (
    patientID,
    patient_name,
    identity_card,
    birthday,
    address,
    status,
    place_id
  ) => {
    const res = await db.none(
      `
      UPDATE patient
      SET patient_name=$2,  identity_card=$3, birthday = $4, address = $5, status = $6, place_id = $7
      WHERE patient_id = $1`,
      [
        patientID,
        patient_name,
        identity_card,
        birthday,
        address,
        status,
        place_id,
      ]
    );
    if (res) {
      console.log(res);
      return 0;
    }
    return 1;
  },

  updatePatientStatus: async (patientID, patient_status) => {
    const res = await db.none(
      `
    UPDATE patient
    SET status = $2
    WHERE patient_id = $1`,
      [patientID, patient_status]
    );
    if (res) {
      console.log(res);
      return 0;
    }
    return 1;
  },

  addRelatedPatient: async (patient_id1, patient_id2) => {
    await db.none(`INSERT INTO related_patients(patient_id1, patient_id2)
        VALUES('${patient_id1}', '${patient_id2}')`);
  },

  addAccount: async (username) => {
    await db.none(`INSERT INTO account(username, role)
        values ('${username}', 0)`);
  },

  //Thêm một sản phẩm mới
  addSupplies: async (productName, price, unit) => {
    const insert = await db.none(`
        INSERT INTO supplies(supplies_name,price,unit)
          VALUES('${productName}',${price},'${unit}')`);
    if (insert) {
      console.log(insert);
      return null;
    }
    const suppliesID = await db.any(
      `SELECT supplies_id FROM supplies WHERE supplies_name='${productName}'`
    );
    if (suppliesID.length == 0) return null;
    return suppliesID.at(0).supplies_id;
  },

  //Sửa thông tín sản phẩm
  updateSupplies: async (suppliesID, suppliesName, price, unit) => {
    const res = await db.none(
      `
        UPDATE supplies
         SET supplies_name=$1, price=$2, unit=$3
         WHERE supplies_id=$4`,
      [suppliesName, price, unit, suppliesID]
    );
    if (res) {
      console.log(res);
      return 0;
    }
    return 1;
  },

  //Xoá sản phẩm
  deleteSupplies: async (suppliesID) => {
    const res = await db.none(`DELETE FROM supplies WHERE supplies_id=$1`, [
      suppliesID,
    ]);
    if (res) {
      console.log(res);
      return 0;
    }
    return 1;
  },

  //Thêm thông tin gói nhu yếu phẩm
  addPackage: async (packageName, limit, limitTime) => {
    const insert =
      await db.none(`INSERT INTO package(package_name,package_limit,time_limit)
             VALUES('${packageName}',${limit},'${limitTime}')`);
    if (insert) {
      console.log(insert);
      return null;
    }
    const package_id = await db.any(
      `SELECT package_id FROM package WHERE package_name='${packageName}'`
    );
    if (package_id == null) return null;
    return package_id.at(0).package_id;
  },

  //Thêm chi tiết gói sản phẩm
  addPackageDetail: async (packageID, suppliesID, quantityLimit) => {
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
  getPackageDetail: async (packageID) => {
    const res = await db.any("SELECT * FROM package WHERE package_id=$1", [
      packageID,
    ]);
    if (res.length == 0) return null;
    return res;
  },

  // Lấy danh sách các sản phẩm trong gói nhu yếu phẩm
  getSuppliesOfPackage: async (packageID) => {
    const res = await db.any(
      `SELECT p.supplies_id, supplies_name, quantity_limit
                                 FROM package_detail p, supplies s 
                                WHERE package_id=$1 AND p.supplies_id=s.supplies_id`,
      [packageID]
    );
    if (res.length == 0) return null;
    return res;
  },

  // Lấy danh sách các sản phẩm không nằm trong gói nhu yếu phẩm
  getRemainingPackage: async (packageID) => {
    const res = await db.any(
      `SELECT supplies_id, supplies_name from supplies where supplies_id not in
        (SELECT supplies_id FROM package_detail WHERE package_id=$1)`,
      [packageID]
    );
    if (res.length == 0) return null;
    return res;
  },

  //Xoá gói sản phẩm
  deletePackage: async (packageID) => {
    const res = await db.none(
      `UPDATE package SET status = 0 WHERE package_id=$1`,
      [packageID]
    );
    if (res) {
      console.log(res);
      return 0;
    }
    return 1;
  },

  //Lấy số liệu thống kê của một ngày
  getStatistic: async (date) => {
    const res = await db.one(`SELECT *, TO_CHAR(date,'dd-mm-yyyy') AS date
         FROM statistical WHERE date='${date}'`);
    if (res.length == 0) return null;
    return res;
  },

  //Lấy số liệu thống kê trong khoảng thời gian
  getRangeStatistic: async (start, end, orderBy) => {
    const res = await db.any(
      `SELECT *, TO_CHAR(date,'dd-mm-yyyy') AS date 
        FROM statistical WHERE date>='${start}' AND date<='${end}'
        ORDER BY TO_CHAR(date,'dd-mm-yyyy') $1:raw`,
      orderBy
    );
    if (res.length == 0) return null;
    return res;
  },

  getTotalCases: async (date) => {
    const res =
      await db.one(`SELECT SUM(f0) AS TotalCases, SUM(cured) AS TotalRecovered
         FROM statistical WHERE date<='${date}'`);
    if (res.length == 0) return null;
    return res;
  },
};
