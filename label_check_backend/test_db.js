const pool = require('./db');

(async () => {
  try {
    const [rows] = await pool.query('SELECT 1');
    console.log('DB 연결 성공!', rows);
  } catch (err) {
    console.error('DB 연결 실패:', err.message);
  } finally {
    pool.end();
  }
})();