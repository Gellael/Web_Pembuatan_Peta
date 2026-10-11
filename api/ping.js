const { Pool } = require('pg');

const pool = new Pool({
    user: 'avnadmin',
    password: process.env.AIVEN_DB_PASSWORD,
    host: 'pg-137069dd-bananaman46gt-a4c8.j.aivencloud.com',
    port: 22783,
    database: 'defaultdb',
    ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const start = Date.now();
    
    try {
        // Melakukan kueri paling ringan untuk mengetes koneksi
        await pool.query('SELECT 1'); 
        const duration = Date.now() - start;
        
        res.status(200).json({ 
            status: "Sukses", 
            pesan: "Koneksi ke database Aiven terhubung dengan baik!", 
            ping: `${duration} ms` 
        });
    } catch (error) {
        console.error("Ping Error:", error);
        res.status(500).json({ 
            status: "Gagal", 
            pesan: "Tidak bisa terhubung ke database. Cek Password atau Koneksi Internet.", 
            error: error.message 
        });
    }
};