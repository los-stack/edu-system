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
        await db.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: 'Користувача та всі його дані успішно видалено' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Помилка при видаленні користувача' });
    }
});

module.exports = router;