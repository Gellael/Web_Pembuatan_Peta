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

    const { kabupaten } = req.query; 

    if (!kabupaten) {
        return res.status(400).json({ error: "Pilih kabupaten terlebih dahulu." });
    }

    try {
        const query = `
            SELECT jsonb_build_object(
                'type',     'FeatureCollection',
                'features', COALESCE(jsonb_agg(features.feature), '[]'::jsonb)
            ) as geojson
            FROM (
              SELECT jsonb_build_object(
                'type',       'Feature',
                'geometry',   ST_AsGeoJSON(geom)::jsonb,
                'properties', to_jsonb(inputs) - 'geom'
              ) AS feature
              FROM (
                SELECT * FROM batas_wilayah 
                WHERE wadmkk ILIKE $1 OR kabupaten ILIKE $1 OR remark ILIKE $1
              ) inputs
            ) features;
        `;

        const { rows } = await pool.query(query, [`%${kabupaten}%`]);
        
        res.status(200).json(rows[0].geojson);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Gagal mengambil data dari database" });
    }
};