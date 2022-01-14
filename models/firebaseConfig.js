const firebase = require('firebase/app');
const {getStorage, ref} = require('firebase/storage');

const config = {
    apiKey: "AIzaSyA43pCrzwOfnhkZV0TfQD5DHS2Exjse-uw",
    authDomain: "covid-19-infor-management.firebaseapp.com",
    projectId: "covid-19-infor-management",
    storageBucket: "covid-19-infor-management.appspot.com",
    messagingSenderId: "926293549336",
    appId: "1:926293549336:web:511fb9901ab8b2b3d8be6d",
    measurementId: "G-H67RFQ1H4T"
};

const fb = firebase.initializeApp(config);
const storage = getStorage(fb);

module.exports = storage;

