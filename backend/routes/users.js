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

router.get('/my-deadlines', authMiddleware, async (req, res) => {
    try {
        const studentId = req.user.id;

        const query = `
            SELECT a.id, a.title, a.due_date, c.title AS course_title
            FROM assignments a
            JOIN enrollments e ON a.course_id = e.course_id
            JOIN courses c ON a.course_id = c.id
            WHERE e.student_id = $1 AND a.due_date >= CURRENT_DATE
            ORDER BY a.due_date ASC
        `;

        const deadlines = await db.query(query, [studentId]);
        res.json(deadlines.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Помилка при отриманні дедлайнів' });
    }
});

router.get('/my-enrollments', authMiddleware, async (req, res) => {
    try {
        const result = await db.query('SELECT course_id FROM enrollments WHERE student_id = $1', [req.user.id]);
        
        const enrolledIds = result.rows.map(row => row.course_id);
        
        res.json(enrolledIds);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Помилка отримання підписок' });
    }
});

module.exports = router;