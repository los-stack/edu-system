const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();

router.post('/register', async (req, res) => {
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

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Користувача з таким email не знайдено' });
        }

        const user = userResult.rows[0];

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Невірний пароль' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Успішний вхід!',
            token, 
            user: { id: user.id, name: user.name, role: user.role }
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Помилка сервера під час входу' });
    }
});

module.exports = router;