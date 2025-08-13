const pool = require('./db');

(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('연결 OK');
    const [rows] = await conn.query('SELECT 1 AS ok');
    console.log(rows);
    conn.release();
  } catch (err) {
    console.error('실패:', err.code, err.message);
  } finally {
    await pool.end();
  }
})();