const { Pool } = require('pg');

// Konfigurasi koneksi ke Aiven
// Konfigurasi koneksi ke Aiven (Tanpa connectionString agar SSL terbaca)
const pool = new Pool({
    user: 'avnadmin',
    password: 'YOUR_PASSWORD',
    host: 'pg-137069dd-bananaman46gt-a4c8.j.aivencloud.com',
    port: 22783,
    database: 'defaultdb',
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = async (req, res) => {
    // Mengizinkan akses dari web (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Nanti kita bisa menangkap nama kecamatan/kabupaten dari frontend di sini
    // const { kabupaten } = req.query; 

    try {
        // Query sakti PostGIS: Mengubah data tabel spasial langsung menjadi format GeoJSON
        const query = `
            SELECT jsonb_build_object(
                'type',     'FeatureCollection',
                'features', jsonb_agg(features.feature)
            ) as geojson
            FROM (
              SELECT jsonb_build_object(
                'type',       'Feature',
                'geometry',   ST_AsGeoJSON(geom)::jsonb,
                'properties', to_jsonb(inputs) - 'geom'
              ) AS feature
              FROM (
                SELECT * FROM batas_wilayah LIMIT 500
              ) inputs
            ) features;
        `;
        
        const { rows } = await pool.query(query);
        
        // Mengirimkan hasil GeoJSON ke web
        res.status(200).json(rows[0].geojson);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Gagal mengambil data dari database" });
    }
};