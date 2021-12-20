//config kết nối postgres db tại đây (chưa config)

const sql = require('mssql/msnodesqlv8');

const config = {
    user: 'PCT',
    password: '1234',
    server: 'CONGTUAN',
    driver: 'msnodesqlv8',
    database: 'DoAn02',
    port: 1433,
    options: {
        trustedConnection: true
    }
}

module.exports = config;
