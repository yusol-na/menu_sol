const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '192.168.1.96',
  port: 3307,
  user: 'wjdwnsqja1',
  password: 'smhrd1234',
  database: 'ocr',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;