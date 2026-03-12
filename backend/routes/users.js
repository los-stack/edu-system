const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware'); 

router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const userResult = await db.query(
            'SELECT id, name, email, role, created_at FROM users WHERE id = $1', 
            [req.user.id]
        );
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'Користувача не знайдено' });
        }

        res.json(userResult.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});

router.get('/my-grades', authMiddleware, async (req, res) => {
    try {
        const studentId = req.user.id;

        const query = `
            SELECT g.score, g.feedback, g.graded_at, a.title AS assignment_title, c.title AS course_title
            FROM grades g
            JOIN assignments a ON g.assignment_id = a.id
            JOIN courses c ON a.course_id = c.id
            WHERE g.student_id = $1
            ORDER BY g.graded_at DESC
        `;

        const grades = await db.query(query, [studentId]);
        res.json(grades.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Помилка при отриманні оцінок' });
    }
});

module.exports = router;