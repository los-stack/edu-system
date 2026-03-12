const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.post('/:id/grade', authMiddleware, roleMiddleware, async (req, res) => {
    try {
        const assignmentId = req.params.id; 
        const { student_id, score, feedback } = req.body; 

        const assignmentCheck = await db.query('SELECT * FROM assignments WHERE id = $1', [assignmentId]);
        if (assignmentCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Завдання не знайдено.' });
        }

        const newGrade = await db.query(
            'INSERT INTO grades (assignment_id, student_id, score, feedback) VALUES ($1, $2, $3, $4) RETURNING *',
            [assignmentId, student_id, score, feedback]
        );

        res.status(201).json({
            message: 'Оцінку успішно виставлено!',
            grade: newGrade.rows[0]
        });

    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Цей студент вже отримав оцінку за це завдання.' });
        }
        console.error(error.message);
        res.status(500).json({ error: 'Помилка при виставленні оцінки.' });
    }
});

module.exports = router;