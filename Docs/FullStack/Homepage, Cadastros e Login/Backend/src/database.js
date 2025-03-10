import mysql from 'mysql2/promise';
import 'dotenv/config';


const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

(async () => {
    try {
        const connection = await pool.getConnection();
        console.log("IN");
        connection.release();
        
    } catch (error) {
        console.error("Erro de conexão: ", error);
        process.exit(1);
    }
})();

export { pool };