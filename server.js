const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'laporpakdes'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

app.post('/api/laporan', (req, res) => {
  const { nama, lokasi, isi, gambar } = req.body;
  
  const query = 'INSERT INTO laporan (nama, lokasi, isi, gambar) VALUES (?, ?, ?, ?)';
  
  db.query(query, [nama, lokasi, isi, gambar || null], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).json({ error: 'Gagal menyimpan laporan' });
      return;
    }
    res.json({ success: true, message: 'Laporan berhasil dikirim', id: result.insertId });
  });
});

app.get('/api/laporan', (req, res) => {
  const query = 'SELECT * FROM laporan ORDER BY id DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Gagal mengambil data laporan' });
      return;
    }
    res.json(results);
  });
});

app.get('/api/laporan/latest', (req, res) => {
  const lastId = req.query.lastId || 0;
  const query = 'SELECT * FROM laporan WHERE id > ? ORDER BY id ASC';
  
  db.query(query, [lastId], (err, results) => {
    if (err) {
      console.error('Error fetching latest data:', err);
      res.status(500).json({ error: 'Gagal mengambil data terbaru' });
      return;
    }
    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});