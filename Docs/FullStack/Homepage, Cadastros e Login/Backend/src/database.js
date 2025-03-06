import mysql from 'mysql2/promise';
import 'dotenv/config';

// Cria um pool de conexões (recomendado para aplicações web)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export const query = async (sql, params) => {
    const connection = await pool.getConnection();
    try {
        const [results] = await connection.query(sql, params);
        return results;
    } finally {
        connection.release();
    }
};