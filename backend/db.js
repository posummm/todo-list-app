const mysql = require('mysql2');
require('dotenv').config();

// Membuat koneksi pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Konversi ke promise
const promisePool = pool.promise();

// Test koneksi
async function testConnection() {
    try {
        const connection = await promisePool.getConnection();
        console.log('✅ Database connected successfully');
        console.log(`📊 Database: ${process.env.DB_NAME}`);

        // Test query untuk memastikan tabel ada
        const [rows] = await promisePool.query('SELECT COUNT(*) as total FROM tasks');
        console.log(`📋 Total tasks in database: ${rows[0].total}`);

        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('Please check:');
        console.log('1. Is MySQL running?');
        console.log('2. Is the database name correct? (ujian_pweb)');
        console.log('3. Are the credentials in .env correct?');
        return false;
    }
}

module.exports = {
    pool: promisePool,
    testConnection
};