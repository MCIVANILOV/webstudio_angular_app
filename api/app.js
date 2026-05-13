const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const categoryRoutes = require('./src/routes/category.routes');
const articleRoutes = require('./src/routes/article.routes');
const requestRoutes = require('./src/routes/request.routes');
const commentRoutes = require('./src/routes/comment.routes');
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const config = require("./src/config/config");
const UserModel = require("./src/models/user.model");

const app = express();

// --- ОПТИМИЗАЦИЯ ПОДКЛЮЧЕНИЯ К MONGODB (SERVERLESS CACHE) ---
let isConnected = false;

async function connectToDatabase() {
    if (isConnected) {
        return;
    }
    try {
        // Берем переменную из Vercel Environment Variables
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error("Переменная окружения MONGODB_URI не задана в настройках Vercel");
        }

        await mongoose.connect(mongoURI);
        isConnected = true;
        console.log('MongoDB connected successfully via Vercel Serverless');
    } catch (error) {
        console.error('Db connection error:', error);
        throw error;
    }
}

// Middleware для автоматического подключения к БД при каждом запросе
app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (err) {
        res.status(500).send({ error: true, message: "Database connection failed" });
    }
});

// --- НАСТРОЙКИ EXPRESS MIDDLEWARES ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

// --- НАСТРОЙКА PASSPORT JWT ---
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('x-auth'),
    secretOrKey: config.secret,
    algorithms: ["HS256"],
}, async (payload, next) => {
    if (!payload.id) {
        const error = new Error('Не валидный токен');
        error.status = 401;
        return next(error);
    }

    try {
        const user = await UserModel.findOne({ _id: payload.id });
        if (user) {
            if (!user.refreshToken) {
                const error = new Error('Ошибка авторизации');
                error.status = 401;
                return next(error);
            }
            return next(null, payload);
        }
    } catch (e) {
        console.log(e);
        const error = new Error('Ошибка базы данных при проверке токена');
        error.status = 500;
        return next(error);
    }

    const error = new Error('Пользователь не найден');
    error.status = 401;
    next(error);
}));

app.use(passport.initialize());

// --- МАРШРУТЫ (API ROUTES) ---
app.use(authRoutes);
app.use("/categories", categoryRoutes);
app.use("/articles", articleRoutes);
app.use("/requests", requestRoutes);
app.use("/comments", commentRoutes);
app.use("/users", userRoutes);

// --- ОБРАБОТКА ОШИБОК ---
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function (err, req, res, next) {
    res.status(err.statusCode || err.status || 500).send({ error: true, message: err.message });
});

// --- ЭКСПОРТ ДЛЯ VERCEL (СТРОГО В КОРНЕ ФАЙЛА) ---
module.exports = app;