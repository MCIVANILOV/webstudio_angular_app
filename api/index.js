// api/index.js - ЕДИНСТВЕННАЯ Serverless Function для Vercel

const app = require('../lib/app.js');

// Добавим лог для отладки
app.use((req, res, next) => {
    console.log('🚀 API HIT:', req.method, req.originalUrl, req.path);
    next();
});

// Добавим тестовый маршрут
app.get('/test', (req, res) => {
    console.log('✅ TEST ROUTE WORKS!');
    res.json({
        message: 'API работает!',
        url: req.url,
        path: req.path,
        method: req.method
    });
});

module.exports = app;