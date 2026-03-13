const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, 'student-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.post('/:id/submit', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const studentId = req.user.id;
        
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Тільки студенти можуть здавати роботи.' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'Файл не вибрано.' });
        }

        const fileUrl = `/uploads/${req.file.filename}`;

        const query = `
            INSERT INTO submissions (assignment_id, student_id, file_url) 
            VALUES ($1, $2, $3)
            ON CONFLICT (assignment_id, student_id) 
            DO UPDATE SET file_url = EXCLUDED.file_url, submitted_at = CURRENT_TIMESTAMP
            RETURNING *;
        `;
        const result = await db.query(query, [assignmentId, studentId, fileUrl]);
        
        res.json({ message: 'Роботу успішно завантажено!', submission: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Помилка при завантаженні роботи.' });
    }
});

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

router.post('/:id/comments', authMiddleware, async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const userId = req.user.id;
        const { text } = req.body;

        if (!text) return res.status(400).json({ error: 'Текст коментаря не може бути порожнім' });

        const newComment = await db.query(
            'INSERT INTO comments (assignment_id, user_id, text) VALUES ($1, $2, $3) RETURNING *',
            [assignmentId, userId, text]
        );
        
        const userQuery = await db.query('SELECT name, role FROM users WHERE id = $1', [userId]);
        const commentData = { 
            ...newComment.rows[0], 
            user_name: userQuery.rows[0].name, 
            user_role: userQuery.rows[0].role 
        };

        res.status(201).json({ message: 'Коментар додано', comment: commentData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Помилка при додаванні коментаря' });
    }
});

module.exports = router;