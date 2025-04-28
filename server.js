import express from 'express';
import cors from 'cors';
import path from 'path';
import mysql from 'mysql2';

const app = express();
const port = 8001;

app.use(cors());

app.post('/debug', express.json(), (req, res) => {
  const debugMsg = req.body;
  console.log('[Client Debug]:', debugMsg);
  res.sendStatus(200);
});

// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'ragnarok', 
//   password: 'La_009296',
//   database: 'ragnarok'
// });

// db.connect((err) => {
//   if (err) {
//     console.error('Error connecting to MySQL:', err);
//     return;
//   }
//   console.log('Connected to MySQL database');
// });

app.get('/query', (req, res) => {
  const sql ='SHOW TABLES';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({error: 'Database query failed'});
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
