require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes); 

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const courseRoutes = require('./routes/courses');
app.use('/api/courses', courseRoutes);

const assignmentRoutes = require('./routes/assignments');
app.use('/api/assignments', assignmentRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('Привіт! Сервер інформаційної системи успішно працює!');
});

app.listen(PORT, () => {
    console.log(`Сервер запущено на порту ${PORT}.`);
});