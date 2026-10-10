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
            // Mencari kolom provinsi dengan berbagai kemungkinan nama/huruf
            const queryProv = `
                SELECT DISTINCT COALESCE(wadmpr, WADMPR, provinsi, PROVINSI, '') AS provinsi 
                FROM batas_wilayah 
                WHERE COALESCE(wadmpr, WADMPR, provinsi, PROVINSI, '') != '' 
                ORDER BY provinsi ASC;
            `;
            const { rows } = await pool.query(queryProv);
            return res.status(200).json(rows.map(r => r.provinsi).filter(Boolean));
        } else {
            // Mencari kolom kabupaten berdasarkan provinsi
            const queryKab = `
                SELECT DISTINCT COALESCE(wadmkk, WADMKK, kabupaten, KABUPATEN, '') AS kabupaten 
                FROM batas_wilayah 
                WHERE (wadmpr ILIKE $1 OR WADMPR ILIKE $1 OR provinsi ILIKE $1 OR PROVINSI ILIKE $1)
                  AND COALESCE(wadmkk, WADMKK, kabupaten, KABUPATEN, '') != '' 
                ORDER BY kabupaten ASC;
            `;
            const { rows } = await pool.query(queryKab, [provinsi]);
            return res.status(200).json(rows.map(r => r.kabupaten).filter(Boolean));
        }
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Gagal mengambil data wilayah dari database" });
    }
};