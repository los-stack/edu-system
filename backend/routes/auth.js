const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { body, validationResult } = require('express-validator'); 

const router = express.Router();

router.post('/register', [
    body('name')
        .trim()
        .notEmpty().withMessage('Ім\'я є обов\'язковим')
        .isLength({ min: 2, max: 50 }).withMessage('Ім\'я має бути від 2 до 50 символів')
        .escape(), 

    body('email')
        .trim()
        .notEmpty().withMessage('Email є обов\'язковим')
        .isEmail().withMessage('Некоректний формат email-адреси')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Пароль є обов\'язковим')
        .isLength({ min: 6 }).withMessage('Пароль має містити мінімум 6 символів')
        .matches(/\d/).withMessage('Пароль має містити хоча б одну цифру'),

    body('role')
        .optional()
        .isIn(['student', 'teacher', 'admin']).withMessage('Вказана недопустима роль')
], async (req, res) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
        const { name, email, password, role } = req.body;

        const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Користувач з таким email вже існує' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await db.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, hashedPassword, role || 'student']
        );

        res.status(201).json({
            message: 'Користувача успішно зареєстровано!',
            user: newUser.rows[0]
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Помилка сервера під час реєстрації' });
    }
});


router.post('/login', [
    body('email')
        .trim()
        .notEmpty().withMessage('Введіть email')
        .isEmail().withMessage('Некоректний формат email')
        .normalizeEmail(),
        
    body('password')
        .notEmpty().withMessage('Введіть пароль')
], async (req, res) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
        const { email, password } = req.body;

        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Невірний email або пароль' }); 
        }

        const user = userResult.rows[0];

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Невірний email або пароль' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secretkey', 
            { expiresIn: '24h' }
        );

        res.cookie('token', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 
        });

        res.json({
            message: 'Успішний вхід!',
            user: { id: user.id, name: user.name, role: user.role }
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Помилка сервера під час входу' });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token'); 
    res.json({ message: 'Вихід успішний' });
});

module.exports = router;