const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { uploadCloud } = require('../config/cloudinary');

const handleUpload = (req, res, next) => {
    uploadCloud.single('file')(req, res, (err) => {
        if (err) {
            console.error('Помилка завантаження Cloudinary:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'Файл занадто великий. Максимальний розмір: 10 МБ.' });
            }
            return res.status(400).json({ error: err.message || 'Помилка при завантаженні файлу.' });
        }
        next();
    });
};

router.post('/:id/submit', authMiddleware, handleUpload, async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const studentId = req.user.id;
        
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Тільки студенти можуть здавати роботи.' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'Файл не вибрано або формат не підтримується.' });
        }

        const fileUrl = req.file.path; 

        const existing = await db.query(
            'SELECT * FROM submissions WHERE assignment_id = $1 AND student_id = $2',
            [assignmentId, studentId]
        );

        let result;
        if (existing.rows.length > 0) {
            result = await db.query(
                'UPDATE submissions SET file_url = $1, submitted_at = CURRENT_TIMESTAMP WHERE assignment_id = $2 AND student_id = $3 RETURNING *',
                [fileUrl, assignmentId, studentId]
            );
        } else {
            result = await db.query(
                'INSERT INTO submissions (assignment_id, student_id, file_url) VALUES ($1, $2, $3) RETURNING *',
                [assignmentId, studentId, fileUrl]
            );
        }
        
        const userQuery = await db.query('SELECT name FROM users WHERE id = $1', [studentId]);
        const studentName = userQuery.rows[0].name;
        
        const courseQuery = await db.query(`
            SELECT c.id as course_id, c.teacher_id, a.title 
            FROM assignments a 
            JOIN courses c ON a.course_id = c.id 
            WHERE a.id = $1
        `, [assignmentId]);

        if (courseQuery.rows.length > 0) {
            const { course_id, teacher_id, title } = courseQuery.rows[0];
            const message = `Студент ${studentName} здав роботу: "${title}"`;
            
            await db.query(
                'INSERT INTO notifications (user_id, message, type, link) VALUES ($1, $2, $3, $4)',
                [teacher_id, message, 'submission', `/course/${course_id}`]
            );
        }

        res.json({ message: 'Роботу успішно завантажено!', submission: result.rows[0] });
    } catch (err) {
        console.error('Помилка бази даних у /submit:', err);
        res.status(500).json({ error: 'Помилка при збереженні роботи в базу.' });
    }
});

router.post('/:id/grade', authMiddleware, roleMiddleware, async (req, res) => {
    try {
        const assignmentId = req.params.id; 
        const { student_id, score, feedback } = req.body; 

        const assignmentCheck = await db.query('SELECT course_id, title FROM assignments WHERE id = $1', [assignmentId]);
        if (assignmentCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Завдання не знайдено.' });
        }

        const courseId = assignmentCheck.rows[0].course_id;
        const assignmentTitle = assignmentCheck.rows[0].title;

        const newGrade = await db.query(
            'INSERT INTO grades (assignment_id, student_id, score, feedback) VALUES ($1, $2, $3, $4) RETURNING *',
            [assignmentId, student_id, score, feedback]
        );

        const message = `Ви отримали оцінку ${score}/100 за завдання "${assignmentTitle}"`;
        const link = `/course/${courseId}`; 
        
        await db.query(
            'INSERT INTO notifications (user_id, message, type, link) VALUES ($1, $2, $3, $4)',
            [student_id, message, 'grade', link]
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

        const courseQuery = await db.query(`
            SELECT c.id as course_id, c.teacher_id, a.title 
            FROM assignments a 
            JOIN courses c ON a.course_id = c.id 
            WHERE a.id = $1
        `, [assignmentId]);

        if (courseQuery.rows.length > 0) {
            const { course_id, teacher_id, title } = courseQuery.rows[0];
            
            if (req.user.id !== teacher_id) {
                const message = `Новий коментар від ${req.user.name} до завдання "${title}"`;
                await db.query(
                    'INSERT INTO notifications (user_id, message, type, link) VALUES ($1, $2, $3, $4)',
                    [teacher_id, message, 'comment', `/course/${course_id}`]
                );
            }
        }

        res.status(201).json({ message: 'Коментар додано', comment: commentData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Помилка при додаванні коментаря' });
    }
});

module.exports = router;