const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware'); 
const roleMiddleware = require('../middlewares/roleMiddleware'); 
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.get('/', authMiddleware, async (req, res) => {
    try {
        const query = `
            SELECT c.id, c.title, c.description, u.name AS teacher_name 
            FROM courses c
            JOIN users u ON c.teacher_id = u.id
            ORDER BY c.created_at DESC
        `;
        const courses = await db.query(query);
        res.json(courses.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Помилка сервера при отриманні курсів' });
    }
});

router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const courseId = req.params.id;
        const course = await db.query('SELECT * FROM courses WHERE id = $1', [courseId]);
        
        if (course.rows.length === 0) {
            return res.status(404).json({ error: 'Курс не знайдено' });
        }
        
        res.json(course.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Помилка при отриманні курсу' });
    }
});

router.post('/', authMiddleware, roleMiddleware, async (req, res) => {
    try {
        const { title, description } = req.body;
        const teacherId = req.user.id;

        const newCourse = await db.query(
            'INSERT INTO courses (title, description, teacher_id) VALUES ($1, $2, $3) RETURNING *',
            [title, description, teacherId]
        );

        res.status(201).json({
            message: 'Курс успішно створено!',
            course: newCourse.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Помилка при створенні курсу' });
    }
});

router.post('/:id/enroll', authMiddleware, async (req, res) => {
    try {
        const courseId = req.params.id; 
        const studentId = req.user.id;  

        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Тільки студенти можуть записуватися на курси.' });
        }

        const courseCheck = await db.query('SELECT * FROM courses WHERE id = $1', [courseId]);
        if (courseCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Курс не знайдено.' });
        }

        await db.query(
            'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2)',
            [studentId, courseId]
        );

        res.status(201).json({ message: 'Ви успішно записалися на курс!' });

    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Ви вже записані на цей курс.' });
        }
        console.error(error.message);
        res.status(500).json({ error: 'Помилка сервера при записі на курс.' });
    }
});

router.post('/:id/assignments', authMiddleware, roleMiddleware, upload.single('file'), async (req, res) => {
    try {
        const courseId = req.params.id;
        const { title, description, due_date } = req.body;
        
        const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const courseCheck = await db.query('SELECT * FROM courses WHERE id = $1', [courseId]);
        if (courseCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Курс не знайдено.' });
        }

        const newAssignment = await db.query(
            'INSERT INTO assignments (course_id, title, description, due_date, file_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [courseId, title, description, due_date, fileUrl]
        );

        res.status(201).json({
            message: 'Завдання успішно створено!',
            assignment: newAssignment.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Помилка при створенні завдання.' });
    }
});

router.get('/:id/assignments', authMiddleware, async (req, res) => {
    try {
        const courseId = req.params.id;

        const assignments = await db.query(
            'SELECT * FROM assignments WHERE course_id = $1 ORDER BY due_date ASC',
            [courseId]
        );

        res.json(assignments.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Помилка при отриманні завдань.' });
    }
});

router.get('/:id/students', authMiddleware, roleMiddleware, async (req, res) => {
    try {
        const courseId = req.params.id;
        
        const query = `
            SELECT u.id, u.name, u.email 
            FROM users u
            JOIN enrollments e ON u.id = e.student_id
            WHERE e.course_id = $1
        `;
        const students = await db.query(query, [courseId]);
        
        res.json(students.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Помилка при отриманні списку студентів' });
    }
});

router.get('/:id/submissions', authMiddleware, async (req, res) => {
    try {
        const courseId = req.params.id;
        
        let query = `
            SELECT s.assignment_id, s.student_id, s.file_url, u.name AS student_name 
            FROM submissions s
            JOIN assignments a ON s.assignment_id = a.id
            JOIN users u ON s.student_id = u.id
            WHERE a.course_id = $1
        `;
        const params = [courseId];

        if (req.user.role === 'student') {
            query += ` AND s.student_id = $2`;
            params.push(req.user.id);
        }

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Помилка отримання робіт' });
    }
});

router.get('/:id/comments', authMiddleware, async (req, res) => {
    try {
        const courseId = req.params.id;
        
        const query = `
            SELECT c.id, c.assignment_id, c.user_id, c.text, c.created_at, u.name AS user_name, u.role AS user_role
            FROM comments c
            JOIN assignments a ON c.assignment_id = a.id
            JOIN users u ON c.user_id = u.id
            WHERE a.course_id = $1
            ORDER BY c.created_at ASC
        `;
        
        const result = await db.query(query, [courseId]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Помилка отримання коментарів' });
    }
});

module.exports = router;