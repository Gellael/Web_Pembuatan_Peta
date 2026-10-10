const { Pool } = require('pg');

const pool = new Pool({
    user: 'avnadmin',
    password: process.env.AIVEN_DB_PASSWORD,
    host: 'pg-137069dd-bananaman46gt-a4c8.j.aivencloud.com',
    port: 22783,
    database: 'defaultdb',
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { provinsi } = req.query;

    try {
        if (!provinsi) {
            // Ambil daftar provinsi unik dari database
            const queryProv = `
                SELECT DISTINCT "WADMPR" AS provinsi 
                FROM batas_wilayah 
                WHERE "WADMPR" IS NOT NULL 
                ORDER BY provinsi ASC;
            `;
            const { rows } = await pool.query(queryProv);
            return res.status(200).json(rows.map(r => r.provinsi));
        } else {
            // Ambil daftar kabupaten/kota unik berdasarkan provinsi yang dipilih
            const queryKab = `
                SELECT DISTINCT "WADMKK" AS kabupaten 
                FROM batas_wilayah 
                WHERE "WADMPR" ILIKE $1 AND "WADMKK" IS NOT NULL 
                ORDER BY kabupaten ASC;
            `;
            const { rows } = await pool.query(queryKab, [provinsi]);
            return res.status(200).json(rows.map(r => r.kabupaten));
        }
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Gagal mengambil data wilayah dari database" });
    }
};