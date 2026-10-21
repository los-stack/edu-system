const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'false' ? false : {
    rejectUnauthorized: false 
  }
});

pool.on('connect', () => {
  console.log('Успішне підключення до PostgreSQL!');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};