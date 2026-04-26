const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/course/:courseId', authMiddleware, async (req, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Тільки викладачі можуть створювати тести.' });

    const courseId = req.params.courseId;
    const { title, description, questions } = req.body; 

    try {
        await db.query('BEGIN'); 

        const quizRes = await db.query(
            'INSERT INTO quizzes (course_id, title, description) VALUES ($1, $2, $3) RETURNING id',
            [courseId, title, description]
        );
        const quizId = quizRes.rows[0].id;

        for (let q of questions) {
            const qRes = await db.query(
                'INSERT INTO questions (quiz_id, question_text) VALUES ($1, $2) RETURNING id',
                [quizId, q.text]
            );
            const questionId = qRes.rows[0].id;

            for (let opt of q.options) {
                await db.query(
                    'INSERT INTO answers (question_id, answer_text, is_correct) VALUES ($1, $2, $3)',
                    [questionId, opt.text, opt.isCorrect]
                );
            }
        }

        await db.query('COMMIT'); 

        try {
            const courseRes = await db.query('SELECT title FROM courses WHERE id = $1', [courseId]);
            const courseTitle = courseRes.rows[0]?.title || 'Курс';

            const enrollments = await db.query('SELECT student_id FROM enrollments WHERE course_id = $1', [courseId]);

            if (enrollments.rows.length > 0) {
                const message = `Новий тест: "${title}" у курсі "${courseTitle}"`;
                const link = `/course/${courseId}`;

                const notificationQueries = enrollments.rows.map(row => {
                    return db.query(
                        'INSERT INTO notifications (user_id, message, type, link) VALUES ($1, $2, $3, $4)',
                        [row.student_id, message, 'new_quiz', link]
                    );
                });

                await Promise.all(notificationQueries);
            }
        } catch (notifErr) {
            console.error('Помилка розсилки сповіщень про тест:', notifErr);
        }

        res.status(201).json({ message: 'Тест успішно створено!', quizId });
    } catch (error) {
        await db.query('ROLLBACK'); 
        console.error(error);
        res.status(500).json({ error: 'Помилка при збереженні тесту.' });
    }
});

router.get('/course/:courseId', authMiddleware, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM quizzes WHERE course_id = $1 ORDER BY created_at DESC', [req.params.courseId]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Помилка отримання тестів' });
    }
});

router.get('/:quizId', authMiddleware, async (req, res) => {
    try {
        const quizId = req.params.quizId;
        
        const quizRes = await db.query('SELECT * FROM quizzes WHERE id = $1', [quizId]);
        if (quizRes.rows.length === 0) return res.status(404).json({ error: 'Тест не знайдено' });
        const quiz = quizRes.rows[0];

        const qRes = await db.query('SELECT id, question_text FROM questions WHERE quiz_id = $1', [quizId]);
        const questions = qRes.rows;

        if (questions.length === 0) {
            return res.json({ ...quiz, questions: [] });
        }

        const questionIds = questions.map(q => q.id);
        const aRes = await db.query(
            'SELECT id, question_id, answer_text FROM answers WHERE question_id = ANY($1::int[])',
            [questionIds]
        );

        const fullQuestions = questions.map(q => ({
            ...q,
            options: aRes.rows.filter(a => a.question_id === q.id)
        }));

        res.json({ ...quiz, questions: fullQuestions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Помилка завантаження тесту' });
    }
});

router.post('/:quizId/submit', authMiddleware, async (req, res) => {
    try {
        const quizId = req.params.quizId;
        const studentId = req.user.id;
        const { answers } = req.body; 

        const checkRes = await db.query('SELECT * FROM quiz_results WHERE quiz_id = $1 AND student_id = $2', [quizId, studentId]);
        if (checkRes.rows.length > 0) {
            return res.status(400).json({ error: 'Ви вже проходили цей тест. Повторна здача заборонена.' });
        }

        let correctCount = 0;
        const qRes = await db.query('SELECT id FROM questions WHERE quiz_id = $1', [quizId]);
        const totalQuestions = qRes.rows.length;

        for (const [qId, ansId] of Object.entries(answers)) {
            const isCorrectRes = await db.query('SELECT is_correct FROM answers WHERE id = $1', [ansId]);
            if (isCorrectRes.rows.length > 0 && isCorrectRes.rows[0].is_correct) {
                correctCount++;
            }
        }

        const score = Math.round((correctCount / totalQuestions) * 100);

        await db.query(
            'INSERT INTO quiz_results (quiz_id, student_id, score) VALUES ($1, $2, $3)',
            [quizId, studentId, score]
        );

        try {
            const userQuery = await db.query('SELECT name FROM users WHERE id = $1', [studentId]);
            const studentName = userQuery.rows[0].name;

            const quizInfoRes = await db.query(`
                SELECT q.title, c.id as course_id, c.teacher_id 
                FROM quizzes q 
                JOIN courses c ON q.course_id = c.id 
                WHERE q.id = $1
            `, [quizId]);

            if (quizInfoRes.rows.length > 0) {
                const { title, course_id, teacher_id } = quizInfoRes.rows[0];
                const message = `Студент ${studentName} здав тест "${title}" на ${score}/100`;
                
                await db.query(
                    'INSERT INTO notifications (user_id, message, type, link) VALUES ($1, $2, $3, $4)',
                    [teacher_id, message, 'grade', `/course/${course_id}`]
                );
            }
        } catch (notifErr) {
            console.error('Помилка надсилання сповіщення викладачу про здачу тесту:', notifErr);
        }

        res.json({ message: 'Тест успішно завершено!', score });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Помилка при перевірці тесту' });
    }
});

router.get('/:quizId/results', authMiddleware, async (req, res) => {
    if (req.user.role !== 'teacher') {
        return res.status(403).json({ error: 'Тільки викладачі можуть бачити результати.' });
    }

    try {
        const quizId = req.params.quizId;
        
        const result = await db.query(`
            SELECT qr.score, qr.completed_at, u.name as student_name, u.email
            FROM quiz_results qr
            JOIN users u ON qr.student_id = u.id
            WHERE qr.quiz_id = $1
            ORDER BY qr.score DESC, qr.completed_at ASC
        `, [quizId]);

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Помилка отримання результатів тесту' });
    }
});

router.get('/my-results/:courseId', authMiddleware, async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const studentId = req.user.id;

        const result = await db.query(`
            SELECT qr.quiz_id, qr.score 
            FROM quiz_results qr
            JOIN quizzes q ON qr.quiz_id = q.id
            WHERE q.course_id = $1 AND qr.student_id = $2
        `, [courseId, studentId]);

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Помилка отримання особистих результатів' });
    }
});

module.exports = router;