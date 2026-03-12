const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Помилка підключення до бази даних:', err.stack);
    } else {
        console.log('Успішне підключення до бази даних PostgreSQL!');
    }
    if (release) release(); 
});

module.exports = pool;