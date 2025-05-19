import express from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';

// 创建Express应用
const app = express();

// 定义一个简单的路由
app.get('/get_file', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  const filePath = path.join(process.cwd(), 'data/maps/prt_fild06.gat');
  const fileStats = fs.statSync(filePath);
  const etag = fileStats.size + '-' + fileStats.mtime.getTime();
  res.setHeader('ETag', etag);
  const ifNoneMatch = req.headers['if-none-match'];
  console.log("ifNoneMatch: ",ifNoneMatch)
  if (ifNoneMatch && ifNoneMatch === etag) {
      console.log("304 Not Modified")
      res.status(304).end(); // 返回 304 Not Modified
      return;
  }
  // res.setHeader('Cache-Control', 'public, immutable, max-age=31536000');
  console.log("200 OK")
  res.sendFile(filePath);
});

// 读取SSL证书和私钥
const options = {
  key: fs.readFileSync('key.pem'), // 私钥文件路径
  cert: fs.readFileSync('cert.pem'), // 证书文件路径
  passphrase: '009296'
};

// 创建HTTPS服务器
const httpsServer = https.createServer(options, app);

// 监听端口
const PORT = 8080;
httpsServer.listen(PORT, () => {
  console.log(`HTTPS server is running on port ${PORT}`);
});