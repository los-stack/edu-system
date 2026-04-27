const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware'); 
const roleMiddleware = require('../middlewares/roleMiddleware'); 
const { uploadCloud } = require('../config/cloudinary'); 
const PDFDocument = require('pdfkit');
const axios = require('axios');

const handleUpload = (req, res, next) => {
    uploadCloud.single('file')(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'Файл занадто великий. Максимальний розмір: 10 МБ.' });
            }
            return res.status(400).json({ error: 'Помилка при завантаженні файлу в хмару.' });
        }
        next();
    });
};

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

router.post('/:id/assignments', authMiddleware, roleMiddleware, handleUpload, async (req, res) => {
    try {
        const courseId = req.params.id;
        const { title, description, due_date } = req.body;
        
        const fileUrl = req.file ? req.file.path : null;

        const courseCheck = await db.query('SELECT * FROM courses WHERE id = $1', [courseId]);
        if (courseCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Курс не знайдено.' });
        }

        const newAssignment = await db.query(
            'INSERT INTO assignments (course_id, title, description, due_date, file_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [courseId, title, description, due_date, fileUrl]
        );

        try {
            const courseTitle = courseCheck.rows[0].title;
            const enrollments = await db.query('SELECT student_id FROM enrollments WHERE course_id = $1', [courseId]);

            if (enrollments.rows.length > 0) {
                const message = `Нове завдання: "${title}" у курсі "${courseTitle}"`;
                const link = `/course/${courseId}`;

                const notificationQueries = enrollments.rows.map(row => {
                    return db.query(
                        'INSERT INTO notifications (user_id, message, type, link) VALUES ($1, $2, $3, $4)',
                        [row.student_id, message, 'new_assignment', link]
                    );
                });

                await Promise.all(notificationQueries);
            }
        } catch (notifErr) {
            console.error(notifErr);
        }

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

router.get('/:id/students', authMiddleware, async (req, res) => {
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

        const result = await db.query(`
            SELECT 
                s.assignment_id, 
                s.student_id, 
                s.file_url, 
                u.name AS student_name,
                g.score,
                g.feedback
            FROM submissions s
            JOIN assignments a ON s.assignment_id = a.id
            JOIN users u ON s.student_id = u.id
            LEFT JOIN grades g ON g.assignment_id = s.assignment_id AND g.student_id = s.student_id
            WHERE a.course_id = $1
        `, [courseId]);

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Помилка отримання зданих робіт' });
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

router.get('/:id/analytics', authMiddleware, async (req, res) => {
    try {
        const courseId = req.params.id;

        const enrolledRes = await db.query('SELECT COUNT(*) FROM enrollments WHERE course_id = $1', [courseId]);
        const enrolledStudents = parseInt(enrolledRes.rows[0].count);

        const pendingRes = await db.query(`
            SELECT COUNT(*)
            FROM submissions s
            JOIN assignments a ON s.assignment_id = a.id
            LEFT JOIN grades g ON g.assignment_id = s.assignment_id AND g.student_id = s.student_id
            WHERE a.course_id = $1 AND g.score IS NULL
        `, [courseId]);
        const pendingReviews = parseInt(pendingRes.rows[0].count);
        const progressRes = await db.query(`
            WITH course_totals AS (
                SELECT 
                    (SELECT COUNT(*) FROM assignments WHERE course_id = $1) AS assignments_count,
                    (SELECT COUNT(*) FROM quizzes WHERE course_id = $1) AS quizzes_count
            ),
            completed_totals AS (
                SELECT 
                    (SELECT COUNT(DISTINCT (s.assignment_id, s.student_id)) 
                     FROM submissions s 
                     JOIN assignments a ON s.assignment_id = a.id 
                     WHERE a.course_id = $1) AS completed_assignments,
                    
                    (SELECT COUNT(DISTINCT (qr.quiz_id, qr.student_id)) 
                     FROM quiz_results qr 
                     JOIN quizzes q ON qr.quiz_id = q.id 
                     WHERE q.course_id = $1) AS completed_quizzes
            )
            SELECT 
                ct.assignments_count, 
                ct.quizzes_count, 
                cpt.completed_assignments, 
                cpt.completed_quizzes
            FROM course_totals ct CROSS JOIN completed_totals cpt
        `, [courseId]);

        let cohortProgress = 0;
        if (enrolledStudents > 0) {
            const data = progressRes.rows[0];
            const totalPossibleTasks = enrolledStudents * (parseInt(data.assignments_count) + parseInt(data.quizzes_count));
            const totalCompletedTasks = parseInt(data.completed_assignments) + parseInt(data.completed_quizzes);
            
            if (totalPossibleTasks > 0) {
                cohortProgress = Math.round((totalCompletedTasks / totalPossibleTasks) * 100);
            }
        }

        res.json({
            enrolledStudents,
            pendingReviews,
            cohortProgress 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Помилка при формуванні аналітики' });
    }
});


router.get('/:id/certificate', authMiddleware, async (req, res) => {
    try {
        const courseId = req.params.id;
        const studentId = req.user.id;

        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Сертифікати доступні лише студентам.' });
        }

        const progressRes = await db.query(`
            WITH course_totals AS (
                SELECT 
                    (SELECT COUNT(*) FROM assignments WHERE course_id = $1) AS total_assignments,
                    (SELECT COUNT(*) FROM quizzes WHERE course_id = $1) AS total_quizzes
            ),
            student_completed AS (
                SELECT 
                    (SELECT COUNT(*) FROM submissions s 
                     JOIN assignments a ON s.assignment_id = a.id 
                     LEFT JOIN grades g ON g.assignment_id = s.assignment_id AND g.student_id = s.student_id
                     WHERE a.course_id = $1 AND s.student_id = $2 AND g.score IS NOT NULL) AS graded_assignments,
                    
                    (SELECT COUNT(*) FROM quiz_results qr 
                     JOIN quizzes q ON qr.quiz_id = q.id 
                     WHERE q.course_id = $1 AND qr.student_id = $2) AS completed_quizzes
            )
            SELECT * FROM course_totals CROSS JOIN student_completed;
        `, [courseId, studentId]);

        const progressData = progressRes.rows[0];
        const totalTasks = parseInt(progressData.total_assignments) + parseInt(progressData.total_quizzes);
        const completedTasks = parseInt(progressData.graded_assignments) + parseInt(progressData.completed_quizzes);

        if (totalTasks === 0 || completedTasks < totalTasks) {
            return res.status(403).json({ error: 'Сертифікат недоступний. Виконайте всі завдання та отримайте за них оцінки.' });
        }

        // Якщо перевірка пройдена — продовжуємо генерацію
        const courseRes = await db.query('SELECT title FROM courses WHERE id = $1', [courseId]);
        if (courseRes.rows.length === 0) return res.status(404).json({ error: 'Курс не знайдено.' });
        const courseTitle = courseRes.rows[0].title;

        const userQuery = await db.query('SELECT name FROM users WHERE id = $1', [studentId]);
        const studentName = userQuery.rows[0]?.name || 'Студент';

        const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 0 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Certificate_${encodeURIComponent(courseTitle)}.pdf`);
        doc.pipe(res);

        const fontRegular = await axios.get('https://github.com/googlefonts/roboto/raw/main/src/hinted/Roboto-Regular.ttf', { responseType: 'arraybuffer' });
        const fontBold = await axios.get('https://github.com/googlefonts/roboto/raw/main/src/hinted/Roboto-Bold.ttf', { responseType: 'arraybuffer' });
        
        doc.registerFont('Roboto-Regular', fontRegular.data);
        doc.registerFont('Roboto-Bold', fontBold.data);

        doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(4).stroke('#2563eb');
        doc.rect(26, 26, doc.page.width - 52, doc.page.height - 52).lineWidth(1).stroke('#94a3b8');

        doc.font('Roboto-Bold').fontSize(20).fillColor('#2563eb').text('EPlatform', 50, 50, { align: 'left' });

        const centerXOptions = { align: 'center', width: doc.page.width };

        doc.font('Roboto-Bold').fontSize(45).fillColor('#0f172a').text('СЕРТИФІКАТ', 0, 130, centerXOptions);
        doc.font('Roboto-Regular').fontSize(16).fillColor('#64748b').text('ПРО УСПІШНЕ ПРОХОДЖЕННЯ КУРСУ', 0, 185, { ...centerXOptions, characterSpacing: 2 });
        
        doc.font('Roboto-Regular').fontSize(18).fillColor('#334155').text('Цим підтверджується, що', 0, 250, centerXOptions);
        
        doc.font('Roboto-Bold').fontSize(40).fillColor('#2563eb').text(studentName, 0, 285, centerXOptions);
        
        doc.font('Roboto-Regular').fontSize(18).fillColor('#334155').text('успішно завершив(ла) навчання за програмою курсу', 0, 350, centerXOptions);
        
        doc.font('Roboto-Bold').fontSize(26).fillColor('#0f172a').text(`«${courseTitle}»`, 0, 385, centerXOptions);

        const bottomY = 490;
        const footerLineLength = 200;
        const leftFooterX = 80;
        const rightFooterX = doc.page.width - 80 - footerLineLength;

        doc.font('Roboto-Regular').fontSize(14).fillColor('#64748b');
        
        const currentDate = new Date().toLocaleDateString('uk-UA');
        const certId = `ID: EP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        doc.text('Дата видачі:', leftFooterX, bottomY);
        doc.font('Roboto-Bold').text(currentDate, leftFooterX + 85, bottomY);
        doc.moveTo(leftFooterX, bottomY + 20).lineTo(leftFooterX + footerLineLength, bottomY + 20).lineWidth(1).stroke('#cbd5e1');
        
        doc.font('Roboto-Regular').text(certId, leftFooterX, bottomY + 30);

        doc.moveTo(rightFooterX, bottomY + 20).lineTo(rightFooterX + footerLineLength, bottomY + 20).lineWidth(1).stroke('#cbd5e1');
        doc.text('Підпис викладача', rightFooterX, bottomY + 25, { align: 'center', width: footerLineLength }); 

        doc.end();
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Помилка при генерації сертифіката' });
        }
    }
});

module.exports = router;