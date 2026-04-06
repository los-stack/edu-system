const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware'); 
const bcrypt = require('bcrypt'); 
const multer = require('multer'); 
const path = require('path');   

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        cb(null, 'avatar-' + req.user.id + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const userResult = await db.query(
            'SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = $1', 
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

router.post('/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Файл не завантажено' });
    }
    
    const avatarUrl = `/uploads/${req.file.filename}`;
    
    try {
        await db.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatarUrl, req.user.id]);
        res.json({ avatar_url: avatarUrl, message: 'Аватарку успішно оновлено!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Помилка бази даних при збереженні аватарки' });
    }
});

router.put('/password', authMiddleware, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const userRes = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'Користувача не знайдено' });
        
        const user = userRes.rows[0];
        let validPassword = false;

        try {
            validPassword = await bcrypt.compare(currentPassword, user.password_hash);
        } catch (compareErr) {
            validPassword = (currentPassword === user.password_hash);
        }

        if (!validPassword) {
            return res.status(400).json({ error: 'Неправильний поточний пароль' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, req.user.id]);
        res.json({ message: 'Пароль успішно змінено!' });

    } catch (err) {
        console.error('Помилка зміни пароля:', err);
        res.status(500).json({ error: 'Помилка сервера при зміні пароля' });
    }
});

module.exports = router;