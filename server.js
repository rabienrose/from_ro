import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';


const app = express();
const port = 8002;

app.use(cors());

app.post('/debug', express.json(), (req, res) => {
  const debugMsg = req.body;
  console.log('[Client Debug]:', debugMsg);
  res.sendStatus(200);
});
// 设置静态文件目录
app.use(express.static('data'));
// 捕获所有请求，检查文件是否存在
app.use((req, res, next) => {
    const filePath = path.join(process.cwd(), 'data', req.path);

    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    }else{
      console.error(`File found on folder: ${filePath}`);
      res.status(404).send('404 Not Found');
    }
    
    // fs.access(filePath, fs.constants.F_OK, (err) => {
    //     if (err) {
    //       console.log("file not exist: ", filePath);
            
    //     } else {
    //         res.sendFile(filePath);
    //     }
    // });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
