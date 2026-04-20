const express = require('express');
const router = express.Router();

const db = require('../config/db'); 
const authMiddleware = require('../middlewares/authMiddleware'); 

router.get('/', authMiddleware, async (req, res) => {
    try {
        const notifications = await db.query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
            [req.user.id]
        );
        res.json(notifications.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Помилка сервера при отриманні сповіщень' });
    }
});

router.put('/read-all', authMiddleware, async (req, res) => {
    try {
        await db.query(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE',
            [req.user.id]
        );
        res.json({ message: 'Усі сповіщення позначено як прочитані' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Помилка сервера при оновленні сповіщень' });
    }
});

module.exports = router;