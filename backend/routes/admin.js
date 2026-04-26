const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware'); 

router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const result = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Помилка сервера при отриманні користувачів' });
    }
});

router.put('/users/:id/role', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const result = await db.query(
            'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, role',
            [role, id]
        );

        res.json({ message: 'Роль успішно оновлено', user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Помилка при оновленні ролі' });
    }
});

router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const userCheck = await db.query('SELECT role FROM users WHERE id = $1', [id]);
        
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Користувача не знайдено' });
        }

        if (userCheck.rows[0].role === 'admin') {
            return res.status(403).json({ error: 'Неможливо видалити адміністратора' });
        }

        await db.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: 'Користувача та всі його дані успішно видалено' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Помилка при видаленні користувача' });
    }
});

router.delete('/courses/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const courseCheck = await db.query('SELECT id FROM courses WHERE id = $1', [id]);
        
        if (courseCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Курс не знайдено' });
        }

        await db.query('DELETE FROM courses WHERE id = $1', [id]);
        res.json({ message: 'Курс успішно видалено' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Помилка при видаленні курсу' });
    }
});

module.exports = router;