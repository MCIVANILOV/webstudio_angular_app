// api/index.js - Serverless Function для Vercel

const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// Логирование
app.use((req, res, next) => {
  console.log('🚀 API HIT:', req.method, req.originalUrl, req.path);
  next();
});

// Тестовый маршрут
app.get('/test', (req, res) => {
  console.log('✅ TEST ROUTE WORKS!');
  res.json({ 
    message: 'API работает!', 
    url: req.url, 
    path: req.path,
    method: req.method,
    time: new Date().toISOString()
  });
});

// Обработка ошибок
app.use((req, res) => {
  console.log('❌ 404 Not Found:', req.path);
  res.status(404).json({ error: 'Not found', path: req.path });
});

module.exports = app;
