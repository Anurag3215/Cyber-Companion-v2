'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const APK_DIR = path.resolve(__dirname, '../client/android/app/build/outputs/apk/debug');

const server = http.createServer((req, res) => {
  const safePath = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
  const targetFile = safePath === '/' || safePath === '' ? 'app-debug.apk' : safePath;
  const filePath = path.join(APK_DIR, targetFile);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const stat = fs.statSync(filePath);
    res.writeHead(200, {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Length': stat.size,
      'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`,
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('APK build not found.');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[APK Server] Pure Node.js file server running on http://0.0.0.0:${PORT}/app-debug.apk`);
});
