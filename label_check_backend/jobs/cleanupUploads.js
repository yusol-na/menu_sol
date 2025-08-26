// jobs/cleanupUploads.js
const fs = require('fs/promises');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const TTL_MS = 60 * 60 * 1000; // 1시간 이상 지난 파일 제거

async function cleanup() {
  try {
    const files = await fs.readdir(UPLOAD_DIR);
    const now = Date.now();
    for (const f of files) {
      const p = path.join(UPLOAD_DIR, f);
      const st = await fs.stat(p);
      if (now - st.mtimeMs > TTL_MS) {
        await fs.unlink(p);
      }
    }
    // console.log(`[CLEANUP] done: ${files.length} checked`);
  } catch (e) {
    console.error('[CLEANUP] fail:', e.message);
  }
}

module.exports = { cleanup };